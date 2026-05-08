const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

app.http('lowStockAlert', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('HTTP trigger function executing lowStockAlert...');

        try {
            const endpoint = process.env.COSMOS_ENDPOINT;
            const key = process.env.COSMOS_KEY;
            
            if (!endpoint || !key) {
                return { status: 500, body: "Cosmos DB credentials missing in Azure Environment Variables." };
            }

            const client = new CosmosClient({ endpoint, key });
            const database = client.database(process.env.DATABASE_NAME || "InventoryDB");
            const container = database.container(process.env.CONTAINER_NAME || "Products");

            // Query items with stock < 10
            const querySpec = {
                query: "SELECT * from c WHERE c.stock < 10"
            };

            const { resources: lowStockItems } = await container.items.query(querySpec).fetchAll();

            if (lowStockItems.length > 0) {
                const message = `Alert! ${lowStockItems.length} products are running low on stock.`;
                context.log(message);
                
                return {
                    status: 200,
                    jsonBody: {
                        message: message,
                        alerts: lowStockItems.map(item => ({
                            name: item.name,
                            currentStock: item.stock
                        }))
                    }
                };
            } else {
                return {
                    status: 200,
                    jsonBody: { message: "Inventory is healthy. No low stock items." }
                };
            }
        } catch (error) {
            context.log.error("Error connecting to Cosmos DB:", error);
            return {
                status: 500,
                body: "An error occurred while checking stock in Cosmos DB."
            };
        }
    }
});
