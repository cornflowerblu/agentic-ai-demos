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
      return await listProducts();
    }

    // Route: GET /products/{id} - Get product by ID
    if (method === 'GET' && pathParts.length === 2 && pathParts[0] === 'products') {
      const id = pathParts[1];
      return await getProduct(id);
    }

    // Route: POST /products - Create new product
    if (method === 'POST' && pathParts.length === 1 && pathParts[0] === 'products') {
      const body = event.body ? JSON.parse(event.body) : {};
      return await createProduct(body);
    }

    // Route: PUT /products/{id} - Update product
    if (method === 'PUT' && pathParts.length === 2 && pathParts[0] === 'products') {
      const id = pathParts[1];
      const body = event.body ? JSON.parse(event.body) : {};
      return await updateProduct(id, body);
    }

    // Route: DELETE /products/{id} - Delete product
    if (method === 'DELETE' && pathParts.length === 2 && pathParts[0] === 'products') {
      const id = pathParts[1];
      return await deleteProduct(id);
    }

    // No matching route
    return errorResponse(404, 'Not Found');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

/**
 * List all products from DynamoDB
 * Uses ScanCommand to retrieve all items
 */
async function listProducts(): Promise<APIGatewayProxyResult> {
  try {
    const command = new ScanCommand({
      TableName: tableName
    });

    const result = await docClient.send(command);
    const products = result.Items || [];

    return successResponse(200, products);
  } catch (error) {
    console.error('Error listing products:', error);
    return errorResponse(500, 'Failed to list products');
  }
}

/**
 * Get a single product by ID
 * Uses GetCommand to fetch from DynamoDB
 * Returns 404 if product not found
 */
async function getProduct(id: string): Promise<APIGatewayProxyResult> {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id }
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return errorResponse(404, 'Product not found');
    }

    return successResponse(200, result.Item);
  } catch (error) {
    console.error('Error getting product:', error);
    return errorResponse(500, 'Failed to get product');
  }
}

/**
 * Create a new product
 * Validates required fields and stores in DynamoDB
 */
async function createProduct(body: any): Promise<APIGatewayProxyResult> {
  try {
    // Validate name
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return errorResponse(400, 'Name is required and must be a non-empty string');
    }

    // Validate price
    if (body.price === undefined || body.price === null) {
      return errorResponse(400, 'Price is required');
    }
    if (typeof body.price !== 'number' || body.price <= 0) {
      return errorResponse(400, 'Price must be a positive number');
    }

    // Validate category
    if (!body.category || typeof body.category !== 'string' || body.category.trim() === '') {
      return errorResponse(400, 'Category is required and must be a non-empty string');
    }

    // Create product with generated fields
    const product: Product = {
      id: randomUUID(),
      name: body.name.trim(),
      price: body.price,
      category: body.category.trim(),
      createdAt: new Date().toISOString()
    };

    // Store in DynamoDB
    const command = new PutCommand({
      TableName: tableName,
      Item: product
    });

    await docClient.send(command);

    return successResponse(201, product);
  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse(500, 'Failed to create product');
  }
}

/**
 * Update an existing product
 */
async function updateProduct(id: string, body: any): Promise<APIGatewayProxyResult> {
  try {
    // First, check if product exists
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { id }
    });

    const existing = await docClient.send(getCommand);

    if (!existing.Item) {
      return errorResponse(404, `Product with id ${id} not found`);
    }

    // Validate update data
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return errorResponse(400, 'Name must be a non-empty string');
      }
    }

    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return errorResponse(400, 'Price must be a positive number');
      }
    }

    if (body.category !== undefined) {
      if (typeof body.category !== 'string' || body.category.trim() === '') {
        return errorResponse(400, 'Category must be a non-empty string');
      }
    }

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (body.name !== undefined) {
      updateExpressions.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = body.name.trim();
    }

    if (body.price !== undefined) {
      updateExpressions.push('#price = :price');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = body.price;
    }

    if (body.category !== undefined) {
      updateExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = body.category.trim();
    }

    // Always set updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(updateCommand);

    return successResponse(200, result.Attributes as Product);
  } catch (error) {
    console.error('Error updating product:', error);
    return errorResponse(500, 'Failed to update product');
  }
}

/**
 * Delete a product
 */
async function deleteProduct(id: string): Promise<APIGatewayProxyResult> {
  try {
    // First, check if product exists
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { id }
    });

    const existing = await docClient.send(getCommand);

    if (!existing.Item) {
      return errorResponse(404, `Product with id ${id} not found`);
    }

    // Delete the product
    const deleteCommand = new DeleteCommand({
      TableName: tableName,
      Key: { id }
    });

    await docClient.send(deleteCommand);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: true,
        message: 'Product deleted successfully'
      })
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return errorResponse(500, 'Failed to delete product');
  }
}

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
