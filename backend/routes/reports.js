const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { client, databaseName, salesContainerName } = require('../db/cosmosClient');
const { uploadBufferToBlob } = require('../db/blobClient');

// ==========================
// GET SALES CONTAINER
// ==========================
function getSalesContainer() {
  return client.database(databaseName).container(salesContainerName);
}

// ==========================
// MIDDLEWARE
// ==========================
const requireEmail = (req, res, next) => {
  const email = req.headers['x-user-email'];
  if (!email) {
    return res.status(401).json({ error: "Unauthorized: Missing x-user-email header" });
  }
  req.userEmail = email;
  next();
};

// ==========================
// GENERATE REPORT (UPDATED)
// ==========================
router.post('/generate', requireEmail, async (req, res) => {
  try {
    const salesContainer = getSalesContainer();

    const { type } = req.body; // ✅ "today" or "total"

    let querySpec;

    // ==========================
    // TODAY FILTER
    // ==========================
    if (type === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      querySpec = {
        query: `
          SELECT * FROM c 
          WHERE c.userEmail = @email
          AND c.date >= @start
          AND c.date <= @end
        `,
        parameters: [
          { name: "@email", value: req.userEmail },
          { name: "@start", value: start.toISOString() },
          { name: "@end", value: end.toISOString() }
        ]
      };

    } else {
      // ==========================
      // TOTAL SALES (TILL NOW)
      // ==========================
      querySpec = {
        query: `
          SELECT * FROM c 
          WHERE c.userEmail = @email
        `,
        parameters: [
          { name: "@email", value: req.userEmail }
        ]
      };
    }

    // ==========================
    // FETCH DATA
    // ==========================
    const { resources: sales } =
      await salesContainer.items.query(querySpec).fetchAll();

    // ==========================
    // CALCULATIONS
    // ==========================
    const totalOrders = sales.length;

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + (sale.totalAmount || 0),
      0
    );

    // ==========================
    // PDF GENERATION
    // ==========================
    const doc = new PDFDocument({ margin: 50 });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    const pdfPromise = new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    // Title
    doc.fontSize(20).text(
      type === 'today' ? 'Daily Sales Report' : 'Total Sales Report',
      { align: 'center' }
    );

    doc.moveDown();

    // Info
    doc.fontSize(12).text(`User: ${req.userEmail}`);
    doc.text(`Report Type: ${type === 'today' ? 'Today' : 'Till Now'}`);
    doc.moveDown();

    // Summary
    doc.text(`Total Orders: ${totalOrders}`);
    doc.text(`Total Revenue: Rs. ${totalRevenue}`);
    doc.moveDown(2);

    // ==========================
    // DATA LIST
    // ==========================
    if (sales.length === 0) {
      doc.text('No sales found.', { align: 'center', italic: true });
    } else {
      doc.fontSize(14).text('Sales Details:', { underline: true });
      doc.moveDown();

      sales.forEach((sale, index) => {
        doc.fontSize(10).text(`${index + 1}. ${sale.productName}`);
        doc.text(
          `   Qty: ${sale.quantitySold} | Amount: Rs. ${sale.totalAmount} | ${new Date(sale.date).toLocaleString('en-IN')}`
        );
        doc.moveDown(0.5);
      });
    }

    doc.end();

    // ==========================
    // FINAL BUFFER
    // ==========================
    const pdfBuffer = await pdfPromise;

    // ==========================
    // UPLOAD TO AZURE
    // ==========================
    const fileName = `sales-report-${type}-${Date.now()}.pdf`;

    const blobUrl = await uploadBufferToBlob(
      pdfBuffer,
      fileName,
      'application/pdf'
    );

    // ==========================
    // RESPONSE
    // ==========================
    res.status(200).json({
      message: "Report generated successfully",
      reportUrl: blobUrl
    });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      error: "Failed to generate report. Check server or Azure config."
    });
  }
});

module.exports = router;