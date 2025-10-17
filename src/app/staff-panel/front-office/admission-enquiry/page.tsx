
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  note: string;
  date: string;
  nextFollowUpDate: string;
  assigned: string;
  reference: string;
  source: string;
  class: string;
  noOfChild: string;
};

function AddNewEnquiryDialog({ open, onOpenChange, onAddSuccess, sources, references }: { open: boolean, onOpenChange: (open: boolean) => void, onAddSuccess: () => void, sources: string[], references: string[] }) {
    const database = useDatabase();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>();
    const [assigned, setAssigned] = useState('');
    const [reference, setReference] = useState('');
    const [source, setSource] = useState('');
    const [enquiredClass, setEnquiredClass] = useState('');
    const [noOfChild, setNoOfChild] = useState('');
    
    const resetForm = () => {
        setName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setDescription('');
        setNote('');
        setDate(undefined);
        setNextFollowUpDate(undefined);
        setAssigned('');
        setReference('');
        setSource('');
        setEnquiredClass('');
        setNoOfChild('');
    };

    const handleSubmit = async () => {
        if (!database || !name || !phone || !source) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Name, Phone and Source are required."});
            return;
        }

        const newEnquiry: Omit<Enquiry, 'id'> = {
            name, phone, email, address, description, note, assigned, reference, source, 
            class: enquiredClass, noOfChild, 
            date: date ? date.toISOString().split('T')[0] : '',
            nextFollowUpDate: nextFollowUpDate ? nextFollowUpDate.toISOString().split('T')[0] : ''
        };

        try {
            const enquiriesRef = ref(database, 'admissionEnquiries');
            const newEnquiryRef = push(enquiriesRef);
            await set(newEnquiryRef, newEnquiry);
            onAddSuccess();
            resetForm();
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Admission Enquiry</DialogTitle>
                    <DialogDescription>Fill in the details for the new admission enquiry.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Address</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Note</Label><Textarea value={note} onChange={e => setNote(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? date.toLocaleDateString() : 'mm/dd/yyyy'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent></Popover></div>
                        <div className="space-y-2"><Label>Next Follow Up Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !nextFollowUpDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{nextFollowUpDate ? nextFollowUpDate.toLocaleDateString() : 'mm/dd/yyyy'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={nextFollowUpDate} onSelect={setNextFollowUpDate} initialFocus /></PopoverContent></Popover></div>
                        <div className="space-y-2"><Label>Assigned</Label><Input value={assigned} onChange={e => setAssigned(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Reference</Label><Select onValueChange={setReference} value={reference}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{references.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>Source</Label><Select onValueChange={setSource} value={source}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>Class</Label><Input value={enquiredClass} onChange={e => setEnquiredClass(e.target.value)} /></div>
                        <div className="space-y-2"><Label>Number of Child</Label><Input type="number" value={noOfChild} onChange={e => setNoOfChild(e.target.value)} /></div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdmissionEnquiryPage() {
  const database = useDatabase();
  const { toast } = useToast();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);

    const enquiriesRef = ref(database, 'admissionEnquiries');
    const sourcesRef = ref(database, 'frontOfficeSetup/enquirySources');
    const referencesRef = ref(database, 'frontOfficeSetup/enquiryReferences');

    const unsubEnquiries = onValue(enquiriesRef, (snapshot) => {
      const data: Enquiry[] = [];
      snapshot.forEach(child => {
        data.push({ id: child.key!, ...child.val() });
      });
      setEnquiries(data.reverse());
      setIsLoading(false);
    });

    const unsubSources = onValue(sourcesRef, (snapshot) => {
      const data: string[] = ["Select"];
      snapshot.forEach(child => { data.push(child.val().name); });
      setSources(data);
    });

    const unsubReferences = onValue(referencesRef, (snapshot) => {
      const data: string[] = ["Select"];
      snapshot.forEach(child => { data.push(child.val().name); });
      setReferences(data);
    });

    return () => {
      unsubEnquiries();
      unsubSources();
      unsubReferences();
    };
  }, [database]);

  const handleAddSuccess = () => {
    setShowSuccessDialog(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this enquiry?")) {
        try {
            await remove(ref(database, `admissionEnquiries/${id}`));
            toast({ title: "Success", description: "Enquiry deleted successfully." });
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
          <div className="space-y-1"><Label>Enquiry From Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !null && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />mm/dd/yyyy</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent></Popover></div>
          <div className="space-y-1"><Label>Enquiry To Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !null && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />mm/dd/yyyy</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent></Popover></div>
          <div className="space-y-1"><Label>Source</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label>Status</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="passive">Passive</SelectItem><SelectItem value="dead">Dead</SelectItem><SelectItem value="won">Won</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent></Select></div>
          <div className="flex gap-2 justify-start"><Button>Search</Button></div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Admission Enquiry</CardTitle>
            <Button size="sm" onClick={() => setOpenAddDialog(true)}>Add Admission Enquiry</Button>
            <AddNewEnquiryDialog open={openAddDialog} onOpenChange={setOpenAddDialog} onAddSuccess={handleAddSuccess} sources={sources} references={references} />
          </div>
          <Input placeholder="Search..." className="max-w-sm mt-4" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>SR NO.</TableHead><TableHead>ACTION</TableHead><TableHead>NAME</TableHead><TableHead>PHONE</TableHead><TableHead>SOURCE</TableHead><TableHead>ENQUIRY DATE</TableHead><TableHead>NEXT FOLLOW UP</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
              ) : enquiries.length > 0 ? (
                enquiries.map((enquiry, index) => (
                  <TableRow key={enquiry.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(enquiry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                    <TableCell>{enquiry.name}</TableCell>
                    <TableCell>{enquiry.phone}</TableCell>
                    <TableCell>{enquiry.source}</TableCell>
                    <TableCell>{enquiry.date}</TableCell>
                    <TableCell>{enquiry.nextFollowUpDate}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7} className="text-center">No enquiries found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <SuccessDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog} title="Success" description="Record added successfully." />
    </div>
  );
}

    