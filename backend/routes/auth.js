const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { client, databaseName, usersContainerName } = require('../db/cosmosClient');

function getUsersContainer() {
  return client.database(databaseName).container(usersContainerName);
}

// 1. POST /api/auth/signup -> Register new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields: name, email, password" });
    }

    const container = getUsersContainer();
    
    // Check if user already exists
    // We expect email to be the partition key for efficiency
    const querySpec = {
      query: "SELECT * from c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }]
    };
    
    const { resources: existingUsers } = await container.items.query(querySpec).fetchAll();
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password securely before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      name,
      email, // Recommended to be Partition Key
      password: hashedPassword
    };

    // Save to Cosmos DB
    await container.items.create(newUser);
    
    // Clean return profile without password
    const userProfile = { id: newUser.id, name: newUser.name, email: newUser.email };
    
    console.log(`Auth - User signed up successfully [${email}]`);
    res.status(201).json({ message: "User registered successfully", user: userProfile });
  } catch (error) {
    console.error("Auth - Error signing up:", error);
    res.status(500).json({ error: "Failed to sign up" });
  }
});

// 2. POST /api/auth/login -> Sign in existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields: email, password" });
    }

    const container = getUsersContainer();
    
    // Find the user by email
    const querySpec = {
      query: "SELECT * from c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }]
    };
    
    const { resources: users } = await container.items.query(querySpec).fetchAll();
    
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const user = users[0];

    // Securely compare plain password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Clean return profile without password
    const userProfile = { id: user.id, name: user.name, email: user.email };

    console.log(`Auth - User logged in successfully [${email}]`);
    res.status(200).json({ message: "Login successful", user: userProfile });
  } catch (error) {
    console.error("Auth - Error logging in:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
});

module.exports = router;
