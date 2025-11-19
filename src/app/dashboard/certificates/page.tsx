
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, FileSpreadsheet, FileText, Share2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDatabase, useAuth } from "@/firebase";
import { ref, onValue, push, set, serverTimestamp, get, query, orderByChild, equalTo, remove, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SuccessDialog } from "@/components/success-dialog";
import { parseISO } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

const certificateDesigns = [
  {
    id: "registration",
    name: "Registration Certificate",
    imageUrl: "https://ik.imagekit.io/rgazxzsxr/Registration%20Certificate.png?updatedAt=1761992685429",
  },
  {
    id: "marks",
    name: "Marks Certificate",
    imageUrl: "https://ik.imagekit.io/rgazxzsxr/marks%20cards%20and%20registration%20CURVE%20FILE.png?updatedAt=1761988197015",
  },
  {
    id: "diploma",
    name: "Diploma Certificate",
    imageUrl: "https://ik.imagekit.io/rgazxzsxr/Diploma%20Certificate.png?updatedAt=1761715718990",
  },
  {
    id: "migration",
    name: "Migration Certificate",
    imageUrl: "https://ik.imagekit.io/rgazxzsxr/Migration%20Certifiate.png?updatedAt=1760612547767",
  },
];

type Student = {
  id: string;
  studentName: string;
  fatherName: string;
  course: string;
  [key: string]: any;
};

type GeneratedCertificate = {
  id: string;
  certificateNo: string;
  studentName: string;
  courseName: string;
  [key: string]: any;
};

