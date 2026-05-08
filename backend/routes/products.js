const express = require('express');
const router = express.Router();
const { client, databaseName, containerName } = require('../db/cosmosClient');

function getContainer() {
  return client.database(databaseName).container(containerName);
}

// Middleware to extract userEmail
const requireEmail = (req, res, next) => {
  const email = req.headers['x-user-email'];
  if (!email) {
    return res.status(401).json({ error: "Unauthorized: Missing x-user-email header" });
  }
  req.userEmail = email;
  next();
};

// 1. GET /api/products -> Get all products FOR THIS USER
router.get('/', requireEmail, async (req, res) => {
  try {
    const container = getContainer();
    const querySpec = { 
      query: "SELECT * from c WHERE c.userEmail = @email",
      parameters: [{ name: "@email", value: req.userEmail }]
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    
    res.status(200).json(resources);
  } catch (error) {
    console.error("Azure Monitor - Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 2. POST /api/products -> Add product FOR THIS USER
router.post('/', requireEmail, async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const container = getContainer();
    
    const newItem = {
      id: Date.now().toString(),
      userEmail: req.userEmail, // Link to user
      name,
      category, 
      price: Number(price),
      stock: Number(stock),
      quantity: Number(stock) // Frontend React mapping alias
    };

    const { resource } = await container.items.create(newItem);
    console.log(`Azure Monitor - Product added successfully [${name}] by ${req.userEmail}`);
    res.status(201).json(resource);
  } catch (error) {
    console.error("Azure Monitor - Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// 3. PATCH /api/products/:id/sale -> Reduce stock after sale
router.patch('/:id/sale', requireEmail, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantitySold, category } = req.body; 
    
    if (!quantitySold || quantitySold <= 0) return res.status(400).json({ error: "Invalid quantitySold" });
    if (!category) return res.status(400).json({ error: "Category (partition key) is required" });

    const container = getContainer();
    const { resource: product } = await container.item(id, category).read();
    
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.userEmail !== req.userEmail) return res.status(403).json({ error: "Forbidden: Not your product" });
    if (product.stock < quantitySold) return res.status(400).json({ error: "Not enough stock" });

    product.stock -= quantitySold;
    product.quantity = product.stock; 
    
    const { resource: updatedProduct } = await container.item(id, category).replace(product);
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Azure Monitor - Error updating stock:", error);
    res.status(500).json({ error: "Failed to process sale" });
  }
});

// 4. DELETE /api/products/:id -> Delete product
router.delete('/:id', requireEmail, async (req, res) => {
  try {
    const { id } = req.params;
    const category = req.query.category;
    
    if (!category) return res.status(400).json({ error: "Category query parameter is required" });

    const container = getContainer();
    
    // Read first to ensure ownership
    const { resource: product } = await container.item(id, category).read();
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.userEmail !== req.userEmail) return res.status(403).json({ error: "Forbidden: Not your product" });

    await container.item(id, category).delete();
    
    console.log(`Azure Monitor - Product deleted [ID: ${id}] by ${req.userEmail}`);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Azure Monitor - Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
