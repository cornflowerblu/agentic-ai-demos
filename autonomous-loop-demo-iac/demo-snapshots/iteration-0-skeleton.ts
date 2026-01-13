import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME!;

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Lambda handler for Products API
 * Routes requests based on HTTP method and path
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const method = event.httpMethod;
  const path = event.path;
  const pathParts = path.split('/').filter(Boolean);

  try {
    // Route: GET /products - List all products
    if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'products') {
      // TODO: Implement listProducts()
      return notImplemented('GET /products');
    }

    // Route: GET /products/{id} - Get product by ID
    if (method === 'GET' && pathParts.length === 2 && pathParts[0] === 'products') {
      const id = pathParts[1];
      // TODO: Implement getProduct(id)
      return notImplemented('GET /products/{id}');
    }

    // Route: POST /products - Create new product
    if (method === 'POST' && pathParts.length === 1 && pathParts[0] === 'products') {
      // TODO: Implement createProduct(body)
      return notImplemented('POST /products');
    }

    // Route: PUT /products/{id} - Update product
    if (method === 'PUT' && pathParts.length === 2 && pathParts[0] === 'products') {
      const id = pathParts[1];
      // TODO: Implement updateProduct(id, body)
      return notImplemented('PUT /products/{id}');
    }

    // Route: DELETE /products/{id} - Delete product
    if (method === 'DELETE' && pathParts.length === 2 && pathParts[0] === 'products') {
      const id = pathParts[1];
      // TODO: Implement deleteProduct(id)
      return notImplemented('DELETE /products/{id}');
    }

    // No matching route
    return errorResponse(404, 'Not Found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

/**
 * TODO: Implement listProducts()
 * Use ScanCommand to get all products from DynamoDB
 * Return: { statusCode: 200, body: { success: true, data: Product[] } }
 */

/**
 * TODO: Implement getProduct(id: string)
 * Use GetCommand to fetch product by ID
 * Return 404 if not found
 * Return: { statusCode: 200, body: { success: true, data: Product } }
 */

/**
 * TODO: Implement createProduct(body: any)
 * Validate: name (required), price (required, positive), category (required)
 * Generate: id (UUID), createdAt (ISO timestamp)
 * Use PutCommand to store in DynamoDB
 * Return: { statusCode: 201, body: { success: true, data: Product } }
 */

/**
 * TODO: Implement updateProduct(id: string, body: any)
 * Validate update data
 * Set updatedAt timestamp
 * Use UpdateCommand to update in DynamoDB
 * Return 404 if not found
 * Return: { statusCode: 200, body: { success: true, data: Product } }
 */

/**
 * TODO: Implement deleteProduct(id: string)
 * Use DeleteCommand to remove from DynamoDB
 * Return 404 if not found
 * Return: { statusCode: 200, body: { success: true, message: string } }
 */

// Helper functions

function notImplemented(endpoint: string): APIGatewayProxyResult {
  return {
    statusCode: 501,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: false,
      error: `Not Implemented: ${endpoint}`
    })
  };
}

function errorResponse(statusCode: number, error: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({ success: false, error })
  };
}

function successResponse(statusCode: number, data: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({ success: true, data })
  };
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };
}
