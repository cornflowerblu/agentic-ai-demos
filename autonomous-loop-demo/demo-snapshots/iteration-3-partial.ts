import { Router, Request, Response } from 'express';
import { Product, CreateProductRequest, UpdateProductRequest, ApiResponse } from '../types';

const router = Router();

// In-memory storage
let products: Product[] = [];
let nextId = 1;

/**
 * GET /api/products
 * Returns all products
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: products
  });
});

/**
 * GET /api/products/:id
 * Returns a specific product by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: `Product with id ${id} not found`
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

/**
 * POST /api/products
 * Creates a new product
 */
router.post('/', (req: Request, res: Response) => {
  const { name, price, category } = req.body as CreateProductRequest;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'name is required and must be a non-empty string'
    });
  }

  if (price === undefined || price === null || typeof price !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'price is required and must be a number'
    });
  }

  if (price <= 0) {
    return res.status(400).json({
      success: false,
      error: 'price must be positive'
    });
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'category is required and must be a non-empty string'
    });
  }

  // Create new product
  const newProduct: Product = {
    id: nextId++,
    name: name.trim(),
    price,
    category: category.trim(),
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);

  res.status(201).json({
    success: true,
    data: newProduct
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
