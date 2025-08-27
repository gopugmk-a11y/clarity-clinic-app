
"use client";

import { useMemo } from 'react';
import { useClarity } from "@/hooks/use-clarity-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Patient {
    name: string;
    id: string;
    phone: string;
    lastVisit: string;
    transactionCount: number;
}

export default function PatientsPage() {
    const { transactions, setSearchQuery } = useClarity();
    const router = useRouter();

    const patients = useMemo(() => {
        const patientMap = new Map<string, Patient>();

        transactions.forEach(tx => {
            if (tx.patientName) {
                const key = tx.patientName.toLowerCase();
                const existing = patientMap.get(key);

                if (existing) {
                    existing.transactionCount += 1;
                    if (new Date(tx.date) > new Date(existing.lastVisit)) {
                        existing.lastVisit = tx.date;
                    }
                } else {
                    patientMap.set(key, {
                        name: tx.patientName,
                        id: tx.patientId || 'N/A',
                        phone: tx.phone || 'N/A',
                        lastVisit: tx.date,
                        transactionCount: 1,
                    });
                }
            }
        });
        
        return Array.from(patientMap.values()).sort((a,b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
    }, [transactions]);

    const handleViewTransactions = (patientName: string) => {
        setSearchQuery(patientName);
        router.push('/transactions');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Patients</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Patient ID</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Last Visit</TableHead>
                            <TableHead>Transactions</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients.length > 0 ? (
                            patients.map((p) => (
                                <TableRow key={p.name}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{p.name.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{p.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{p.id}</TableCell>
                                    <TableCell>{p.phone}</TableCell>
                                    <TableCell>{p.lastVisit}</TableCell>
                                    <TableCell>{p.transactionCount}</TableCell>
                                    <TableCell className="text-right">
                                       <Button variant="ghost" size="sm" onClick={() => handleViewTransactions(p.name)}>
                                            <Eye className="mr-2 h-4 w-4"/>
                                            View History
                                       </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No patients with transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
