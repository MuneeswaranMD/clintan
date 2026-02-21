export type UserRole =
  | 'SUPER_ADMIN'      // Platform owner
  | 'COMPANY_ADMIN'    // Company owner
  | 'BRANCH_MANAGER'   // Branch manager
  | 'ACCOUNTANT'       // Finance team
  | 'SALES'            // Sales team
  | 'WAREHOUSE'        // Inventory team
  | 'VIEWER';          // Read-only access

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoPlacement: 'left' | 'center' | 'right';
  invoiceTemplate: string;
  fontStyle: string;
  footerMessage?: string;
  signatureUrl?: string;
  customDomain?: string;
  hideBranding: boolean;
}

export interface TaxConfig {
  taxType: 'GST' | 'VAT' | 'Sales Tax';
  taxMode: 'Inclusive' | 'Exclusive';
  defaultTaxPercentage: number;
  taxSlabs?: { name: string; percentage: number }[];
  gstin?: string;
  stateCode?: string;
  enableHSN: boolean;
  reverseCharge: boolean;
  einvoiceEnabled: boolean;
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode?: string;
  upiId?: string;
  qrCodeUrl?: string;
  razorpayKey?: string;
  stripeKey?: string;
  enablePaymentLink: boolean;
  enablePartialPayments: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  logoUrl?: string;

  // Role & Permissions
  role: UserRole;
  companyId?: string;
  branchId?: string;

  // Multi-Branch Support (for admins)
  allowedBranches?: Branch[];

  // Enabled Modules (from company config)
  enabledModules?: string[];

  // Subscription Plan
  plan?: 'BASIC' | 'PRO' | 'ENTERPRISE';
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
  customFields?: Record<string, any>; // Extensible fields
}

export interface Supplier {
  id: string;
  supplierId: string; // Formatting like SUP-101
  name: string;
  contactPerson?: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  status: 'ACTIVE' | 'INACTIVE';
  userId: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poId: string; // PO-1001
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Partial' | 'Received' | 'Cancelled';
  notes?: string;
  userId: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  paymentId: string; // SP-1001
  poId: string;
  supplierId: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed';
  paymentMethod: string;
  date: string;
  userId: string;
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

export type ItemType = 'PRODUCT' | 'SERVICE' | 'CUSTOM';

export interface OrderItem {
  id: string;
  itemId?: string; // Optional for custom items
  name: string;
  type: ItemType;
  quantity: number;
  price: number;
  taxPercentage: number;
  discount: number;
  subtotal: number; // (price * quantity)
  total: number; // (subtotal + tax - discount)
  trackStock?: boolean; // New: Per-item stock tracking
}

export interface PricingSummary {
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
}

export type FieldType = 'text' | 'number' | 'email' | 'textarea' | 'date' | 'select' | 'checkbox';

export interface OrderFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select inputs
  placeholder?: string;
  section?: 'basic' | 'project' | 'shipping' | 'custom';
  visibleIf?: {
    field: string;
    value: any;
  };
}

export interface OrderFormConfig {
  id?: string;
  userId: string; // Creates the 'Per Company' link
  companyName?: string;
  fields: OrderFieldConfig[];

  // Modular Sections Toggle
  enableProducts: boolean;
  enableServices: boolean;
  enableCustomItems: boolean;
  enableTax: boolean;
  enableDiscount: boolean;
  enableStock: boolean;
  enableDispatch: boolean;
  enableAttachments: boolean;
  enableProjectDetails: boolean;

  currency: string;
  defaultTaxPercentage?: number;
  termsAndConditions?: string;
  formName?: string;
  logoUrl?: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string; // Mapped from dynamic fields if present, or standard
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customFields?: Record<string, any>; // Store extra dynamic field data here
  items: OrderItem[];
  pricingSummary?: PricingSummary;
  totalAmount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: OrderStatus;
  orderDate: string; // ISO String
  paymentMethod?: string;
  notes?: string;
  source?: string;
  estimateId?: string; // Link to estimate if created
  userId: string;
  discount?: number;
  channel?: 'WEBSITE' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'MANUAL_ENTRY' | 'API'; // Omnichannel tracking
  createdAt?: string;
  stockDeducted?: boolean; // Track if stock has been deducted for this order
  templateId?: string; // Selected PDF template ID
  syncStatus?: 'PENDING' | 'SYNCED' | 'FAILED';
  externalOrderId?: string;
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
  templateId?: string;
  userId: string;
  customFields?: Record<string, any>;
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
  templateId?: string;
  userId: string;
  customFields?: Record<string, any>;
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
  customFields?: Record<string, any>;
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

export interface Settings {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  website?: string;
  logoUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  defaultTaxPercentage?: number;
  n8nWebhookUrl?: string;
  razorpayKey?: string;
  whatsappPhoneId?: string;
  whatsappToken?: string;
  emailFrom?: string;
  defaultTemplateId?: string;
  userId: string;
  webhookUrl?: string; // For incoming order sync
  apiKey?: string; // API Key for authentication
}
export interface CartItem {
  product: Product;
  quantity: number;
}
interface Cart {
  items: CartItem[];
  total: number;
}

// SaaS Configuration Types

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[]; // For select type
  required?: boolean;
  defaultValue?: any;
}

