import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AppData,
  Customer,
  CustomerTransaction,
  EMPTY_DATA,
  Screen,
  Supplier,
  SupplierTransaction,
  uid,
} from './types';

const STORAGE_KEY = 'grocery_ledger_data_v1';

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DATA;
    const parsed = JSON.parse(raw) as AppData;
    return { ...EMPTY_DATA, ...parsed };
  } catch {
    return EMPTY_DATA;
  }
}

function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save', e);
  }
}

interface AppContextValue {
  data: AppData;
  screen: Screen;
  navigate: (s: Screen) => void;
  goBack: () => void;
  // customers
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // suppliers
  addSupplier: (c: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  // customer txs
  addCustomerTx: (t: Omit<CustomerTransaction, 'id'>) => void;
  deleteCustomerTx: (id: string) => void;
  // supplier txs
  addSupplierTx: (t: Omit<SupplierTransaction, 'id'>) => void;
  deleteSupplierTx: (id: string) => void;
  // backup
  exportBackup: () => void;
  importBackup: (file: File) => Promise<void>;
  clearAll: () => void;
  // toast
  toast: string;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<AppData>(() => loadData());
  const [history, setHistory] = useState<Screen[]>([{ name: 'home' }]);
  const screen = history[history.length - 1];
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    saveData(data);
  }, [data]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  }, []);

  const navigate = useCallback((s: Screen) => {
    setHistory((h) => [...h, s]);
  }, []);
  const goBack = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  const addCustomer: AppContextValue['addCustomer'] = useCallback((c) => {
    const nc: Customer = {
      ...c,
      id: uid(),
      createdAt: Date.now(),
    };
    setData((d) => ({ ...d, customers: [nc, ...d.customers] }));
    return nc;
  }, []);

  const updateCustomer: AppContextValue['updateCustomer'] = useCallback(
    (id, patch) => {
      setData((d) => ({
        ...d,
        customers: d.customers.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      }));
    },
    []
  );

  const deleteCustomer: AppContextValue['deleteCustomer'] = useCallback(
    (id) => {
      setData((d) => ({
        ...d,
        customers: d.customers.filter((c) => c.id !== id),
        customerTransactions: d.customerTransactions.filter(
          (t) => t.customerId !== id
        ),
      }));
    },
    []
  );

  const addSupplier: AppContextValue['addSupplier'] = useCallback((s) => {
    const ns: Supplier = { ...s, id: uid(), createdAt: Date.now() };
    setData((d) => ({ ...d, suppliers: [ns, ...d.suppliers] }));
    return ns;
  }, []);

  const updateSupplier: AppContextValue['updateSupplier'] = useCallback(
    (id, patch) => {
      setData((d) => ({
        ...d,
        suppliers: d.suppliers.map((s) =>
          s.id === id ? { ...s, ...patch } : s
        ),
      }));
    },
    []
  );

  const deleteSupplier: AppContextValue['deleteSupplier'] = useCallback(
    (id) => {
      setData((d) => ({
        ...d,
        suppliers: d.suppliers.filter((s) => s.id !== id),
        supplierTransactions: d.supplierTransactions.filter(
          (t) => t.supplierId !== id
        ),
      }));
    },
    []
  );

  const addCustomerTx: AppContextValue['addCustomerTx'] = useCallback((t) => {
    const nt: CustomerTransaction = {
      ...t,
      id: uid(),
      date: t.date || Date.now(),
    };
    setData((d) => ({
      ...d,
      customerTransactions: [nt, ...d.customerTransactions],
    }));
  }, []);

  const deleteCustomerTx: AppContextValue['deleteCustomerTx'] = useCallback(
    (id) => {
      setData((d) => ({
        ...d,
        customerTransactions: d.customerTransactions.filter(
          (t) => t.id !== id
        ),
      }));
    },
    []
  );

  const addSupplierTx: AppContextValue['addSupplierTx'] = useCallback((t) => {
    const nt: SupplierTransaction = {
      ...t,
      id: uid(),
      date: t.date || Date.now(),
    };
    setData((d) => ({
      ...d,
      supplierTransactions: [nt, ...d.supplierTransactions],
    }));
  }, []);

  const deleteSupplierTx: AppContextValue['deleteSupplierTx'] = useCallback(
    (id) => {
      setData((d) => ({
        ...d,
        supplierTransactions: d.supplierTransactions.filter((t) => t.id !== id),
      }));
    },
    []
  );

  const exportBackup: AppContextValue['exportBackup'] = useCallback(() => {
    setData((current) => {
      const blob = new Blob([JSON.stringify(current, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return current;
    });
  }, []);

  const importBackup: AppContextValue['importBackup'] = useCallback(
    async (file: File) => {
      const text = await file.text();
      const parsed = JSON.parse(text) as AppData;
      setData({ ...EMPTY_DATA, ...parsed });
    },
    []
  );

  const clearAll = useCallback(() => {
    setData(EMPTY_DATA);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      screen,
      navigate,
      goBack,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addCustomerTx,
      deleteCustomerTx,
      addSupplierTx,
      deleteSupplierTx,
      exportBackup,
      importBackup,
      clearAll,
      toast,
      showToast,
    }),
    [
      data,
      screen,
      navigate,
      goBack,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addCustomerTx,
      deleteCustomerTx,
      addSupplierTx,
      deleteSupplierTx,
      exportBackup,
      importBackup,
      clearAll,
      toast,
      showToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
