require('dotenv').config();

// Initialize Azure Monitor (Application Insights) if connection string is provided
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    const appInsights = require('applicationinsights');
    appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .start();
    console.log("Azure Monitor (Application Insights) initialized.");
}

const express = require('express');
const cors = require('cors');

const productsRoute = require('./routes/products');
const authRoute = require('./routes/auth');
const salesRoute = require('./routes/sales');
const reportsRoute = require('./routes/reports');

const app = express();
// Ensure backend runs on process.env.PORT for Azure App Service
const PORT = process.env.PORT || 5000;

// Enable CORS properly for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000']
}));

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Connect Routes
app.use('/api/products', productsRoute);
app.use('/api/auth', authRoute);
app.use('/api/sales', salesRoute);
app.use('/api/reports', reportsRoute);

// Basic health check route
app.get('/', (req, res) => {
  res.send('Smart Inventory Backend API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