export interface FeatureToggles {
  // Core Modules (Always Available)
  enableDashboard: boolean; // Always true
  enableOrders: boolean; // Always true
  enableInvoices: boolean; // Always true
  enablePayments: boolean; // Always true
  enableCustomers: boolean; // Always true
  enableAnalytics: boolean; // Always true
  enableExpenses: boolean; // Always true
  enableSettings: boolean; // Always true

  // Conditional Modules (Industry-Specific)
  enableEstimates: boolean; // Construction, Agency, Wholesale
  enableInventory: boolean; // Retail, Manufacturing, Wholesale
  enableProducts: boolean; // Product catalog management

  enableSuppliers: boolean; // Retail, Manufacturing, Wholesale
  enablePurchaseManagement: boolean; // Manufacturing, Retail
  enableDispatch: boolean; // Retail, Wholesale

  // Advanced Modules (Optional)
  enableAutomation: boolean; // All (Premium feature)
  enableEmployees: boolean; // Growing businesses

  // Feature Flags
  enableManufacturing: boolean; // BOM, Production tracking
  enableRecurringBilling: boolean; // Subscription businesses
  enableLoyaltyPoints: boolean; // Retail
  enableAdvancedAnalytics: boolean; // Premium tier
  enableMultiBranch: boolean; // Enterprise
  enableWhatsAppIntegration: boolean; // All
  enablePaymentGateway: boolean; // All
  enableProjectManagement: boolean; // Construction, Agencies
  enableServiceManagement: boolean; // Clinic, Salon, Service centers
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: string;
  nextSteps: string[]; // IDs of allowed next steps
  color?: string;
}

export interface BusinessConfig {
  userId: string;
  industry: 'Freelancer' | 'Retail' | 'Manufacturing' | 'Tours' | 'Service' | 'Wholesale' | 'Construction' | 'Clinic' | 'Generic';
  currency: string;
  dateFormat: string;

  // Feature Flags
  enabledModules?: string[]; // Derived from Tenant root for UI navigation
  features: FeatureToggles;

  // Custom Field Definitions
  customFields: {
    product?: CustomFieldDefinition[];
    invoice?: CustomFieldDefinition[];
    estimate?: CustomFieldDefinition[];
    customer?: CustomFieldDefinition[];
  };

  // Workflow Configuration
  workflows: {
    order?: WorkflowStep[];
    estimate?: WorkflowStep[];
  };

  taxName: string; // GST, VAT, Sales Tax
  orderFormConfig?: OrderFormConfig;

  // New Profile Fields
  companyLegalName?: string;
  companyAddress?: string;
  businessType?: string;
  cin?: string;
  registrationDate?: string;
  timezone?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  companySealUrl?: string;

  branding?: BrandingConfig;
  taxConfig?: TaxConfig;
  bankDetails?: BankDetails;
  branches?: Branch[];
  documents?: {
    gstCertificate?: string;
    panCard?: string;
    businessLicense?: string;
    cancelledCheque?: string;
    idProof?: string;
  };
  verification?: {
    status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected';
    rejectionReason?: string;
    verifiedBy?: string;
    verifiedAt?: string;
    submittedAt?: string;
  };

  preferences?: {
    invoicePrefix: string;
    estimatePrefix: string;
    autoNumbering: boolean;
    defaultDueDays: number;
    currencyFormat: string;
    dateFormat: string;
    enableWhatsApp: boolean;
    enableEmail: boolean;
  };
  subscription?: {
    planId: string;
    planName: string;
    limits: {
      users: number;
      branches: number;
      invoicesPerMonth: number;
      storageGB: number;
      extraDomains: number;
    };
    expiresAt?: string;
  };
}

export interface Tenant {
  id: string;
  companyName: string;
  subdomain: string;
  customDomain?: string;
  isDomainVerified: boolean;
  industry: BusinessConfig['industry'] | string;
  plan: string;
  status: 'Active' | 'Pending' | 'Suspended';
  ownerEmail: string;
  createdAt: string;
  usersCount: number;
  mrr: string;
  userId?: string; // Auth UID of the company owner
  phone?: string;
  logoUrl?: string;
  enabledModules?: string[];
  config?: BusinessConfig;
  dnsConfig?: {
    type: 'CNAME';
    host: string;
    pointsTo: string;
    status: 'Verified' | 'Pending' | 'Failed';
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  description: string;
  features: FeatureToggles;
  limits: {
    users: number;
    branches: number;
    invoicesPerMonth: number;
    storageGB: number;
    extraDomains: number;
  };
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  isPopular?: boolean;
}