export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Operator' | 'Warehouse' | 'User' | 'Customer';
  customerId?: string;
  customerName?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: Category;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  returnedQuantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'ordering' | 'completed' | 'rejected';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
