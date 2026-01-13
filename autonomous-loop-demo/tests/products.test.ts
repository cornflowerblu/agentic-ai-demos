import request from 'supertest';
import app from '../src/app';

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('should return an empty array initially', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: [] });
    });

    it('should return all products after some are created', async () => {
      // Create a product first
      await request(app)
        .post('/api/products')
        .send({ name: 'Test Product', price: 29.99, category: 'Electronics' });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        name: 'Test Product',
        price: 29.99,
        category: 'Electronics'
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return a specific product by ID', async () => {
      // Create a product
      const createResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Laptop', price: 999.99, category: 'Electronics' });

      const productId = createResponse.body.data.id;

      // Get the product
      const response = await request(app).get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: productId,
        name: 'Laptop',
        price: 999.99,
        category: 'Electronics'
      });
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const newProduct = {
        name: 'Smartphone',
        price: 699.99,
        category: 'Electronics'
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(newProduct);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ price: 99.99, category: 'Electronics' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('name');
    });

    it('should return 400 if price is missing', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Product', category: 'Electronics' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('price');
    });

    it('should return 400 if price is negative', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Product', price: -10, category: 'Electronics' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('price');
    });

    it('should return 400 if category is missing', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Product', price: 99.99 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('category');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product', async () => {
      // Create a product first
      const createResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Old Name', price: 50, category: 'Books' });

      const productId = createResponse.body.data.id;

      // Update the product
      const updatedData = {
        name: 'New Name',
        price: 75,
        category: 'Updated Books'
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updatedData);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/999')
        .send({ name: 'Test', price: 50, category: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if update data is invalid', async () => {
      // Create a product first
      const createResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Product', price: 50, category: 'Test' });

      const productId = createResponse.body.data.id;

      // Try to update with invalid price
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({ name: 'Updated', price: -100, category: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete an existing product', async () => {
      // Create a product first
      const createResponse = await request(app)
        .post('/api/products')
        .send({ name: 'To Delete', price: 25, category: 'Test' });

      const productId = createResponse.body.data.id;

      // Delete the product
      const response = await request(app).delete(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify it's gone
      const getResponse = await request(app).get(`/api/products/${productId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).delete('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Data Persistence', () => {
    it('should maintain product list across multiple operations', async () => {
      // Create multiple products
      await request(app)
        .post('/api/products')
        .send({ name: 'Product 1', price: 10, category: 'A' });

      await request(app)
        .post('/api/products')
        .send({ name: 'Product 2', price: 20, category: 'B' });

      await request(app)
        .post('/api/products')
        .send({ name: 'Product 3', price: 30, category: 'C' });

      // Verify all are present
      const response = await request(app).get('/api/products');
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });
});
