
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
import { useClarity } from "@/hooks/use-clarity-store.tsx";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { appointmentStatuses } from "@/types";

const formSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  time: z.string().min(1, "Time is required."),
  patient: z.string().min(1, "Patient name is required."),
  doctor: z.string().min(1, "Doctor is required."),
  reason: z.string().min(1, "Reason for visit is required."),
  status: z.enum(appointmentStatuses),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const doctors = ["Dr. Sharma", "Dr. Patel", "Dr. Gupta"]; // Placeholder

export default function AppointmentsPage() {
  const { appointments, addAppointment, deleteAppointment } = useClarity();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      time: "10:00",
      patient: "",
      doctor: doctors[0],
      reason: "",
      status: "Confirmed",
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await addAppointment({
        ...values,
        date: format(values.date, 'yyyy-MM-dd'),
      });
      toast({ title: "Appointment saved!" });
      form.reset({
        date: new Date(),
        time: "10:00",
        patient: "",
        doctor: doctors[0],
        reason: "",
        status: "Confirmed",
        notes: "",
       });
    } catch (e) {
       toast({ title: "Error", description: "Could not save appointment.", variant: "destructive" });
    }
  }

  const getStatusBadgeVariant = (status: (typeof appointmentStatuses)[number]) => {
    switch (status) {
      case "Completed": return "default";
      case "Confirmed": return "secondary";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  }

  return (
    <Tabs defaultValue="list">
      <TabsList className="mb-4">
        <TabsTrigger value="list">View Appointments</TabsTrigger>
        <TabsTrigger value="add">Add Appointment</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming & Past Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length > 0 ? (
                  appointments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.time}</TableCell>
                      <TableCell>{p.patient}</TableCell>
                      <TableCell>{p.doctor}</TableCell>
                      <TableCell className="max-w-xs truncate">{p.reason}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => deleteAppointment(p.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No appointments found.
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
            <CardTitle>Add New Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <FormField control={form.control} name="time" render={({ field }) => (
                      <FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="patient" render={({ field }) => (
                      <FormItem><FormLabel>Patient Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField
                    control={form.control}
                    name="doctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {doctors.map(doc => <SelectItem key={doc} value={doc}>{doc}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="reason" render={({ field }) => (
                      <FormItem className="lg:col-span-2"><FormLabel>Reason for Visit</FormLabel><FormControl><Input placeholder="e.g., Annual Checkup, Follow-up" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {appointmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem className="md:col-span-2 lg:col-span-3"><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Any additional notes..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Appointment
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
