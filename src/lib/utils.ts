import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Currency } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number, currency: Currency) => {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.value,
  }).format(amount);
};
