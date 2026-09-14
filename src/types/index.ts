export interface Product {
  id: number;
  active?: boolean;
  name: string;
  category: string;
  price: number;
  cost: number;
  description: string;
  image?: string;
  stock: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao' | 'outro';
  customerName?: string;
  customerId?: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface User {
  id: number;
  email: string;
  password: string;
}

export interface Customer {
  id: number;
  active?: boolean;
  name: string;
  phone: string;
  city: string;
  email: string;
  address: string;
  obs: string;
}
