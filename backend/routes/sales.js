const express = require('express');
const router = express.Router();
const { client, databaseName, containerName, salesContainerName } = require('../db/cosmosClient');

// ==========================
// ✅ GET CONTAINERS
// ==========================
function getProductsContainer() {
  return client.database(databaseName).container(containerName);
}

function getSalesContainer() {
  return client.database(databaseName).container(salesContainerName);
}

// ==========================
// ✅ MIDDLEWARE
// ==========================
const requireEmail = (req, res, next) => {
  const email = req.headers['x-user-email'];
  if (!email) {
    return res.status(401).json({ error: "User not logged in" });
  }
  req.userEmail = email;
  next();
};

// ==========================
// ✅ RECORD SALE
// ==========================
router.post('/', requireEmail, async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;

    if (!productId || !quantitySold) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const qty = Number(quantitySold);

    const productsContainer = getProductsContainer();
    const salesContainer = getSalesContainer();

    // Get products
    const { resources } = await productsContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.userEmail = @email",
        parameters: [{ name: "@email", value: req.userEmail }]
      })
      .fetchAll();

    const product = resources.find(p => String(p.id) === String(productId));

    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    if (product.quantity < qty) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    // Update stock
    product.quantity -= qty;
    await productsContainer.items.upsert(product);

    // Create sale
    const sale = {
      id: Date.now().toString(),
      userEmail: req.userEmail,
      productId: product.id,
      productName: product.name,
      quantitySold: qty,
      totalAmount: qty * (product.price || 0),
      date: new Date().toISOString()
    };

    await salesContainer.items.create(sale);

    res.status(200).json({ message: "Sale recorded successfully" });

  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ error: "Failed to process sale" });
  }
});

// ==========================
// ✅ TODAY SALES
// ==========================
router.get('/today', requireEmail, async (req, res) => {
  try {
    const salesContainer = getSalesContainer();

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { resources } = await salesContainer.items
      .query({
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
      })
      .fetchAll();

    res.json(resources);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch today's sales" });
  }
});

// ==========================
// ✅ ALL SALES (IMPORTANT)
// ==========================
router.get('/all', requireEmail, async (req, res) => {
  try {
    const salesContainer = getSalesContainer();

    const { resources } = await salesContainer.items
      .query({
        query: `
          SELECT * FROM c 
          WHERE c.userEmail = @email
        `,
        parameters: [
          { name: "@email", value: req.userEmail }
        ]
      })
      .fetchAll();

    res.json(resources);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch all sales" });
  }
});

module.exports = router;