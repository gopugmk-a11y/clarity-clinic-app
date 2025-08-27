"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useCallback, useState } from "react";
import { debounce } from "lodash";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useClarity } from "@/hooks/use-clarity-store.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transactionCategories } from "@/types";
import { getCategorySuggestion } from "./actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  type: z.enum(["Income", "Expense"], { required_error: "Type is required." }),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  category: z.string().min(1, "Category is required."),
  patientName: z.string().optional(),
  patientId: z.string().optional(),
  phone: z.string().optional(),
  payment: z.string().min(1, "Payment method is required."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddTransactionPage() {
  const router = useRouter();
  const { addTransaction } = useClarity();
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      type: "Income",
      amount: 0,
      category: "",
      patientName: "",
      patientId: "",
      phone: "",
      payment: "UPI",
      notes: "",
    },
  });
  
  const debouncedSuggestCategory = useCallback(debounce(async (notes: string) => {
    if (notes && notes.length > 10) {
      setIsSuggesting(true);
      try {
        const suggestion = await getCategorySuggestion(notes);
        if (suggestion.category && transactionCategories.includes(suggestion.category as any)) {
          form.setValue("category", suggestion.category, { shouldValidate: true });
          toast({
            title: "AI Suggestion",
            description: `We've suggested the category "${suggestion.category}" based on your notes.`,
          });
        }
      } catch (error) {
        console.error("AI suggestion failed:", error);
      } finally {
        setIsSuggesting(false);
      }
    }
  }, 1000), [form, toast]);


  function onSubmit(values: FormValues) {
    addTransaction({
      ...values,
      date: format(values.date, 'yyyy-MM-dd'),
    });
    toast({ title: "Transaction added!", description: "Your transaction has been saved." });
    router.push('/transactions');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transactionCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name (optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Rahul Kumar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl><Input placeholder="e.g., P-1024" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="e.g., 98765 43210" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-4">
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        Notes
                        {isSuggesting && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any details... AI will suggest a category based on your notes!"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debouncedSuggestCategory(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Transaction
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
