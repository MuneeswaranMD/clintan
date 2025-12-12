export interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
}

export enum InvoiceStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue'
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  date: string; // ISO Date string
  dueDate: string; // ISO Date string
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface SalesData {
  month: string;
  amount: number;
}

export interface DashboardStats {
  totalSales: number;
  totalInvoices: number;
  pendingAmount: number;
  paidInvoices: number;
}