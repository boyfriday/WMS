import { orderApi } from './api';
import type { Order, ApiResponse } from '../types';

export interface CreateOrderRequest {
  customerId: string;
  items: { productId: string; quantity: number }[];
}

export const orderService = {
  getOrders: () => orderApi.get<ApiResponse<Order[]>>('/orders'),
  getOrder: (id: string) => orderApi.get<ApiResponse<Order>>(`/orders/${id}`),
  createOrder: (data: CreateOrderRequest) =>
    orderApi.post<ApiResponse<Order>>('/orders', data),
  updateStatus: (id: string, status: string) =>
    orderApi.put<ApiResponse<Order>>(`/orders/${id}/status`, { status }),
  claimItems: (id: string, items: { productId: string; quantity: number }[]) =>
    orderApi.post<ApiResponse<Order>>(`/orders/${id}/claim`, { items }),
};
