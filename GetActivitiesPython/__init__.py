# PlaySpot GetActivities - Python Azure Function
# Same functionality as our Node.js function
# but written in Python

import logging
import json
import os
import azure.functions as func
from azure.cosmos import CosmosClient

# get connection string from environment variable
COSMOS_CONNECTION = os.environ.get("COSMOS_CONNECTION")
DATABASE_NAME = "playspot-database"
CONTAINER_NAME = "activities"

# main function - runs when HTTP request is received
def main(req: func.HttpRequest) -> func.HttpResponse:
    
    # log that function was triggered
    logging.info('GetActivities Python function triggered')

    try:
        # connect to Cosmos DB
        client = CosmosClient.from_connection_string(COSMOS_CONNECTION)
        database = client.get_database_client(DATABASE_NAME)
        container = database.get_container_client(CONTAINER_NAME)

        # query all activities
        query = "SELECT * FROM activities"
        items = list(container.query_items(
            query=query,
            enable_cross_partition_query=True
        ))

        # log how many found
        logging.info(f"Found {len(items)} activities")

        # return activities as JSON response
        return func.HttpResponse(
            body=json.dumps(items),
            status_code=200,
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        )

    except Exception as e:
        # log the error
        logging.error(f"Error: {str(e)}")

        # return error response
        return func.HttpResponse(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={
                "Content-Type": "application/json"
            }
        )