function AddDetailsDialog({
  open,
  onOpenChange,
  onSuccess,
  mode = "add",
  certificate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  mode?: "add" | "edit";
  certificate?: GeneratedCertificate | null;
}) {
  const database = useDatabase();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [certificateType, setCertificateType] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, [field]: e.target.value }));
  };
  const handleDateChange = (field: string) => (date: Date | undefined) => {
    setFormData((prev: any) => ({ ...prev, [field]: date?.toISOString() }));
  };
  const handleFileChange = (field: 'photoUrl' | 'instituteLogoUrl') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              setFormData(prev => ({ ...prev, [field]: dataUrl }));
          };
          reader.readAsDataURL(file);
      }
  };


  useEffect(() => {
    if (!database) return;
    const studentsRef = ref(database, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data: Student[] = [];
      snapshot.forEach(child => data.push({ id: child.key!, ...child.val() }));
      setStudents(data);
    });
    return () => unsubscribe();
  }, [database]);

  useEffect(() => {
    if (mode === 'edit' && certificate) {
        setCertificateType(certificate.certificateType);
        setFormData(certificate);
        if (certificate.studentId) {
            setSelectedStudentId(certificate.studentId);
        }
    } else {
        resetForm();
    }
  }, [mode, certificate, open]);
  
  const resetForm = () => {
    setSelectedStudentId('');
    setCertificateType('');
    setFormData({});
  };

  const handleSubmit = async () => {
    if (!database || !certificateType) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a certificate type.'});
        return;
    }
     if (mode === 'add' && !selectedStudentId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a student.' });
        return;
    }
    
    const student = students.find(s => s.id === selectedStudentId);

    const certificateData = {
      ...formData,
      studentId: selectedStudentId,
      studentName: student?.studentName,
      certificateType: certificateType,
      certificateDetails: student
    };
    
    if (mode === 'add') {
      certificateData.issueDate = new Date().toISOString();
    }

    try {
        if (mode === 'edit' && certificate?.id) {
            const certRef = ref(database, `generatedCertificates/${certificate.id}`);
            await update(certRef, certificateData);
            onSuccess('Certificate updated successfully.');
        } else {
            const generatedCertsRef = ref(database, 'generatedCertificates');
            const newCertRef = push(generatedCertsRef);
            await set(newCertRef, { ...certificateData, createdAt: serverTimestamp() });
            onSuccess('Certificate generated and added to the list.');
        }
        resetForm();
        onOpenChange(false);
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const renderFormFields = () => {
    switch(certificateType) {
        case 'Migration Certificate':
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Passing Year" value={formData.passingYear || ''} onChange={handleInputChange('passingYear')} />
              </div>
            );
        case 'Registration Certificate':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select onValueChange={(value) => setFormData((p: any) => ({...p, instituteName: value}))} defaultValue="Jammu and Kashmir State Nursing Council">
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="Jammu and Kashmir State Nursing Council">Jammu and Kashmir State Nursing Council</SelectItem></SelectContent>
                    </Select>
                    <Input placeholder="Teacher Name" value={formData.teacherName || ''} onChange={handleInputChange('teacherName')} />
                    <Input placeholder="Session" value={formData.session || ''} onChange={handleInputChange('session')} />
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.dateFrom && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.dateFrom ? new Date(formData.dateFrom).toLocaleDateString() : 'Date From'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.dateFrom ? new Date(formData.dateFrom) : undefined} onSelect={handleDateChange('dateFrom')} initialFocus /></PopoverContent></Popover>
                      <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.dateTo && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.dateTo ? new Date(formData.dateTo).toLocaleDateString() : 'Date To'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.dateTo ? new Date(formData.dateTo) : undefined} onSelect={handleDateChange('dateTo')} initialFocus /></PopoverContent></Popover>
                    </div>
                    <div><Label>Student Photo</Label><Input type="file" onChange={handleFileChange('photoUrl')} accept="image/*" /></div>
                    <div><Label>Institute Logo</Label><Input type="file" onChange={handleFileChange('instituteLogoUrl')} accept="image/*" /></div>
                </div>
            );
        case 'Marks Certificate':
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Roll No." value={formData.rollNo || ''} onChange={handleInputChange('rollNo')} />
                <Input placeholder="Course Name" value={formData.courseName || ''} onChange={handleInputChange('courseName')} />
                <Input placeholder="Percentage" value={formData.marksPercentage || ''} onChange={handleInputChange('marksPercentage')} />
                <Input placeholder="Session" value={formData.session || ''} onChange={handleInputChange('session')} />
                <Input type="number" placeholder="Max Marks (Theory)" value={formData.maxMarksTheory || ''} onChange={handleInputChange('maxMarksTheory')} />
                <Input type="number" placeholder="Obtained Marks (Theory)" value={formData.obtainedMarksTheory || ''} onChange={handleInputChange('obtainedMarksTheory')} />
                <Input type="number" placeholder="Max Marks (Practical)" value={formData.maxMarksPractical || ''} onChange={handleInputChange('maxMarksPractical')} />
                <Input type="number" placeholder="Obtained Marks (Practical)" value={formData.obtainedMarksPractical || ''} onChange={handleInputChange('obtainedMarksPractical')} />
                <Input placeholder="Result of Theory" value={formData.resultTheory || ''} onChange={handleInputChange('resultTheory')} />
                <Input placeholder="Result of Practical" value={formData.resultPractical || ''} onChange={handleInputChange('resultPractical')} />
                <Input placeholder="Total Marks (Theory)" value={formData.totalMarksTheory || ''} onChange={handleInputChange('totalMarksTheory')} />
                <Input placeholder="Total Marks (Practical)" value={formData.totalMarksPractical || ''} onChange={handleInputChange('totalMarksPractical')} />
                <div className="md:col-span-2"><Input placeholder="Marks Obtained in Words" value={formData.marksInWords || ''} onChange={handleInputChange('marksInWords')} /></div>
                <Input placeholder="Prepared By" value={formData.preparedBy || ''} onChange={handleInputChange('preparedBy')} />
                <Input placeholder="Checked By" value={formData.checkedBy || ''} onChange={handleInputChange('checkedBy')} />
              </div>
            );
        case 'Diploma Certificate':
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Roll No" value={formData.rollNo || ''} onChange={handleInputChange('rollNo')} />
                    <Input placeholder="Enrollment No" value={formData.enrollmentNo || ''} onChange={handleInputChange('enrollmentNo')}/>
                    <Input placeholder="Session" value={formData.session || ''} onChange={handleInputChange('session')} />
                    <Input placeholder="Grade" value={formData.grade || ''} onChange={handleInputChange('grade')} />
                     <div>
                        <Label>Student Photo</Label>
                        <Input type="file" onChange={handleFileChange('photoUrl')} accept="image/*" />
                    </div>
                 </div>
            );
        default:
            return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Certificate Details' : 'Add New Certificate'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label>Certificate No</Label>
                  <Input value={formData.certificateNo || ''} onChange={handleInputChange('certificateNo')} />
              </div>
              <div className="space-y-2">
                  <Label>SELECT CERTIFICATE TYPE</Label>
                  <Select onValueChange={setCertificateType} value={certificateType} disabled={mode==='edit'}>
                      <SelectTrigger><SelectValue placeholder="Select a certificate type..." /></SelectTrigger>
                      <SelectContent>
                          {certificateDesigns.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
            </div>
            
            {certificateType && (
                <>
                    <div className="space-y-2">
                        <Label>SELECT STUDENT</Label>
                        <Select onValueChange={setSelectedStudentId} value={selectedStudentId} disabled={mode === 'edit'}>
                            <SelectTrigger><SelectValue placeholder="Select a student..." /></SelectTrigger>
                            <SelectContent>
                                {students.map(s => <SelectItem key={s.id} value={s.id}>{`${s.studentName} (${s.course}) - ${s.id}`}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {renderFormFields()}
                </>
            )}
        </div>
        <DialogFooter>
            <Button onClick={handleSubmit} disabled={!certificateType || (mode ==='add' && !selectedStudentId)}>Submit Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CertificateDesignsPage() {
  const router = useRouter();
  const database = useDatabase();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedCertificates, setGeneratedCertificates] = useState<GeneratedCertificate[]>([]);
  const [dialogState, setDialogState] = useState<{ open: boolean; mode: "add" | "edit"; data: GeneratedCertificate | null }>({ open: false, mode: 'add', data: null });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);
    const certsQuery = query(ref(database, 'generatedCertificates'), orderByChild('createdAt'));
    
    const unsubscribe = onValue(certsQuery, (snapshot) => {
        const data: GeneratedCertificate[] = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                data.push({id: child.key!, ...child.val()});
            });
        }
        setGeneratedCertificates(data.reverse());
        setIsLoading(false);
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Error loading certificates",
            description: "Could not fetch the certificate list from the database.",
        });
    });

    return () => unsubscribe();
  }, [database, toast]);

  const handleView = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessDialog(true);
  };
  
  const handleOpenDialog = (mode: 'add' | 'edit' = 'add', cert: GeneratedCertificate | null = null) => {
    setDialogState({ open: true, mode, data: cert });
  }

  const handleDelete = async (id: string) => {
      if(!database) return;
      if (confirm('Are you sure you want to delete this generated certificate?')) {
          await remove(ref(database, `generatedCertificates/${id}`));
          toast({title: 'Success', description: 'Certificate deleted.'});
      }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Certificate Designs</CardTitle>
          <CardDescription>
            Manage student certificates from these designs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SR NO.</TableHead>
                <TableHead>DESIGN</TableHead>
                <TableHead>VIEW</TableHead>
                <TableHead>CERTIFICATE PHOTO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificateDesigns.map((design, index) => (
                <TableRow key={design.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{design.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(design.imageUrl)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Image
                      src={design.imageUrl}
                      alt={design.name}
                      width={100}
                      height={70}
                      className="rounded-md border"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Certificate List</CardTitle>
            <Button size="sm" onClick={() => handleOpenDialog('add')}>Add New+</Button>
          </div>
          <div className="flex items-center justify-between pt-4">
            <Input placeholder="Search..." className="max-w-sm" />
            <div className="flex gap-2">
               <Button variant="outline" size="icon"><FileSpreadsheet className="h-4 w-4 text-green-600"/></Button>
               <Button variant="outline" size="icon"><FileText className="h-4 w-4 text-red-600"/></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SR NO.</TableHead>
                <TableHead>ACTION</TableHead>
                <TableHead>DOWNLOAD</TableHead>
                <TableHead>SHARE ON</TableHead>
                <TableHead>CERTIFICATE NO.</TableHead>
                <TableHead>STUDENT NAME</TableHead>
                <TableHead>COURSE NAME</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">Loading certificates...</TableCell>
                    </TableRow>
                ) : generatedCertificates.length > 0 ? generatedCertificates.map((cert, index) => (
                    <TableRow key={cert.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                            <div className="flex">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', cert)}><Edit className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(cert.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Button size="sm" variant="outline" className="text-cyan-600 border-cyan-600" onClick={() => router.push(`/dashboard/certificates/${cert.id}`)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon"><Share2 className="h-5 w-5 text-green-500"/></Button>
                        </TableCell>
                        <TableCell>{cert.certificateNo}</TableCell>
                        <TableCell>{cert.studentName}</TableCell>
                        <TableCell>{cert.courseName}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">No certificates generated yet.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <p>Showing 1 to {generatedCertificates.length} of {generatedCertificates.length} entries</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                    <Button variant="outline" size="sm">Next</Button>
                </div>
            </div>
        </CardContent>
      </Card>


      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center p-4">
              <Image
                src={selectedImage}
                alt="Certificate Preview"
                width={800}
                height={560}
                className="rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddDetailsDialog 
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({...prev, open}))}
        onSuccess={handleSuccess}
        mode={dialogState.mode}
        certificate={dialogState.data}
      />
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Success"
        description={successMessage}
       />
    </div>
  );
}
