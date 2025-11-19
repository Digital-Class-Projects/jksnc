
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDatabase } from "@/firebase";
import { ref, push, onValue, remove, set } from "firebase/database";
import { useToast } from "@/hooks/use-toast";

type Complain = {
  id: string;
  complainType: string;
  source: string;
  complainBy: string;
  phone: string;
  date: string;
  description: string;
  actionTaken: string;
  assigned: string;
  note: string;
};

function AddNewComplainDialog({ open, onOpenChange, onAddSuccess, complainTypes, sources }: { open: boolean, onOpenChange: (open: boolean) => void, onAddSuccess: () => void, complainTypes: string[], sources: string[] }) {
    const database = useDatabase();
    const { toast } = useToast();

    const [complainType, setComplainType] = useState('');
    const [source, setSource] = useState('');
    const [complainBy, setComplainBy] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [description, setDescription] = useState('');
    const [actionTaken, setActionTaken] = useState('');
    const [assigned, setAssigned] = useState('');
    const [note, setNote] = useState('');
    
    const resetForm = () => {
        setComplainType('');
        setSource('');
        setComplainBy('');
        setPhone('');
        setDate(undefined);
        setDescription('');
        setActionTaken('');
        setAssigned('');
        setNote('');
    };

    const handleSubmit = async () => {
        if (!database || !complainType || !complainBy) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Complain Type and Complain By are required."});
            return;
        }

        const newComplain: Omit<Complain, 'id'> = {
            complainType, source, complainBy, phone, description, actionTaken, assigned, note,
            date: date ? date.toISOString().split('T')[0] : '',
        };

        try {
            const complainsRef = ref(database, 'complains');
            const newComplainRef = push(complainsRef);
            await set(newComplainRef, newComplain);
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
                    <DialogTitle>Add Complain</DialogTitle>
                    <DialogDescription>Fill in the details for the new complain record.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2"><Label>Complain Type</Label><Select onValueChange={setComplainType} value={complainType}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{complainTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Source</Label><Select onValueChange={setSource} value={source}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Complain By</Label><Input value={complainBy} onChange={e => setComplainBy(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? date.toLocaleDateString() : 'mm/dd/yyyy'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent></Popover></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Action Taken</Label><Input value={actionTaken} onChange={e => setActionTaken(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Assigned</Label><Input value={assigned} onChange={e => setAssigned(e.target.value)} /></div>
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

export default function ComplainsPage() {
  const database = useDatabase();
  const { toast } = useToast();

  const [complains, setComplains] = useState<Complain[]>([]);
  const [complainTypes, setComplainTypes] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);

    const complainsRef = ref(database, 'complains');
    const complainTypesRef = ref(database, 'frontOfficeSetup/complainTypes');
    const sourcesRef = ref(database, 'frontOfficeSetup/enquirySources');
    
    const unsubComplains = onValue(complainsRef, (snapshot) => {
      const data: Complain[] = [];
      snapshot.forEach(child => {
        data.push({ id: child.key!, ...child.val() });
      });
      setComplains(data.reverse());
      setIsLoading(false);
    });

    const unsubTypes = onValue(complainTypesRef, (snapshot) => {
      const data: string[] = ["Select"];
      snapshot.forEach(child => { data.push(child.val().name); });
      setComplainTypes(data);
    });

    const unsubSources = onValue(sourcesRef, (snapshot) => {
        const data: string[] = ["Select"];
        snapshot.forEach(child => { data.push(child.val().name); });
        setSources(data);
    });

    return () => {
        unsubComplains();
        unsubTypes();
        unsubSources();
    }
  }, [database]);
  
  const handleAddSuccess = () => {
    setShowSuccessDialog(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this complain record?")) {
        try {
            await remove(ref(database, `complains/${id}`));
            toast({ title: "Success", description: "Complain record deleted successfully." });
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
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1"><Label>From Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}><CalendarIcon className="mr-2 h-4 w-4" />mm/dd/yyyy</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent></Popover></div>
          <div className="space-y-1"><Label>To Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}><CalendarIcon className="mr-2 h-4 w-4" />mm/dd/yyyy</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent></Popover></div>
          <div className="space-y-1"><Label>Complain Type</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{complainTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label>Source</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="flex gap-2 justify-start"><Button>Search</Button></div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Complain List</CardTitle>
            <Button size="sm" onClick={() => setOpenAddDialog(true)}>Add Complain</Button>
            <AddNewComplainDialog open={openAddDialog} onOpenChange={setOpenAddDialog} onAddSuccess={handleAddSuccess} complainTypes={complainTypes} sources={sources} />
          </div>
          <Input placeholder="Search..." className="max-w-sm mt-4" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>SR NO.</TableHead><TableHead>ACTION</TableHead><TableHead>COMPLAIN BY</TableHead><TableHead>COMPLAIN TYPE</TableHead><TableHead>PHONE</TableHead><TableHead>DATE</TableHead><TableHead>NOTE</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
              ) : complains.length > 0 ? (
                complains.map((complain, index) => (
                  <TableRow key={complain.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="flex gap-1"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(complain.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    <TableCell>{complain.complainBy}</TableCell>
                    <TableCell>{complain.complainType}</TableCell>
                    <TableCell>{complain.phone}</TableCell>
                    <TableCell>{complain.date}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{complain.note}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7} className="text-center">No complains found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <SuccessDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog} title="Success" description="Record added successfully." />
    </div>
  );
}

    