
"use client";

import { useClarity } from "@/hooks/use-clarity-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Archive, BarChart, CalendarClock, Download, FileText, LayoutGrid, List, Menu, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Logo } from "../logo";
import { Separator } from "../ui/separator";

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/transactions', label: 'Transactions', icon: List },
    { href: '/appointments', label: 'Appointments', icon: CalendarClock },
    { href: '/prescriptions', label: 'Prescriptions', icon: FileText },
    { href: '/inventory', label: 'Inventory', icon: Archive },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/reports', label: 'Reports', icon: BarChart },
];

export function AppHeader() {
  const { searchQuery, setSearchQuery, transactions, prescriptions, inventory } = useClarity();
  
  const handleExport = () => {
    // In a real app, you might let the user choose what to export.
    // For now, we export transactions.
    if (transactions.length > 0) {
      // Lazy load to keep initial bundle small
      import('@/lib/csv').then(({ exportToCsv }) => {
        exportToCsv(`clarity-clinic-transactions-${new Date().toISOString().slice(0, 10)}.csv`, transactions);
      });
    } else {
      alert("No transactions to export.");
    }
  };


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
       <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col w-64 p-4 bg-gradient-to-b from-[#0d1424] to-[#0b1220]">
              <div className="flex items-center gap-3 mb-6">
                <Logo className="h-10 w-10" />
                <div>
                  <h1 className="text-xl font-bold text-white">ClarityClinic</h1>
                </div>
              </div>
              <nav className="grid gap-2 text-lg font-medium">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
          </SheetContent>
        </Sheet>
      </div>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search transactions, patients, notes..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button asChild className="hidden md:flex">
        <Link href="/transactions/add">
          <Plus className="mr-2 h-4 w-4" /> New Transaction
        </Link>
      </Button>
       <Button onClick={handleExport} variant="outline" className="hidden md:flex">
        <Download className="mr-2 h-4 w-4" /> Export CSV
      </Button>
    </header>
  );
}
