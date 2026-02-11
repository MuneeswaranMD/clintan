export interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  logoUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  description?: string;
  type: 'Product' | 'Service';
  imageUrl?: string;
  userId: string;

  pricing: {
    costPrice: number;
    sellingPrice: number;
    taxPercentage: number;
  };

  inventory: {
    stock: number;
    minStockLevel: number;
    reorderQuantity: number;
    status: 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISABLED';
  };

  supplierId?: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  supplierId: string; // Formatting like SUP-101
  name: string;
  phone: string;
  email: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  userId: string;
  createdAt: string;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  EstimateSent = 'Estimate Sent',
  EstimateAccepted = 'Estimate Accepted',
  EstimateRejected = 'Estimate Rejected',
  Paid = 'Paid',
  Processing = 'Processing',
  Dispatched = 'Dispatched',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending';
  orderStatus: OrderStatus;
  orderDate: string;
  paymentMethod: string;
  notes?: string;
  source?: string;
  estimateId?: string; // Link to estimate if created
  userId: string;
}

export enum InvoiceStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  PartiallyPaid = 'Partially Paid',
  Overdue = 'Overdue',
  Draft = 'Draft',
  Sent = 'Sent'
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
  date: string; // ISO Date string
  dueDate: string; // ISO Date string
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount?: number;
  customerAddress?: string;
  customerEmail?: string;
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

export interface Estimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  date: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  validUntil: string;
  notes?: string;
  discount?: number;
  tax?: number;
  items?: InvoiceItem[];
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderId?: string; // Link to source order if created from order
  userId: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  method: string;
  status: 'Success' | 'Failed' | 'Pending';
  date: string;
  userId: string;
}

export interface RecurringInvoice {
  id: string;
  templateName: string;
  customerName: string;
  amount: number;
  interval: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  nextRun: string;
  status: 'Active' | 'Paused';
  userId: string;
}

export interface CheckoutLink {
  id: string;
  name: string;
  amount: number;
  currency: string;
  url: string;
  status: 'Active' | 'Archived';
  views: number;
  sales: number;
  userId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  company?: string;
  userId: string;
  gst?: string;
  createdAt?: any;
}

export type StockMovementType = 'ADD' | 'DEDUCT' | 'ADJUST' | 'RETURN' | 'DAMAGED';

export interface StockLog {
  id: string;
  productId: string;
  orderId?: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  userId: string;
}