
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SuccessDialog } from "@/components/success-dialog";
import { useDatabase } from "@/firebase";
import { ref, push, onValue, remove, set } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Visitor = {
  id: string;
  purpose: string;
  name: string;
  phone: string;
  idCard: string;
  noOfPerson: string;
  date: string;
  inTime: string;
  outTime: string;
  note: string;
};

function AddNewVisitorDialog({ open, onOpenChange, onAddSuccess, purposes }: { open: boolean, onOpenChange: (open: boolean) => void, onAddSuccess: () => void, purposes: string[] }) {
    const database = useDatabase();
    const { toast } = useToast();

    const [purpose, setPurpose] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [idCard, setIdCard] = useState('');
    const [noOfPerson, setNoOfPerson] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [inTime, setInTime] = useState('');
    const [outTime, setOutTime] = useState('');
    const [note, setNote] = useState('');

    const resetForm = () => {
        setPurpose('');
        setName('');
        setPhone('');
        setIdCard('');
        setNoOfPerson('');
        setDate(undefined);
        setInTime('');
        setOutTime('');
        setNote('');
    };
    
    const handleSubmit = async () => {
        if (!database || !purpose || !name) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Purpose and Name are required."});
            return;
        }
        const newVisitor: Omit<Visitor, 'id'> = {
            purpose, name, phone, idCard, noOfPerson, note, inTime, outTime,
            date: date ? date.toISOString().split('T')[0] : '',
        };
        try {
            const visitorsRef = ref(database, 'visitorBooks');
            const newVisitorRef = push(visitorsRef);
            await set(newVisitorRef, newVisitor);
            onAddSuccess();
            resetForm();
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Visitor</DialogTitle>
                    <DialogDescription>Fill in the details for the new visitor record.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2"><Label>Purpose</Label><Select onValueChange={setPurpose} value={purpose}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{purposes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                    <div className="space-y-2"><Label>ID Card</Label><Input value={idCard} onChange={e => setIdCard(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Number Of Person</Label><Input type="number" value={noOfPerson} onChange={e => setNoOfPerson(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? date.toLocaleDateString() : 'mm/dd/yyyy'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent></Popover></div>
                    <div className="space-y-2"><Label>In Time</Label><Input type="time" value={inTime} onChange={e => setInTime(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Out Time</Label><Input type="time" value={outTime} onChange={e => setOutTime(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Note</Label><Textarea value={note} onChange={e => setNote(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Attach Document</Label><Input type="file" /></div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function VisitorBooksPage() {
  const database = useDatabase();
  const { toast } = useToast();

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  useEffect(() => {
    if (!database) return;
    setIsLoading(true);
    const visitorsRef = ref(database, 'visitorBooks');
    const purposesRef = ref(database, 'frontOfficeSetup/visitorPurposes');
    
    const unsubVisitors = onValue(visitorsRef, (snapshot) => {
        const data: Visitor[] = [];
        snapshot.forEach(child => {
            data.push({ id: child.key!, ...child.val() });
        });
        setVisitors(data.reverse());
        setIsLoading(false);
    });

    const unsubPurposes = onValue(purposesRef, (snapshot) => {
        const data: string[] = ["Select"];
        snapshot.forEach(child => {
            data.push(child.val().name);
        });
        setPurposes(data);
    });

    return () => {
        unsubVisitors();
        unsubPurposes();
    }
  }, [database]);

  const handleAddSuccess = () => {
    setShowSuccessDialog(true);
  };
  
  const handleDelete = async (id: string) => {
      if (!database) return;
      if (confirm("Are you sure you want to delete this visitor record?")) {
          try {
              await remove(ref(database, `visitorBooks/${id}`));
              toast({ title: "Success", description: "Visitor record deleted successfully." });
          } catch (error: any) {
              toast({ variant: "destructive", title: "Error", description: error.message });
          }
      }
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Criteria</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1"><Label>From Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}><CalendarIcon className="mr-2 h-4 w-4" />mm/dd/yyyy</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent></Popover></div>
          <div className="space-y-1"><Label>To Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}><CalendarIcon className="mr-2 h-4 w-4" />mm/dd/yyyy</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent></Popover></div>
          <div className="flex gap-2 justify-start"><Button>Search</Button></div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visitor List</CardTitle>
            <Button size="sm" onClick={() => setOpenAddDialog(true)}>Add Visitor</Button>
            <AddNewVisitorDialog open={openAddDialog} onOpenChange={setOpenAddDialog} onAddSuccess={handleAddSuccess} purposes={purposes} />
          </div>
          <Input placeholder="Search..." className="max-w-sm mt-4" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>SR NO.</TableHead><TableHead>ACTION</TableHead><TableHead>PURPOSE</TableHead><TableHead>NAME</TableHead><TableHead>PHONE</TableHead><TableHead>DATE</TableHead><TableHead>IN TIME</TableHead><TableHead>OUT TIME</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : visitors.length > 0 ? (
                visitors.map((visitor, index) => (
                  <TableRow key={visitor.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="flex gap-1"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(visitor.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    <TableCell>{visitor.purpose}</TableCell>
                    <TableCell>{visitor.name}</TableCell>
                    <TableCell>{visitor.phone}</TableCell>
                    <TableCell>{visitor.date}</TableCell>
                    <TableCell>{visitor.inTime}</TableCell>
                    <TableCell>{visitor.outTime}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={8} className="text-center">No visitors found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <SuccessDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog} title="Success" description="Record added successfully." />
    </div>
  );
}

    