import axios, { AxiosInstance } from 'axios';
import { readFileSync, existsSync } from 'fs';
import * as path from 'path';

describe('Products API Integration Tests (Live AWS)', () => {
  let api: AxiosInstance;
  let apiUrl: string;
  const createdProductIds: string[] = [];

  beforeAll(() => {
    // Read API URL from CDK outputs
    const outputsPath = path.join(__dirname, '../../cdk-outputs.json');

    if (!existsSync(outputsPath)) {
      throw new Error(
        'cdk-outputs.json not found. Run "npm run deploy" first to deploy the stack.'
      );
    }

    const outputs = JSON.parse(readFileSync(outputsPath, 'utf-8'));
    const stackOutputs = outputs.ProductsStack;

    if (!stackOutputs || !stackOutputs.ApiUrl) {
      throw new Error('ApiUrl not found in CDK outputs');
    }

    apiUrl = stackOutputs.ApiUrl;
    console.log(`Testing against: ${apiUrl}`);

    api = axios.create({
      baseURL: apiUrl,
      validateStatus: () => true, // Don't throw on 4xx/5xx
      timeout: 10000
    });
  });

  afterAll(async () => {
    // Cleanup: delete all test products
    console.log(`\nCleaning up ${createdProductIds.length} test products...`);
    for (const id of createdProductIds) {
      try {
        await api.delete(`/products/${id}`);
      } catch (error) {
        console.warn(`Failed to cleanup product ${id}:`, error);
      }
    }
  });

  describe('GET /products', () => {
    it('should return empty array initially or array of products', async () => {
      const response = await api.get('/products');

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should return all products after creation', async () => {
      // Create a test product
      const createResponse = await api.post('/products', {
        name: 'Test Product',
        price: 29.99,
        category: 'Electronics'
      });

      if (createResponse.data.data?.id) {
        createdProductIds.push(createResponse.data.data.id);
      }

      const response = await api.get('/products');

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.length).toBeGreaterThanOrEqual(1);

      const found = response.data.data.some((p: any) =>
        p.name === 'Test Product' && p.price === 29.99
      );
      expect(found).toBe(true);
    });
  });

  describe('GET /products/{id}', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await api.get('/products/non-existent-id-12345');

      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toBeDefined();
    });

    it('should return a specific product by ID', async () => {
      // Create a product first
      const createResponse = await api.post('/products', {
        name: 'Laptop',
        price: 999.99,
        category: 'Electronics'
      });

      expect(createResponse.status).toBe(201);
      const productId = createResponse.data.data.id;
      createdProductIds.push(productId);

      // Get the product
      const response = await api.get(`/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(productId);
      expect(response.data.data.name).toBe('Laptop');
      expect(response.data.data.price).toBe(999.99);
      expect(response.data.data.category).toBe('Electronics');
      expect(response.data.data.createdAt).toBeDefined();
    });
  });

  describe('POST /products', () => {
    it('should create a new product successfully', async () => {
      const newProduct = {
        name: 'Smartphone',
        price: 699.99,
        category: 'Electronics'
      };

      const response = await api.post('/products', newProduct);

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.name).toBe(newProduct.name);
      expect(response.data.data.price).toBe(newProduct.price);
      expect(response.data.data.category).toBe(newProduct.category);
      expect(response.data.data.id).toBeDefined();
      expect(response.data.data.createdAt).toBeDefined();

      createdProductIds.push(response.data.data.id);
    });

    it('should return 400 if name is missing', async () => {
      const response = await api.post('/products', {
        price: 99.99,
        category: 'Electronics'
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error.toLowerCase()).toContain('name');
    });

    it('should return 400 if price is missing', async () => {
      const response = await api.post('/products', {
        name: 'Product',
        category: 'Electronics'
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error.toLowerCase()).toContain('price');
    });

    it('should return 400 if price is negative', async () => {
      const response = await api.post('/products', {
        name: 'Product',
        price: -10,
        category: 'Electronics'
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error.toLowerCase()).toContain('price');
    });

    it('should return 400 if category is missing', async () => {
      const response = await api.post('/products', {
        name: 'Product',
        price: 99.99
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error.toLowerCase()).toContain('category');
    });
  });

  describe('PUT /products/{id}', () => {
    it('should update an existing product', async () => {
      // Create a product first
      const createResponse = await api.post('/products', {
        name: 'Old Name',
        price: 50,
        category: 'Books'
      });

      const productId = createResponse.data.data.id;
      createdProductIds.push(productId);

      // Update the product
      const updatedData = {
        name: 'New Name',
        price: 75,
        category: 'Updated Books'
      };

      const response = await api.put(`/products/${productId}`, updatedData);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(productId);
      expect(response.data.data.name).toBe(updatedData.name);
      expect(response.data.data.price).toBe(updatedData.price);
      expect(response.data.data.category).toBe(updatedData.category);
      expect(response.data.data.updatedAt).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await api.put('/products/non-existent-id-67890', {
        name: 'Test',
        price: 50,
        category: 'Test'
      });

      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    });

    it('should return 400 if update data is invalid', async () => {
      // Create a product first
      const createResponse = await api.post('/products', {
        name: 'Product',
        price: 50,
        category: 'Test'
      });

      const productId = createResponse.data.data.id;
      createdProductIds.push(productId);

      // Try to update with invalid price
      const response = await api.put(`/products/${productId}`, {
        name: 'Updated',
        price: -100,
        category: 'Test'
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });

  describe('DELETE /products/{id}', () => {
    it('should delete an existing product', async () => {
      // Create a product first
      const createResponse = await api.post('/products', {
        name: 'To Delete',
        price: 25,
        category: 'Test'
      });

      const productId = createResponse.data.data.id;

      // Delete the product
      const deleteResponse = await api.delete(`/products/${productId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data.success).toBe(true);
      expect(deleteResponse.data.message).toBeDefined();
      expect(deleteResponse.data.message.toLowerCase()).toContain('delete');

      // Verify it's gone
      const getResponse = await api.get(`/products/${productId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await api.delete('/products/non-existent-id-99999');

      expect(response.status).toBe(404);
      expect(response.data.success).toBe(false);
    });
  });

  describe('Data Persistence', () => {
    it('should maintain products across multiple operations', async () => {
      // Create multiple products
      const product1 = await api.post('/products', {
        name: 'Product 1',
        price: 10,
        category: 'A'
      });
      createdProductIds.push(product1.data.data.id);

      const product2 = await api.post('/products', {
        name: 'Product 2',
        price: 20,
        category: 'B'
      });
      createdProductIds.push(product2.data.data.id);

      const product3 = await api.post('/products', {
        name: 'Product 3',
        price: 30,
        category: 'C'
      });
      createdProductIds.push(product3.data.data.id);

      // Verify all are present
      const response = await api.get('/products');
      expect(response.data.data.length).toBeGreaterThanOrEqual(3);

      const ids = response.data.data.map((p: any) => p.id);
      expect(ids).toContain(product1.data.data.id);
      expect(ids).toContain(product2.data.data.id);
      expect(ids).toContain(product3.data.data.id);
    });
  });
});
