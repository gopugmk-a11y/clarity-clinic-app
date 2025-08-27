import { Transaction } from "@/types";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);

export const sampleTransactions: Omit<Transaction, 'id'>[] = [
  { date: iso(new Date(today.getFullYear(), today.getMonth() - 2, 3)), type: 'Income', amount: 800, category: 'Consultation', patientName: 'Shreya Iyer', patientId: 'P-1001', phone: '90000 11111', payment: 'UPI', notes: 'General checkup' },
  { date: iso(new Date(today.getFullYear(), today.getMonth() - 2, 9)), type: 'Expense', amount: 250, category: 'Supplies', patientName: '', patientId: '', phone: '', payment: 'Card', notes: 'Syringes & gloves' },
  { date: iso(new Date(today.getFullYear(), today.getMonth() - 1, 12)), type: 'Income', amount: 4000, category: 'Procedure', patientName: 'Arjun Patel', patientId: 'P-1002', phone: '90000 22222', payment: 'Card', notes: 'Minor surgery' },
  { date: iso(new Date(today.getFullYear(), today.getMonth() - 1, 15)), type: 'Expense', amount: 1500, category: 'Staff', patientName: '', patientId: '', phone: '', payment: 'Bank Transfer', notes: 'Assistant salary (partial)' },
  { date: iso(new Date(today.getFullYear(), today.getMonth() - 1, 22)), type: 'Income', amount: 1200, category: 'Diagnostics', patientName: 'Neha Gupta', patientId: 'P-1003', phone: '90000 33333', payment: 'Cash', notes: 'ECG + Lab' },
  { date: iso(new Date(today.getFullYear(), today.getMonth(), 5)), type: 'Expense', amount: 2200, category: 'Rent', payment: 'Bank Transfer', notes: 'Clinic rent' },
  { date: iso(new Date(today.getFullYear(), today.getMonth(), 6)), type: 'Expense', amount: 650, category: 'Utilities', payment: 'UPI', notes: 'Electricity + Water bill for the clinic' },
  { date: iso(new Date(today.getFullYear(), today.getMonth(), 7)), type: 'Income', amount: 900, category: 'Consultation', patientName: 'Rahul Kumar', patientId: 'P-1004', phone: '90000 44444', payment: 'UPI', notes: 'Follow-up consultation regarding previous treatment' },
  { date: iso(new Date(today.getFullYear(), today.getMonth(), 11)), type: 'Income', amount: 1400, category: 'Pharmacy', patientName: 'Aisha Khan', patientId: 'P-1005', phone: '90000 55555', payment: 'Cash', notes: 'Post-op medications and prescribed drugs' },
  { date: iso(new Date(today.getFullYear(), today.getMonth(), 14)), type: 'Expense', amount: 300, category: 'Supplies', payment: 'Card', notes: 'Bandages and sterile dressings' }
];
