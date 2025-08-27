
"use client";

import { useState, useEffect, useCallback } from 'react';
import { type Transaction, type Prescription, type InventoryItem, type Appointment, type Currency, currencies } from '@/types';
import { sampleTransactions } from '@/lib/seed-data';
import { useToast } from './use-toast';
import React from 'react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch,
  getDocs
} from "firebase/firestore";


type ClarityStore = {
  transactions: Transaction[];
  prescriptions: Prescription[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  currency: Currency;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrency: (currency: Currency) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addPrescription: (p: Omit<Prescription, 'id'>) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'price'> & { price?: number }) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addAppointment: (appt: Omit<Appointment, 'id'>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  seedData: () => Promise<void>;
  clearData: () => Promise<void>;
};

export const useClarityStore = (): ClarityStore => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currency, setCurrency] = useState<Currency>(currencies[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if(!db) return;
    const txQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
      const data: Transaction[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
    });

    const pQuery = query(collection(db, 'prescriptions'), orderBy('date', 'desc'));
    const unsubscribeP = onSnapshot(pQuery, (snapshot) => {
        const data: Prescription[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
        setPrescriptions(data);
    });

    const iQuery = query(collection(db, 'inventory'), orderBy('name', 'asc'));
    const unsubscribeI = onSnapshot(iQuery, (snapshot) => {
        const data: InventoryItem[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        setInventory(data);
    });

    const aQuery = query(collection(db, 'appointments'), orderBy('date', 'desc'));
    const unsubscribeA = onSnapshot(aQuery, (snapshot) => {
        const data: Appointment[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setAppointments(data);
    });

    return () => {
      unsubscribeTx();
      unsubscribeP();
      unsubscribeI();
      unsubscribeA();
    }
  }, []);


  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if(!db) return;
    await addDoc(collection(db, "transactions"), tx);
  };

  const deleteTransaction = async (id: string) => {
    if(!db) return;
    await deleteDoc(doc(db, "transactions", id));
  };

  const addPrescription = async (p: Omit<Prescription, 'id'>) => {
    if(!db) return;
    await addDoc(collection(db, "prescriptions"), p);
  };

  const deletePrescription = async (id: string) => {
    if(!db) return;
    await deleteDoc(doc(db, "prescriptions", id));
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'price'> & { price?: number }) => {
    if(!db) return;
    const { price, ...rest } = item;
    await addDoc(collection(db, "inventory"), rest);

    if (price && price > 0) {
      await addTransaction({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'Expense',
        amount: price,
        category: 'Supplies',
        payment: 'Cash', 
        notes: `Purchased ${item.quantity} x ${item.name}`,
      });
      toast({
        title: "Transaction Created",
        description: `An expense of ${price} for "${item.name}" has been recorded.`
      });
    }
  };

  const deleteInventoryItem = async (id: string) => {
    if(!db) return;
    await deleteDoc(doc(db, "inventory", id));
  };

  const addAppointment = async (appt: Omit<Appointment, 'id'>) => {
    if(!db) return;
    await addDoc(collection(db, "appointments"), appt);
  };

  const deleteAppointment = async (id: string) => {
    if(!db) return;
    await deleteDoc(doc(db, "appointments", id));
  };
  
  const seedData = useCallback(async () => {
    if(!db) {
        toast({ title: "Database not configured", description: "Please configure Firebase in src/lib/firebase.ts", variant: "destructive" });
        return;
    }
    try {
        const batch = writeBatch(db);
        sampleTransactions.forEach(tx => {
            const docRef = doc(collection(db, "transactions"));
            batch.set(docRef, tx);
        });
        await batch.commit();
        toast({ title: "Sample Data Loaded", description: `${sampleTransactions.length} new transactions have been added.` });
    } catch(error) {
        console.error("Error seeding data:", error);
        toast({ title: "Error", description: "Could not load sample data.", variant: "destructive" });
    }
  }, [toast]);

  const clearData = useCallback(async () => {
    if (!db || !window.confirm('Are you sure you want to delete ALL data from Firestore? This cannot be undone.')) {
        return;
    }
    try {
        const collections = ['transactions', 'prescriptions', 'inventory', 'appointments'];
        const batch = writeBatch(db);
        for (const c of collections) {
            const querySnapshot = await getDocs(collection(db, c));
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        await batch.commit();
        toast({ title: "All Data Cleared", description: "Your Firestore data has been removed." });
    } catch (error) {
        console.error("Error clearing data:", error);
        toast({ title: "Error", description: "Could not clear data.", variant: "destructive" });
    }
  }, [toast]);

  return {
    transactions,
    prescriptions,
    inventory,
    appointments,
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
    addAppointment,
    deleteAppointment,
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
