/**
 * Product interface
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create product request body
 */
export interface CreateProductRequest {
  name: string;
  price: number;
  category: string;
}

/**
 * Update product request body
 */
export interface UpdateProductRequest {
  name?: string;
  price?: number;
  category?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
