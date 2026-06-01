import { orderApi } from './api';
import type { Order, ApiResponse } from '../types';

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
}

export const orderService = {
  getOrders: () => orderApi.get<ApiResponse<Order[]>>('/orders'),
  getOrder: (id: string) => orderApi.get<ApiResponse<Order>>(`/orders/${id}`),
  createOrder: (data: CreateOrderRequest) =>
    orderApi.post<ApiResponse<Order>>('/orders', data),
};
