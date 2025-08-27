
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Archive,
  CalendarClock,
  CircleHelp,
  FileText,
  Home,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useClarity } from '@/hooks/use-clarity-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { currencies } from '@/types';
import { Separator } from '../ui/separator';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/appointments', label: 'Appointments', icon: CalendarClock },
  { href: '/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/inventory', label: 'Inventory', icon: Archive },
  { href: '/patients', label: 'Patients', icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currency, setCurrency, seedData, clearData } = useClarity();

  return (
    <aside className="sticky top-0 h-screen w-64 flex-col border-r bg-gradient-to-b from-[#0d1424] to-[#0b1220] p-4 shadow-[0_1px_12px_rgba(34,211,238,0.07)] hidden md:flex">
      <div className="flex items-center gap-3">
        <Logo className="h-10 w-10" />
        <div>
          <h1 className="text-xl font-bold text-white">ClarityClinic</h1>
          <p className="text-xs text-muted-foreground">Doctor Finance Demo</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className={cn(
                'justify-start gap-3 text-base h-11',
                isActive && 'bg-primary/20 text-primary-foreground border border-primary/30 hover:bg-primary/25'
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
         <Button asChild variant="ghost" className="justify-start gap-3 h-11 text-base">
          <Link href="/transactions/add">
            <Plus className="h-5 w-5" />
            Add Transaction
          </Link>
        </Button>
        <Separator className="my-2" />
        <Button onClick={seedData} variant="outline" className="justify-start gap-3">
          <Upload className="h-4 w-4" /> Load Sample Data
        </Button>
        <Button onClick={clearData} variant="destructive" className="justify-start gap-3">
          <Trash2 className="h-4 w-4" /> Clear All Data
        </Button>
        <Separator className="my-2" />
        <div>
          <label className="text-xs font-medium text-muted-foreground">Currency</label>
          <Select
            value={currency.value}
            onValueChange={(val) => {
              const newCurrency = currencies.find((c) => c.value === val);
              if (newCurrency) setCurrency(newCurrency);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground/80">
          Your entries are stored locally in this demo.
        </p>
      </div>
    </aside>
  );
}
