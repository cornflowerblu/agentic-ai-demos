import { Router, Request, Response } from 'express';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types';

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
router.get('/:id', (req: Request, res: Response): void => {
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idParam || '', 10);
  const product = products.find(p => p.id === id);

  if (!product) {
    res.status(404).json({
      success: false,
      error: `Product with id ${id} not found`
    });
    return;
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
router.post('/', (req: Request, res: Response): void => {
  const { name, price, category } = req.body as CreateProductRequest;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({
      success: false,
      error: 'name is required and must be a non-empty string'
    });
    return;
  }

  if (price === undefined || price === null || typeof price !== 'number') {
    res.status(400).json({
      success: false,
      error: 'price is required and must be a number'
    });
    return;
  }

  if (price <= 0) {
    res.status(400).json({
      success: false,
      error: 'price must be positive'
    });
    return;
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    res.status(400).json({
      success: false,
      error: 'category is required and must be a non-empty string'
    });
    return;
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
router.put('/:id', (req: Request, res: Response): void => {
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idParam || '', 10);
  const product = products.find(p => p.id === id);

  if (!product) {
    res.status(404).json({
      success: false,
      error: `Product with id ${id} not found`
    });
    return;
  }

  const { name, price, category } = req.body as UpdateProductRequest;

  // Validate update data if provided
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'name must be a non-empty string'
      });
      return;
    }
    product.name = name.trim();
  }

  if (price !== undefined) {
    if (typeof price !== 'number' || price <= 0) {
      res.status(400).json({
        success: false,
        error: 'price must be a positive number'
      });
      return;
    }
    product.price = price;
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'category must be a non-empty string'
      });
      return;
    }
    product.category = category.trim();
  }

  // Update timestamp
  product.updatedAt = new Date().toISOString();

  res.status(200).json({
    success: true,
    data: product
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
router.delete('/:id', (req: Request, res: Response): void => {
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idParam || '', 10);
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    res.status(404).json({
      success: false,
      error: `Product with id ${id} not found`
    });
    return;
  }

  // Remove the product from the array
  products.splice(productIndex, 1);

  res.status(200).json({
    success: true,
    message: `Product with id ${id} deleted successfully`
  });
});

export default router;
