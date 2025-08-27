

export type Transaction = {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  patientName?: string;
  patientId?: string;
  phone?: string;
  payment: string;
  notes?: string;
};

export const transactionCategories = [
  "Consultation", "Procedure", "Diagnostics", "Pharmacy", "Supplies", "Rent", "Utilities", "Staff", "Misc"
] as const;

export type Prescription = {
  id: string;
  date: string;
  doctor: string;
  patient: string;
  medicine: string;
  notes?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  batch: string;
  expiry: string;
  quantity: number;
  price?: number;
  supplier?: string;
};

export const appointmentStatuses = ["Confirmed", "Completed", "Cancelled"] as const;

export type Appointment = {
    id: string;
    date: string;
    time: string;
    patient: string;
    doctor: string;
    reason: string;
    status: (typeof appointmentStatuses)[number];
    notes?: string;
}

export type Currency = {
  value: 'INR' | 'USD' | 'EUR' | 'GBP';
  label: string;
  symbol: string;
  locale: string;
};

export const currencies: Currency[] = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹', locale: 'en-IN' },
  { value: 'USD', label: 'USD ($)', symbol: '$', locale: 'en-US' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€', locale: 'de-DE' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£', locale: 'en-GB' },
];
