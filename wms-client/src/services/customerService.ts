import { coreApi } from './api';
import type { Customer, ApiResponse } from '../types';

export const customerService = {
  getCustomers: () => coreApi.get<ApiResponse<Customer[]>>('/customers'),
  getCustomer: (id: string) => coreApi.get<ApiResponse<Customer>>(`/customers/${id}`),
  createCustomer: (data: Partial<Customer>) => coreApi.post<ApiResponse<Customer>>('/customers', data),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    coreApi.put<ApiResponse<Customer>>(`/customers/${id}`, data),
  deleteCustomer: (id: string) => coreApi.delete<ApiResponse<void>>(`/customers/${id}`),
};
