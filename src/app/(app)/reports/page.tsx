
"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth } from "date-fns";
import { useClarity } from "@/hooks/use-clarity-store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatCurrency } from "@/lib/utils";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { transactionCategories, Transaction } from "@/types";

interface PnlCategory {
  name: string;
  total: number;
}

interface PnlData {
  income: PnlCategory[];
  totalIncome: number;
  expense: PnlCategory[];
  totalExpense: number;
  netProfit: number;
}

export default function ReportsPage() {
  const { transactions, currency } = useClarity();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const [pnlData, setPnlData] = useState<PnlData | null>(null);

  const generateReport = () => {
    if (!date?.from || !date?.to) {
      return;
    }
    
    const filteredTx = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= date.from! && txDate <= date.to!;
    });
    
    const incomeByCategory: { [key: string]: number } = {};
    const expenseByCategory: { [key: string]: number } = {};
    
    transactionCategories.forEach(cat => {
        incomeByCategory[cat] = 0;
        expenseByCategory[cat] = 0;
    });

    let totalIncome = 0;
    let totalExpense = 0;

    filteredTx.forEach(tx => {
      if (tx.type === "Income") {
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
        totalIncome += tx.amount;
      } else {
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
        totalExpense += tx.amount;
      }
    });

    const income: PnlCategory[] = Object.entries(incomeByCategory).filter(([,total]) => total > 0).map(([name, total]) => ({ name, total }));
    const expense: PnlCategory[] = Object.entries(expenseByCategory).filter(([,total]) => total > 0).map(([name, total]) => ({ name, total }));
    
    setPnlData({
        income,
        totalIncome,
        expense,
        totalExpense,
        netProfit: totalIncome - totalExpense
    });
  };
  
  const handleExport = () => {
    if (!pnlData) return;
    
    const reportData: (Transaction | Record<string, string>)[] = [
        { "Report Period": `${format(date?.from || new Date(), 'PPP')} - ${format(date?.to || new Date(), 'PPP')}`},
        { "": ""}, // Spacer
        { "Category": "Income", "Amount": "" },
        ...pnlData.income.map(i => ({ Category: i.name, Amount: formatCurrency(i.total, currency) })),
        { Category: "TOTAL INCOME", Amount: formatCurrency(pnlData.totalIncome, currency) },
        { "": ""}, // Spacer
        { "Category": "Expense", "Amount": "" },
        ...pnlData.expense.map(e => ({ Category: e.name, Amount: formatCurrency(e.total, currency) })),
        { Category: "TOTAL EXPENSE", Amount: formatCurrency(pnlData.totalExpense, currency) },
        { "": ""}, // Spacer
        { Category: "NET PROFIT/LOSS", Amount: formatCurrency(pnlData.netProfit, currency) },
    ];
    
    import('@/lib/csv').then(({ exportToCsv }) => {
        exportToCsv(`clarity-clinic-pnl-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, reportData);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
          <CardDescription>Select a date range to generate a financial report.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-4">
          <div className={cn("grid gap-2")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={generateReport}>Generate Report</Button>
        </CardContent>
      </Card>
      
      {pnlData && (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Report Results</CardTitle>
                    <CardDescription>
                        Showing data from {format(date!.from!, "PPP")} to {format(date!.to!, "PPP")}
                    </CardDescription>
                </div>
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[70%]">Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="font-bold bg-muted/20">
                            <TableCell>Income</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {pnlData.income.map(item => (
                            <TableRow key={`inc-${item.name}`}>
                                <TableCell className="pl-8">{item.name}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.total, currency)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="bg-muted/10">
                            <TableCell className="font-bold pl-8">Total Income</TableCell>
                            <TableCell className="text-right font-bold text-emerald-400">{formatCurrency(pnlData.totalIncome, currency)}</TableCell>
                        </TableRow>

                         <TableRow className="font-bold bg-muted/20">
                            <TableCell>Expenses</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {pnlData.expense.map(item => (
                            <TableRow key={`exp-${item.name}`}>
                                <TableCell className="pl-8">{item.name}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.total, currency)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="bg-muted/10">
                            <TableCell className="font-bold pl-8">Total Expenses</TableCell>
                            <TableCell className="text-right font-bold text-rose-400">{formatCurrency(pnlData.totalExpense, currency)}</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow className="text-base font-bold bg-card border-t-2 border-primary/50">
                            <TableCell>Net Profit / Loss</TableCell>
                            <TableCell className={`text-right ${pnlData.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(pnlData.netProfit, currency)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
