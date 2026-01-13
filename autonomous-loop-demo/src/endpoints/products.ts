import { Router, Request, Response } from 'express';
import { Product, CreateProductRequest, UpdateProductRequest, ApiResponse } from '../types';

const router = Router();

// In-memory storage
let products: Product[] = [];
let nextId = 1;

/**
 * GET /api/products
 * Returns all products
 *
 * TODO: Implement this endpoint
 * - Should return 200 with array of products
 * - Response format: { success: true, data: Product[] }
 */
router.get('/', (_req: Request, res: Response) => {
  // TODO: Implement GET all products
  res.status(501).json({
    success: false,
    error: 'Not Implemented'
  });
});

/**
 * GET /api/products/:id
 * Returns a specific product by ID
 *
 * TODO: Implement this endpoint
 * - Should return 200 with product if found
 * - Should return 404 if product not found
 * - Response format: { success: true, data: Product } or { success: false, error: string }
 */
router.get('/:id', (req: Request, res: Response) => {
  // TODO: Implement GET product by ID
  res.status(501).json({
    success: false,
    error: 'Not Implemented'
  });
});

/**
 * POST /api/products
 * Creates a new product
 *
 * TODO: Implement this endpoint
 * - Validate required fields: name, price, category
 * - Validate price is positive
 * - Generate new ID and timestamps
 * - Return 201 with created product
 * - Return 400 if validation fails
 * - Response format: { success: true, data: Product }
 */
router.post('/', (req: Request, res: Response) => {
  // TODO: Implement POST create product
  res.status(501).json({
    success: false,
    error: 'Not Implemented'
  });
});

/**
 * PUT /api/products/:id
 * Updates an existing product
 *
 * TODO: Implement this endpoint
 * - Find product by ID
 * - Validate update data if provided
 * - Update fields and timestamp
 * - Return 200 with updated product
 * - Return 404 if product not found
 * - Return 400 if validation fails
 * - Response format: { success: true, data: Product }
 */
router.put('/:id', (req: Request, res: Response) => {
  // TODO: Implement PUT update product
  res.status(501).json({
    success: false,
    error: 'Not Implemented'
  });
});

/**
 * DELETE /api/products/:id
 * Deletes a product
 *
 * TODO: Implement this endpoint
 * - Find and remove product by ID
 * - Return 200 with success message
 * - Return 404 if product not found
 * - Response format: { success: true, message: string }
 */
router.delete('/:id', (req: Request, res: Response) => {
  // TODO: Implement DELETE product
  res.status(501).json({
    success: false,
    error: 'Not Implemented'
  });
});

export default router;
