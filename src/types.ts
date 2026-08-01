// Domain models (schema)
// Customer, Supplier, CustomerTransaction, SupplierTransaction

export type TransactionKind = 'debt' | 'payment';
export type SupplierTransactionKind = 'goods' | 'payment';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  agentName: string;
  phone: string;
  notes: string;
  createdAt: number;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  // debt = customer owes us; payment = customer paid back
  kind: TransactionKind;
  amount: number;
  description: string;
  date: number; // epoch ms
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  // goods = we owe the supplier; payment = we paid the supplier
  kind: SupplierTransactionKind;
  amount: number;
  description: string;
  invoice: string;
  date: number;
}

export interface AppData {
  customers: Customer[];
  suppliers: Supplier[];
  customerTransactions: CustomerTransaction[];
  supplierTransactions: SupplierTransaction[];
  version: number;
}

export const EMPTY_DATA: AppData = {
  customers: [],
  suppliers: [],
  customerTransactions: [],
  supplierTransactions: [],
  version: 1,
};

// Navigation
export type TabKey = 'home' | 'customers' | 'suppliers' | 'settings';
export type Screen =
  | { name: 'home' }
  | { name: 'customers' }
  | { name: 'customer-detail'; id: string }
  | { name: 'suppliers' }
  | { name: 'supplier-detail'; id: string }
  | { name: 'settings' };

// Utilities
export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const formatCurrency = (n: number) => {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(abs);
  return formatted;
};

export const formatDate = (ts: number) => {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatShortDate = (ts: number) => {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('ar-EG', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// Balance helpers
export function customerBalance(
  customer: Customer,
  txs: CustomerTransaction[]
): number {
  // positive = customer owes us
  return txs
    .filter((t) => t.customerId === customer.id)
    .reduce((acc, t) => acc + (t.kind === 'debt' ? t.amount : -t.amount), 0);
}

export function supplierBalance(
  supplier: Supplier,
  txs: SupplierTransaction[]
): number {
  // positive = we owe supplier
  return txs
    .filter((t) => t.supplierId === supplier.id)
    .reduce((acc, t) => acc + (t.kind === 'goods' ? t.amount : -t.amount), 0);
}
