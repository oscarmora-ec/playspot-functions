// Import Azure Functions and Cosmos DB libraries
const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Create Cosmos DB client using connection string from settings
// process.env reads from local.settings.json locally
// and from Azure App Settings when deployed
const client = new CosmosClient(process.env.COSMOS_CONNECTION);

// Reference to our specific database and container
const database = client.database('playspot-database');
const container = database.container('activities');

// Define our HTTP trigger function
app.http('GetActivities', {
    
    // Accept GET requests only since we are reading data
    methods: ['GET'],
    
    // Anonymous means anyone can call this without authentication
    authLevel: 'anonymous',
    
    // This is the main function that runs when called
    handler: async (request, context) => {
        
        // Log that function was triggered
        context.log('GetActivities function triggered');

        try {
            // Query all activities from Cosmos DB
            // This is the same query we ran in the portal
            const querySpec = {
                query: 'SELECT * FROM activities'
            };

            // Execute the query
            const { resources: activities } = await container.items
                .query(querySpec)
                .fetchAll();

            // Log how many activities we found
            context.log(`Found ${activities.length} activities`);

            // Return activities as JSON response
            return {
                status: 200,
                headers: {
                    // Allow PlaySpot frontend to call this API
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                // Convert activities array to JSON string
                body: JSON.stringify(activities)
            };

        } catch (error) {
            // If something goes wrong log the error
            context.log.error('Error reading from Cosmos DB:', error);

            // Return error response
            return {
                status: 500,
                body: JSON.stringify({ 
                    error: 'Failed to retrieve activities',
                    details: error.message 
                })
            };
        }
    }
});