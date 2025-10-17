
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, GraduationCap, PlusCircle, Edit, Trash2, Eye, FileSpreadsheet, FileText, BookOpen, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useDatabase } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, push, set, onValue, serverTimestamp, remove, query, orderByChild, equalTo, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";

type Student = {
  id: string;
  uid?: string;
  enrollmentNo: string;
  studentName: string;
  rollNo: string;
  course: string;
  session: string;
  mobile: string;
  loginStatus: boolean;
  transferTo: string;
  email: string;
  branchId?: string;
};

type BranchInfo = {
    id: string;
    name: string;
}

export default function StudentAdmissionPage() {
  const database = useDatabase();
  const auth = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [userBranch, setUserBranch] = useState<BranchInfo | null>(null);

  useEffect(() => {
    if (!database || !auth?.currentUser) return;
    setIsLoading(true);

    // Fetch the current staff member's branch
    const staffQuery = query(ref(database, 'staff'), orderByChild('uid'), equalTo(auth.currentUser.uid));
    get(staffQuery).then((staffSnapshot) => {
        if (staffSnapshot.exists()) {
            const staffData = staffSnapshot.val();
            const staffMember = Object.values(staffData)[0] as { branch: string };
            
            // Find the branch ID from the branch name
            const branchesQuery = query(ref(database, 'branches'), orderByChild('name'), equalTo(staffMember.branch));
            get(branchesQuery).then((branchSnapshot) => {
                if (branchSnapshot.exists()) {
                    const branchId = Object.keys(branchSnapshot.val())[0];
                    const branchName = branchSnapshot.val()[branchId].name;
                    setUserBranch({ id: branchId, name: branchName });

                    // Now load students for that branch
                    const studentsRef = query(ref(database, 'students'), orderByChild('branchId'), equalTo(branchId));
                    const unsubscribe = onValue(studentsRef, (snapshot) => {
                        const studentsData: Student[] = [];
                        snapshot.forEach((childSnapshot) => {
                            studentsData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
                        });
                        setStudents(studentsData);
                        setIsLoading(false);
                    }, (error) => {
                        setIsLoading(false);
                        toast({ variant: 'destructive', title: 'Error loading students', description: error.message });
                    });
                    return () => unsubscribe();
                } else {
                    setIsLoading(false);
                    toast({variant: 'destructive', title: 'Branch not found', description: "The staff's assigned branch could not be found."})
                }
            });
        } else {
            setIsLoading(false);
            toast({variant: 'destructive', title: 'Staff not found', description: "Your staff profile could not be located."})
        }
    });

  }, [database, auth, toast]);
  
  const handleAddSuccess = () => {
    setShowSuccessDialog(true);
    setOpenAddDialog(false);
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this student? This may also affect their login access.")) {
        try {
            await remove(ref(database, `students/${studentId}`));
            toast({ title: 'Student Deleted', description: 'The student has been removed successfully.' });
            // Note: This does not delete the Firebase Auth user. That would require a backend function for security reasons.
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
        }
    }
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Student</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </div>
           <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Course</p>
              <p className="text-2xl font-bold">1</p> {/* This can be made dynamic later */}
            </div>
          </div>
           <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Enquiry</p>
              <p className="text-2xl font-bold">0</p> {/* This can be made dynamic later */}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Select Criteria</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
                <Label htmlFor="admission-session">ADMISSION SESSION</Label>
                <Select>
                    <SelectTrigger id="admission-session"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="class">CLASS</Label>
                <Select>
                    <SelectTrigger id="class"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="class-a">Class A</SelectItem>
                        <SelectItem value="class-b">Class B</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="section">SECTION</Label>
                <Select>
                    <SelectTrigger id="section"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                         <SelectItem value="section-1">Section 1</SelectItem>
                         <SelectItem value="section-2">Section 2</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="from-date">FROM DATE</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!null && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        mm/dd/yyyy
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent>
                </Popover>
            </div>
            <div className="space-y-1">
                <Label htmlFor="to-date">TO DATE</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !null && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        mm/dd/yyyy
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent>
                </Popover>
            </div>
             <div className="flex gap-2 justify-end md:col-span-3 lg:col-span-5">
                <Button variant="destructive">Reset</Button>
                <Button>Search</Button>
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
                <CardTitle>Admission List ({students.length})</CardTitle>
                <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1" disabled={!userBranch}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            Add New+
                        </Button>
                    </DialogTrigger>
                    {userBranch && <AddNewStudentDialog onAddSuccess={handleAddSuccess} branch={userBranch} />}
                </Dialog>
           </div>
           <div className="flex items-center justify-between pt-4">
               <Input placeholder="Search Data...." className="max-w-sm" />
               <div className="flex gap-2">
                   <Button variant="outline" size="icon"><FileSpreadsheet className="h-4 w-4 text-green-600" /></Button>
                   <Button variant="outline" size="icon"><FileText className="h-4 w-4 text-red-600" /></Button>
               </div>
           </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SR NO.</TableHead>
                        <TableHead>ACTION</TableHead>
                        <TableHead>DETAILS</TableHead>
                        <TableHead>ENROLLMENT NO.</TableHead>
                        <TableHead>STUDENT NAME</TableHead>
                        <TableHead>ROLL NO.</TableHead>
                        <TableHead>COURSE</TableHead>
                        <TableHead>SESSION</TableHead>
                        <TableHead>MOBILE</TableHead>
                        <TableHead>LOGIN STATUS</TableHead>
                        <TableHead>TRANSFER TO</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={11} className="text-center">Loading students...</TableCell></TableRow>
                    ) : students.length > 0 ? (
                        students.map((student, index) => (
                        <TableRow key={student.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="flex gap-1">
                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            </TableCell>
                            <TableCell>{student.enrollmentNo}</TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell>{student.rollNo}</TableCell>
                            <TableCell>{student.course}</TableCell>
                            <TableCell>{student.session}</TableCell>
                            <TableCell>{student.mobile}</TableCell>
                            <TableCell>
                                <Switch checked={student.loginStatus} />
                            </TableCell>
                            <TableCell>{student.transferTo}</TableCell>
                        </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={11} className="text-center">No students found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
             <div className="flex justify-end items-center mt-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <span className="text-sm font-medium">Page 1 of 1</span>
                    <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
        </CardContent>
      </Card>
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Student Added!"
        description="The new student has been successfully created."
      />
    </div>
  );
}

function AddNewStudentDialog({ onAddSuccess, branch }: { onAddSuccess: () => void, branch: BranchInfo }) {
    const auth = useAuth();
    const database = useDatabase();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        admissionSession: '',
        admissionDate: undefined as Date | undefined,
        studentName: '',
        fatherName: '',
        motherName: '',
        dob: undefined as Date | undefined,
        gender: '',
        category: '',
        religion: '',
        aadharNo: '',
        studentMobile: '',
        alternateMobile: '',
        email: '',
        course: '',
        state: '',
        city: '',
        postOffice: '',
        pinCode: '',
        fullAddress: '',
        loginEmail: '',
        loginPassword: '',
        session: '2024-2025' // Default or derived session
    });

    const resetForm = () => {
        setFormData({
            admissionSession: '', admissionDate: undefined, studentName: '', fatherName: '', motherName: '', dob: undefined, gender: '', category: '',
            religion: '', aadharNo: '', studentMobile: '', alternateMobile: '', email: '', course: '', state: '', city: '', postOffice: '',
            pinCode: '', fullAddress: '', loginEmail: '', loginPassword: '', session: '2024-2025'
        });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleSelectChange = (id: string) => (value: string) => {
         setFormData(prev => ({...prev, [id]: value}));
    }
    
    const handleDateChange = (id: string) => (date: Date | undefined) => {
        setFormData(prev => ({...prev, [id]: date}));
    }

    const handleSubmit = async () => {
        if(!database || !auth) {
            toast({ variant: "destructive", title: "Firebase not initialized" });
            return;
        }

        const { loginEmail, loginPassword, studentName, email } = formData;

        if (!loginEmail || !loginPassword || !studentName || !email) {
            toast({ variant: "destructive", title: "Missing Required Fields", description: "Please fill in student name, email, login email, and password." });
            return;
        }
        
        setIsLoading(true);

        try {
            // 1. Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
            const user = userCredential.user;

            // 2. Prepare data for Realtime Database
            const studentData = {
                ...formData,
                branchId: branch.id, // Ensure branchId is set
                uid: user.uid,
                admissionDate: formData.admissionDate ? formData.admissionDate.toISOString() : null,
                dob: formData.dob ? formData.dob.toISOString() : null,
                createdAt: serverTimestamp(),
                loginStatus: true,
                enrollmentNo: `ENR${Date.now()}`, // Simple auto-generation
                rollNo: Math.floor(1000 + Math.random() * 9000).toString(), // Simple random roll no
                transferTo: "Not Updated"
            };
            
            // Remove login credentials before saving to DB
            delete (studentData as any).loginEmail;
            delete (studentData as any).loginPassword;

            // 3. Save student data to Realtime Database
            const newStudentRef = push(ref(database, 'students'));
            await set(newStudentRef, studentData);

            // 4. Success
            resetForm();
            onAddSuccess();

        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Failed to add student",
                description: error.message || "An unknown error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <DialogContent className="max-w-6xl">
            <DialogHeader>
                <DialogTitle>Add New Admission to {branch.name}</DialogTitle>
                <DialogDescription>
                    Fill in the details below to add a new student. Fields marked with * are required.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto p-1 pr-4">
            <div className="space-y-6">
                {/* Session and Enrollment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
                     <div className="space-y-2">
                        <Label>ADMISSION SESSION*</Label>
                        <Select onValueChange={handleSelectChange('admissionSession')} value={formData.admissionSession}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent><SelectItem value="2024-2025">2024-2025</SelectItem></SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>ENROLLMENT NO</Label>
                        <Input placeholder="Auto Generated" disabled />
                    </div>
                     <div className="space-y-2">
                        <Label>ADMISSION DATE*</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.admissionDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.admissionDate ? formData.admissionDate.toLocaleDateString() : "mm/dd/yyyy"}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.admissionDate} onSelect={handleDateChange('admissionDate')} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="studentName">STUDENT NAME*</Label>
                        <Input id="studentName" value={formData.studentName} onChange={handleInputChange}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fatherName">FATHER NAME</Label>
                        <Input id="fatherName" value={formData.fatherName} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="motherName">MOTHER NAME</Label>
                        <Input id="motherName" value={formData.motherName} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label>DATE OF BIRTH*</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.dob && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.dob ? formData.dob.toLocaleDateString() : "mm/dd/yyyy"}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.dob} onSelect={handleDateChange('dob')} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label>GENDER*</Label>
                         <Select onValueChange={handleSelectChange('gender')} value={formData.gender}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label>CATEGORY*</Label>
                         <Select onValueChange={handleSelectChange('category')} value={formData.category}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="gen">GEN</SelectItem><SelectItem value="obc">OBC</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label>RELIGION*</Label>
                         <Select onValueChange={handleSelectChange('religion')} value={formData.religion}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="hindu">Hindu</SelectItem><SelectItem value="muslim">Muslim</SelectItem></SelectContent></Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="aadharNo">AADHAR NO</Label>
                        <Input id="aadharNo" value={formData.aadharNo} onChange={handleInputChange}/>
                    </div>
                </div>
                
                {/* Contact and Course */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="studentMobile">STUDENT MOBILE*</Label>
                        <Input id="studentMobile" type="tel" value={formData.studentMobile} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="alternateMobile">ALTERNATE MOBILE</Label>
                        <Input id="alternateMobile" type="tel" value={formData.alternateMobile} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">EMAIL ID*</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label>COURSE*</Label>
                        <Select onValueChange={handleSelectChange('course')} value={formData.course}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="course-1">Course 1</SelectItem></SelectContent></Select>
                    </div>
                 </div>

                {/* Address */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-6">
                    <div className="space-y-2">
                        <Label htmlFor="state">STATE*</Label>
                        <Input id="state" value={formData.state} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">CITY/VILLAGE</Label>
                        <Input id="city" value={formData.city} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postOffice">POST OFFICE</Label>
                        <Input id="postOffice" value={formData.postOffice} onChange={handleInputChange}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pinCode">PIN CODE</Label>
                        <Input id="pinCode" value={formData.pinCode} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2 md:col-span-4">
                        <Label htmlFor="fullAddress">FULL ADDRESS*</Label>
                        <Textarea id="fullAddress" value={formData.fullAddress} onChange={handleInputChange}/>
                    </div>
                </div>

                {/* Document Uploads */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-medium mb-4">Document Uploads</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="space-y-2"><Label>UPLOAD PHOTO</Label><Input type="file" /></div>
                        <div className="space-y-2"><Label>UPLOAD ADHAAR</Label><Input type="file" /></div>
                        <div className="space-y-2"><Label>UPLOAD 10TH MARKSHEET</Label><Input type="file" /></div>
                        <div className="space-y-2"><Label>UPLOAD 12TH MARKSHEET</Label><Input type="file" /></div>
                        <div className="space-y-2"><Label>UPLOAD FEE RECEIPT</Label><Input type="file" /></div>
                    </div>
                </div>
                
                {/* Education Qualification */}
                <div className="border-b pb-6">
                     <h3 className="text-lg font-medium mb-4">Education Qualification</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[5%]">S.NO</TableHead>
                                <TableHead>EXAMINATION</TableHead>
                                <TableHead>BOARD/UNIVERSITY</TableHead>
                                <TableHead>YEAR</TableHead>
                                <TableHead>SUBJECTS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1,2,3].map((item) => (
                                <TableRow key={item}>
                                    <TableCell>{item}</TableCell>
                                    <TableCell><Input /></TableCell>
                                    <TableCell><Input /></TableCell>
                                    <TableCell><Input /></TableCell>
                                    <TableCell><Input /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </div>
                
                 {/* Login Credentials */}
                <div>
                     <h3 className="text-lg font-medium mb-4">Login Credential</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="loginEmail">LOGIN E-MAIL*</Label>
                            <Input id="loginEmail" type="email" value={formData.loginEmail} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="loginPassword">LOGIN PASSWORD*</Label>
                            <Input id="loginPassword" type="password" value={formData.loginPassword} onChange={handleInputChange}/>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <DialogFooter className="pt-6">
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Now"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
