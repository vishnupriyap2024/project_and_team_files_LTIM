export type UserRole = 'buyer' | 'seller';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sellerId: number;
}
