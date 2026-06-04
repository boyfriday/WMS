import { coreApi } from './api';
import type { Product, Category, ApiResponse } from '../types';

export const productService = {
  getProducts: () => coreApi.get<ApiResponse<Product[]>>('/products'),
  getProduct: (id: string) => coreApi.get<ApiResponse<Product>>(`/products/${id}`),
  createProduct: (data: Partial<Product>) => coreApi.post<ApiResponse<Product>>('/products', data),
  updateProduct: (id: string, data: Partial<Product>) =>
    coreApi.put<ApiResponse<Product>>(`/products/${id}`, data),
  deleteProduct: (id: string) => coreApi.delete<ApiResponse<void>>(`/products/${id}`),
  receiveStock: (id: string, quantity: number) =>
    coreApi.post<ApiResponse<void>>(`/products/${id}/receive-stock`, { quantity }),
};

export const categoryService = {
  getCategories: () => coreApi.get<ApiResponse<Category[]>>('/categories'),
  createCategory: (data: Partial<Category>) =>
    coreApi.post<ApiResponse<Category>>('/categories', data),
  updateCategory: (id: string, data: Partial<Category>) =>
    coreApi.put<ApiResponse<Category>>(`/categories/${id}`, data),
  deleteCategory: (id: string) => coreApi.delete<ApiResponse<void>>(`/categories/${id}`),
};
