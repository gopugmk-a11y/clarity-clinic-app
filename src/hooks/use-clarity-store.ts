"use client";

import { useState, useEffect, useCallback } from 'react';
import { type Transaction, type Prescription, type InventoryItem, type Currency, currencies } from '@/types';
import { sampleTransactions } from '@/lib/seed-data';
import { useToast } from './use-toast';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

type ClarityStore = {
  transactions: Transaction[];
  prescriptions: Prescription[];
  inventory: InventoryItem[];
  currency: Currency;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrency: (currency: Currency) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addPrescription: (p: Omit<Prescription, 'id'>) => void;
  deletePrescription: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  deleteInventoryItem: (id: string) => void;
  seedData: () => void;
  clearData: () => void;
};

export const useClarityStore = (): ClarityStore => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('clarity.transactions', []);
  const [prescriptions, setPrescriptions] = useLocalStorage<Prescription[]>('clarity.prescriptions', []);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('clarity.inventory', []);
  const [currency, setCurrency] = useLocalStorage<Currency>('clarity.currency', currencies[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: crypto.randomUUID() };
    setTransactions([newTx, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  const addPrescription = (p: Omit<Prescription, 'id'>) => {
    const newP = { ...p, id: crypto.randomUUID() };
    setPrescriptions([newP, ...prescriptions]);
  };

  const deletePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setInventory([newItem, ...inventory]);
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
  };
  
  const seedData = useCallback(() => {
    const currentIds = new Set(transactions.map(t => `${t.date}|${t.amount}|${t.type}|${t.category}`));
    const newTxs = sampleTransactions.filter(t => !currentIds.has(`${t.date}|${t.amount}|${t.type}|${t.category}`));
    const updatedTxs = [...transactions, ...newTxs].sort((a,b)=> (a.date < b.date ? 1 : -1));
    setTransactions(updatedTxs);
    toast({ title: "Sample Data Loaded", description: `${newTxs.length} new transactions have been added.` });
  }, [transactions, setTransactions, toast]);

  const clearData = useCallback(() => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      setTransactions([]);
      setPrescriptions([]);
      setInventory([]);
      toast({ title: "All Data Cleared", description: "Your local data has been removed." });
    }
  }, [setTransactions, setPrescriptions, setInventory, toast]);

  return {
    transactions,
    prescriptions,
    inventory,
    currency,
    searchQuery,
    setSearchQuery,
    setCurrency,
    addTransaction,
    deleteTransaction,
    addPrescription,
    deletePrescription,
    addInventoryItem,
    deleteInventoryItem,
    seedData,
    clearData,
  };
};

// Create a context to provide the store to the entire app
type ClarityStoreContextType = ClarityStore | null;
const ClarityStoreContext = React.createContext<ClarityStoreContextType>(null);

export const ClarityStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useClarityStore();
  return <ClarityStoreContext.Provider value={store}>{children}</ClarityStoreContext.Provider>;
};

export const useClarity = () => {
  const context = React.useContext(ClarityStoreContext);
  if (!context) {
    throw new Error('useClarity must be used within a ClarityStoreProvider');
  }
  return context;
};

// Helper for dynamic loading
import React from 'react';
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ClarityStoreProvider>
      {isClient ? children : null}
    </ClarityStoreProvider>
  );
};
