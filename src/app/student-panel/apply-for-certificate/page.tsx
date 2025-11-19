
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useDatabase, useAuth } from "@/firebase";
import { ref, set, push, onValue, get, query, orderByChild, equalTo } from "firebase/database";
import { SuccessDialog } from "@/components/success-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Course = {
  id: string;
  courseName: string;
};

type Branch = {
  id: string;
  name: string;
};

// Reusable Setup Dialog Component
function SetupDialog({ open, onOpenChange, title, dbPath }: { open: boolean, onOpenChange: (open: boolean) => void, title: string, dbPath: string }) {
    const database = useDatabase();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAddItem = async () => {
        if (!database || !name.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Name cannot be empty.' });
            return;
        }
        setIsLoading(true);
        try {
            const itemsRef = ref(database, dbPath);
            const newItemRef = push(itemsRef);
            await set(newItemRef, { name: name, courseName: name }); // Using courseName for compatibility with courses node
            toast({ title: 'Success', description: `${title.slice(0, -1)} added successfully.` });
            setName("");
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New {title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="setup-name">Name</Label>
                    <Input id="setup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={`Enter new ${title.toLowerCase()}`} />
                </div>
                <DialogFooter>
                    <Button onClick={handleAddItem} disabled={isLoading}>{isLoading ? 'Adding...' : 'Add'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ApplyForCertificatePage() {
  const { toast } = useToast();
  const database = useDatabase();
  const auth = useAuth();

  const [dob, setDob] = useState<Date>();
  const [completionDate, setCompletionDate] = useState<Date>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [openCourseSetup, setOpenCourseSetup] = useState(false);
  const [openBranchSetup, setOpenBranchSetup] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', fatherName: '', motherName: '', gender: '', contactNumber: '', email: '',
    address: '', enrollmentNumber: '', rollNumber: '', courseName: '', branchName: '',
    branchId: '', academicSession: '', marksPercentage: '', registrationNumber: '', certificateType: '',
    issuePurpose: '', certificateLanguage: '', applicationFee: 500, paymentStatus: 'Pending',
    paymentReference: '', declaration: false, studentUid: ''
  });

  useEffect(() => {
    if (!database) return;

    const coursesRef = ref(database, 'courses');
    const branchesRef = ref(database, 'branches');

    const unsubCourses = onValue(coursesRef, (snapshot) => {
      const data: Course[] = [];
      snapshot.forEach(child => data.push({ id: child.key!, ...child.val() }));
      setCourses(data);
    });

    const unsubBranches = onValue(branchesRef, (snapshot) => {
      const data: Branch[] = [];
      snapshot.forEach(child => data.push({ id: child.key!, ...child.val() }));
      setBranches(data);
    });

    if (auth?.currentUser) {
        const studentQuery = query(ref(database, 'students'), orderByChild('uid'), equalTo(auth.currentUser.uid));
        get(studentQuery).then(snapshot => {
            if (snapshot.exists()) {
                const studentData = Object.values(snapshot.val())[0] as any;
                setFormData(prev => ({
                    ...prev,
                    fullName: studentData.studentName || '',
                    fatherName: studentData.fatherName || '',
                    motherName: studentData.motherName || '',
                    gender: studentData.gender || '',
                    contactNumber: studentData.studentMobile || '',
                    email: studentData.email || '',
                    address: studentData.fullAddress || '',
                    enrollmentNumber: studentData.enrollmentNo || '',
                    rollNumber: studentData.rollNo || '',
                    courseName: studentData.course || '',
                    branchId: studentData.branchId || '',
                    studentUid: auth.currentUser!.uid,
                }));
                if (studentData.branchId) {
                    const branchRef = ref(database, `branches/${studentData.branchId}`);
                    get(branchRef).then(branchSnapshot => {
                        if (branchSnapshot.exists()) {
                            setFormData(prev => ({ ...prev, branchName: branchSnapshot.val().name }));
                        }
                    });
                }
                if (studentData.dob) {
                    setDob(new Date(studentData.dob));
                }
            }
        });
    }

    return () => {
      unsubCourses();
      unsubBranches();
    };
  }, [database, auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'branchName') {
        const selectedBranch = branches.find(b => b.name === value);
        if (selectedBranch) {
            setFormData(prev => ({ ...prev, branchId: selectedBranch.id }));
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!database || !auth?.currentUser) {
      toast({ variant: 'destructive', title: 'Not logged in', description: 'You must be logged in to apply.' });
      return;
    }
    if (!formData.declaration) {
      toast({ variant: 'destructive', title: 'Declaration Required', description: 'You must agree to the declaration.' });
      return;
    }

    setIsLoading(true);
    
    const applicationData = {
      ...formData,
      dateOfBirth: dob ? dob.toISOString() : '',
      completionDate: completionDate ? completionDate.toISOString() : '',
      submissionDate: new Date().toISOString(),
      status: 'Pending',
    };
    
    try {
      const studentId = auth.currentUser.uid;
      const applicationsRef = ref(database, `applications/certificates/${studentId}`);
      const newAppRef = push(applicationsRef);
      await set(newAppRef, applicationData);
      
      setShowSuccess(true);
      // Reset form if needed
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Apply For Certificate</CardTitle>
          <CardDescription>
            Fill this form carefully. The details provided will be printed on the certificate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Information */}
            <section className="space-y-4 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">1. Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2"><Label htmlFor="fullName">Full Name *</Label><Input id="fullName" required value={formData.fullName} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="fatherName">Father’s Name *</Label><Input id="fatherName" required value={formData.fatherName} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="motherName">Mother’s Name *</Label><Input id="motherName" required value={formData.motherName} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>Gender *</Label><Select required onValueChange={handleSelectChange('gender')} value={formData.gender}><SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Date of Birth *</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dob && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dob ? dob.toLocaleDateString() : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dob} onSelect={setDob} initialFocus /></PopoverContent></Popover></div>
                    <div className="space-y-2"><Label htmlFor="contactNumber">Contact Number *</Label><Input id="contactNumber" type="tel" required value={formData.contactNumber} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" required value={formData.email} onChange={handleInputChange} /></div>
                    <div className="space-y-2 md:col-span-2"><Label htmlFor="address">Full Residential Address *</Label><Textarea id="address" required value={formData.address} onChange={handleInputChange} /></div>
                </div>
            </section>

            {/* Academic Information */}
             <section className="space-y-4 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">2. Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2"><Label htmlFor="enrollmentNumber">Enrollment / Admission Number *</Label><Input id="enrollmentNumber" required value={formData.enrollmentNumber} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="rollNumber">Exam Roll Number *</Label><Input id="rollNumber" required value={formData.rollNumber} onChange={handleInputChange} /></div>
                    
                    <div className="space-y-2">
                        <Label>Course/Diploma Name *</Label>
                        <div className="flex gap-2">
                            <Select required onValueChange={handleSelectChange('courseName')} value={formData.courseName}>
                                <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.courseName}>{c.courseName}</SelectItem>)}</SelectContent>
                            </Select>
                            <Button type="button" variant="outline" size="icon" onClick={() => setOpenCourseSetup(true)}><PlusCircle className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Branch / Center Name *</Label>
                        <div className="flex gap-2">
                            <Select required onValueChange={handleSelectChange('branchName')} value={formData.branchName}>
                                <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                <SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                             <Button type="button" variant="outline" size="icon" onClick={() => setOpenBranchSetup(true)}><PlusCircle className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    <div className="space-y-2"><Label htmlFor="academicSession">Academic Session *</Label><Input id="academicSession" placeholder="e.g., 2023-2025" required value={formData.academicSession} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>Course Completion Date *</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !completionDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{completionDate ? completionDate.toLocaleDateString() : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={completionDate} onSelect={setCompletionDate} initialFocus /></PopoverContent></Popover></div>
                    <div className="space-y-2"><Label htmlFor="marksPercentage">Final Percentage or Grade</Label><Input id="marksPercentage" value={formData.marksPercentage} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label htmlFor="registrationNumber">State Council Registration No.</Label><Input id="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} /></div>
                </div>
            </section>

             {/* Certificate Details */}
            <section className="space-y-4 p-6 border rounded-lg">
                 <h3 className="text-lg font-semibold border-b pb-2 mb-4">3. Certificate Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>Type of Certificate Requested *</Label><Select required onValueChange={handleSelectChange('certificateType')} value={formData.certificateType}><SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger><SelectContent><SelectItem value="Diploma">Diploma</SelectItem><SelectItem value="Provisional">Provisional</SelectItem><SelectItem value="Duplicate">Duplicate</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Certificate Print Language</Label><Select onValueChange={handleSelectChange('certificateLanguage')} value={formData.certificateLanguage}><SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Hindi">Hindi</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2 md:col-span-2"><Label htmlFor="issuePurpose">Purpose (e.g., Employment, Higher Studies)</Label><Textarea id="issuePurpose" value={formData.issuePurpose} onChange={handleInputChange} /></div>
                 </div>
            </section>

            {/* Upload Section */}
            <section className="space-y-4 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">4. Upload Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2"><Label htmlFor="studentPhoto">Passport-size Photo *</Label><Input id="studentPhoto" type="file" required accept="image/*" /></div>
                    <div className="space-y-2"><Label htmlFor="marksheetUpload">Final Marksheet *</Label><Input id="marksheetUpload" type="file" required accept=".pdf,image/*" /></div>
                    <div className="space-y-2"><Label htmlFor="idProof">ID Proof (Aadhaar, etc.) *</Label><Input id="idProof" type="file" required accept=".pdf,image/*" /></div>
                    <div className="space-y-2"><Label htmlFor="signatureUpload">Digital Signature</Label><Input id="signatureUpload" type="file" accept="image/*" /></div>
                </div>
            </section>

            {/* Payment Details */}
            <section className="space-y-4 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">5. Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>Application Fee</Label><Input value={`₹ ${formData.applicationFee}`} readOnly disabled /></div>
                    <div className="space-y-2"><Label htmlFor="paymentReference">UPI / Transaction ID</Label><Input id="paymentReference" placeholder="Enter your payment reference" value={formData.paymentReference} onChange={handleInputChange} /></div>
                </div>
            </section>

            {/* Declaration */}
            <section className="space-y-4 p-6 border rounded-lg">
                 <h3 className="text-lg font-semibold border-b pb-2 mb-4">6. Verification & Declaration</h3>
                <div className="flex items-start space-x-2">
                    <Checkbox id="declaration" required checked={formData.declaration} onCheckedChange={(checked) => setFormData(p => ({...p, declaration: !!checked}))} />
                    <div className="grid gap-1.5 leading-none">
                        <label htmlFor="declaration" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I hereby declare that the information provided above is true and correct to the best of my knowledge.
                        </label>
                    </div>
                </div>
            </section>


            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <SuccessDialog 
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="Application Submitted"
        description="Your certificate application has been submitted successfully."
      />

      <SetupDialog
        open={openCourseSetup}
        onOpenChange={setOpenCourseSetup}
        title="Course"
        dbPath="courses"
      />
      
      <SetupDialog
        open={openBranchSetup}
        onOpenChange={setOpenBranchSetup}
        title="Branch"
        dbPath="branches"
      />
    </div>
  );
}
