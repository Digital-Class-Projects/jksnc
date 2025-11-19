
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useDatabase } from "@/firebase";
import { ref, push, onValue, remove, set } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";

type SetupItem = {
    id: string;
    name: string;
};

type SetupCategory = 'enquirySources' | 'enquiryReferences' | 'complainTypes' | 'visitorPurposes';

function SetupSection({ title, category, dbPath }: { title: string, category: SetupCategory, dbPath: string }) {
    const database = useDatabase();
    const { toast } = useToast();
    const [items, setItems] = useState<SetupItem[]>([]);
    const [newItemName, setNewItemName] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!database) return;
        const itemsRef = ref(database, dbPath);
        const unsubscribe = onValue(itemsRef, (snapshot) => {
            const data: SetupItem[] = [];
            snapshot.forEach(child => {
                data.push({ id: child.key!, ...child.val() });
            });
            setItems(data);
        });
        return () => unsubscribe();
    }, [database, dbPath]);

    const handleAddItem = async () => {
        if (!database || !newItemName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Name cannot be empty.' });
            return;
        }
        try {
            const itemsRef = ref(database, dbPath);
            const newItemRef = push(itemsRef);
            await set(newItemRef, { name: newItemName });
            setNewItemName("");
            setSuccessMessage(`${title.slice(0,-1)} added successfully.`);
            setShowSuccess(true);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!database) return;
        try {
            await remove(ref(database, `${dbPath}/${id}`));
            setSuccessMessage(`${title.slice(0,-1)} deleted successfully.`);
            setShowSuccess(true);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Add or remove {title.toLowerCase()}.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input 
                        placeholder={`New ${title.slice(0, -1)} Name...`}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                    />
                    <Button onClick={handleAddItem}>Add</Button>
                </div>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {items.length > 0 ? items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={2} className="text-center">No items yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                 <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} title="Success" description={successMessage} />
            </CardContent>
        </Card>
    );
}

export default function FrontOfficeSetupPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Front Office Setup</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SetupSection title="Enquiry Sources" category="enquirySources" dbPath="frontOfficeSetup/enquirySources" />
                <SetupSection title="Enquiry References" category="enquiryReferences" dbPath="frontOfficeSetup/enquiryReferences" />
                <SetupSection title="Complain Types" category="complainTypes" dbPath="frontOfficeSetup/complainTypes" />
                <SetupSection title="Visitor Purposes" category="visitorPurposes" dbPath="frontOfficeSetup/visitorPurposes" />
            </div>
        </div>
    );
}

    