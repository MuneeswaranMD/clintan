import { Invoice, Product, InvoiceStatus, User } from '../types';

const STORAGE_KEYS = {
  INVOICES: 'Sivajoy Creatives_invoices',
  PRODUCTS: 'Sivajoy Creatives_products',
  USER: 'Sivajoy Creatives_user',
};

// Safe Storage Wrapper for environments where localStorage is restricted (e.g. sandboxed iframes)
const memoryStore: Record<string, string> = {};
const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // Fallback to memory store if localStorage is blocked
      return memoryStore[key] || null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Fallback to memory store if localStorage is blocked
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      delete memoryStore[key];
    }
  }
};

// Mock Data Generators
const generateMockProducts = (): Product[] => [
  { id: '1', name: 'Web Design Service', price: 1500, stock: 100, description: 'Basic website design package', userId: 'mock-user' },
  { id: '2', name: 'SEO Optimization', price: 500, stock: 999, description: 'Monthly SEO maintenance', userId: 'mock-user' },
  { id: '3', name: 'Hosting (Annual)', price: 120, stock: 999, description: 'Premium cloud hosting', userId: 'mock-user' },
  { id: '4', name: 'Logo Design', price: 300, stock: 50, description: 'Vector logo with 3 revisions', userId: 'mock-user' },
];

const generateMockInvoices = (): Invoice[] => {
  const now = new Date();
  const invoices: Invoice[] = [];

  // Generate data for the last 6 months
  for (let i = 0; i < 15; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 12)); // Spread out dates

    invoices.push({
      id: `inv_₹{i}`,
      invoiceNumber: `INV-₹{2024001 + i}`,
      customerName: [`Acme Corp`, `Globex`, `Soylent Corp`, `Initech`, `Umbrella Corp`][i % 5],
      customerEmail: `billing@example.com`,
      date: date.toISOString(),
      dueDate: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: i % 3 === 0 ? InvoiceStatus.Paid : (i % 4 === 0 ? InvoiceStatus.Overdue : InvoiceStatus.Pending),
      items: [
        { id: `item_₹{i}_1`, productId: '1', productName: 'Web Design Service', quantity: 1, price: 1500, total: 1500 }
      ],
      subtotal: 1500,
      tax: 150,
      total: 1650,
    });
  }
  return invoices;
};

// Data Service
export const DataService = {
  getProducts: (): Product[] => {
    const stored = storage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      const mocks = generateMockProducts();
      storage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mocks));
      return mocks;
    }
    return JSON.parse(stored);
  },

  saveProduct: (product: Product) => {
    const products = DataService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    storage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: (id: string) => {
    const products = DataService.getProducts().filter(p => p.id !== id);
    storage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getInvoices: (): Invoice[] => {
    const stored = storage.getItem(STORAGE_KEYS.INVOICES);
    if (!stored) {
      const mocks = generateMockInvoices();
      storage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(mocks));
      return mocks;
    }
    return JSON.parse(stored);
  },

  saveInvoice: (invoice: Invoice) => {
    const invoices = DataService.getInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id);
    if (index >= 0) {
      invoices[index] = invoice;
    } else {
      invoices.push(invoice);
    }
    storage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  deleteInvoice: (id: string) => {
    const invoices = DataService.getInvoices().filter(i => i.id !== id);
    storage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  getUser: (): User | null => {
    const stored = storage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  setUser: (user: User | null) => {
    if (user) {
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      storage.removeItem(STORAGE_KEYS.USER);
    }
  }
};