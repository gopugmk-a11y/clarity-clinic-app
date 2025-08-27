"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useClarity } from "@/hooks/use-clarity-store";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  doctor: z.string().min(1, "Doctor name is required."),
  patient: z.string().min(1, "Patient name is required."),
  medicine: z.string().min(1, "Medicine is required."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PrescriptionsPage() {
  const { prescriptions, addPrescription, deletePrescription } = useClarity();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      doctor: "",
      patient: "",
      medicine: "",
      notes: "",
    },
  });

  function onSubmit(values: FormValues) {
    addPrescription({
      ...values,
      date: format(values.date, 'yyyy-MM-dd'),
    });
    toast({ title: "Prescription saved!" });
    form.reset({ date: new Date(), doctor: "", patient: "", medicine: "", notes: "" });
  }

  return (
    <Tabs defaultValue="list">
      <TabsList className="mb-4">
        <TabsTrigger value="list">View Prescriptions</TabsTrigger>
        <TabsTrigger value="add">Add Prescription</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <Card>
          <CardHeader>
            <CardTitle>All Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medicine(s)</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.length > 0 ? (
                  prescriptions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.doctor}</TableCell>
                      <TableCell>{p.patient}</TableCell>
                      <TableCell>{p.medicine}</TableCell>
                      <TableCell className="max-w-xs truncate">{p.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => deletePrescription(p.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No prescriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="add">
        <Card>
          <CardHeader>
            <CardTitle>Add New Prescription</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="doctor" render={({ field }) => (
                      <FormItem><FormLabel>Doctor Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="patient" render={({ field }) => (
                      <FormItem><FormLabel>Patient Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="medicine" render={({ field }) => (
                      <FormItem><FormLabel>Medicine(s)</FormLabel><FormControl><Input placeholder="e.g., Paracetamol, Amoxicillin" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Dosage, advice, etc." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Prescription
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
