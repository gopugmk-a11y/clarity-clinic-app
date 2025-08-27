"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClarity } from "@/hooks/use-clarity-store";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function DashboardPage() {
  const { transactions, currency } = useClarity();

  const kpis = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'Income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const net = income - expense;
    return { income, expense, net };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const dataByMonth: { [key: string]: { name: string; income: number; expense: number } } = {};
    transactions.forEach(tx => {
      const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!dataByMonth[month]) {
        dataByMonth[month] = { name: month, income: 0, expense: 0 };
      }
      if (tx.type === 'Income') {
        dataByMonth[month].income += tx.amount;
      } else {
        dataByMonth[month].expense += tx.amount;
      }
    });

    const sortedMonths = Object.keys(dataByMonth).sort((a,b) => {
      const [mA, yA] = a.split(' ');
      const [mB, yB] = b.split(' ');
      if (yA !== yB) return yA.localeCompare(yB);
      return new Date(`${mA} 1, 20${yA}`).getMonth() - new Date(`${mB} 1, 20${yB}`).getMonth();
    })
    
    return sortedMonths.map(month => dataByMonth[month]);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const dataByCategory: { [key: string]: { name: string; amount: number } } = {};
    transactions.forEach(tx => {
      if (!dataByCategory[tx.category]) {
        dataByCategory[tx.category] = { name: tx.category, amount: 0 };
      }
      const amount = tx.type === 'Income' ? tx.amount : -tx.amount;
      dataByCategory[tx.category].amount += amount;
    });
    return Object.values(dataByCategory).sort((a, b) => b.amount - a.amount);
  }, [transactions]);
  
  const chartConfig = {
    income: { label: "Income", color: "hsl(var(--chart-1))" },
    expense: { label: "Expense", color: "hsl(var(--chart-2))" },
  } satisfies React.ComponentProps<typeof ChartContainer>["config"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(kpis.income, currency)}</div>
            <p className="text-xs text-muted-foreground">Total revenue generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(kpis.expense, currency)}</div>
            <p className="text-xs text-muted-foreground">Total costs incurred</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <Wallet className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${kpis.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(kpis.net, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Income after expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Income vs. Expense</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={monthlyData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickFormatter={(value) => formatCurrency(value as number, currency).replace(currency.symbol,'')} />
                  <Tooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => formatCurrency(value as number, currency)}
                    />}
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Net Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[400px] w-full">
              <ResponsiveContainer>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value as number, currency).replace(currency.symbol,'')} />
                  <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} />
                  <Tooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => formatCurrency(value as number, currency)}
                    />}
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <rect key={`cell-${index}`} fill={entry.amount >= 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
