const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Read environment variables securely from .env
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;

// Create Cosmos DB client
const client = new CosmosClient({ endpoint, key });

// Export the client and names so they can be reused across routes
module.exports = {
  client,
  databaseName: process.env.DATABASE_NAME || "InventoryDB",
  containerName: process.env.CONTAINER_NAME || "Products",
  usersContainerName: process.env.USERS_CONTAINER_NAME || "Users",
  salesContainerName: process.env.SALES_CONTAINER_NAME || "Sales"
};
