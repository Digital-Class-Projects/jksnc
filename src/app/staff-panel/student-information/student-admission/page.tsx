
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
import { format, parseISO } from "date-fns";
import { CalendarIcon, GraduationCap, PlusCircle, Edit, Trash2, Eye, FileSpreadsheet, FileText, BookOpen, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useDatabase } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, push, set, onValue, serverTimestamp, remove, query, orderByChild, equalTo, get, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';


type Student = {
  id: string;
  uid?: string;
  enrollmentNo: string;
  admissionNo: string;
  studentName: string;
  rollNo: string;
  course: string;
  session: string;
  mobile: string;
  loginStatus: boolean;
  transferTo: string;
  email: string;
  branchId?: string;
  [key: string]: any; // Allow other properties
};

type BranchInfo = {
    id: string;
    name: string;
}

type Course = {
  id: string;
  courseName: string;
}

export default function StudentAdmissionPage() {
  const database = useDatabase();
  const auth = useAuth();
  const { toast } = useToast();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [userBranch, setUserBranch] = useState<BranchInfo | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    if (!database) return;
    const coursesRef = ref(database, 'courses');
    const unsubCourses = onValue(coursesRef, (snapshot) => {
        const coursesData: Course[] = [];
        snapshot.forEach(child => {
            coursesData.push({ id: child.key!, courseName: child.val().courseName });
        });
        setCourses(coursesData);
    });
    return () => unsubCourses();
  }, [database]);

  useEffect(() => {
    if (!database || !auth?.currentUser) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);

    const staffQuery = query(ref(database, 'staff'), orderByChild('uid'), equalTo(auth.currentUser.uid));
    get(staffQuery).then((staffSnapshot) => {
        if (staffSnapshot.exists()) {
            const staffData = Object.values(staffSnapshot.val())[0] as { branchId: string };
            const staffBranchId = staffData.branchId;
            
            const branchesQuery = ref(database, `branches/${staffBranchId}`);
            get(branchesQuery).then((branchSnapshot) => {
                if (branchSnapshot.exists()) {
                    const branchName = branchSnapshot.val().name;
                    setUserBranch({ id: staffBranchId, name: branchName });

                    const studentsRef = query(ref(database, 'students'), orderByChild('branchId'), equalTo(staffBranchId));
                    const unsubscribe = onValue(studentsRef, (snapshot) => {
                        const studentsData: Student[] = [];
                        snapshot.forEach((childSnapshot) => {
                            studentsData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
                        });
                        setAllStudents(studentsData);
                        setFilteredStudents(studentsData);
                        setIsLoading(false);
                    }, (error) => {
                        setIsLoading(false);
                        toast({ variant: 'destructive', title: 'Error loading students', description: error.message });
                    });
                    return unsubscribe;
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
  
  useEffect(() => {
    let results = allStudents;
    if (searchTerm) {
        results = results.filter(student =>
            student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if (filterCourse && filterCourse !== 'all') {
        results = results.filter(student => student.course === filterCourse);
    }
    setFilteredStudents(results);
  }, [searchTerm, filterCourse, allStudents]);

  const handleSearch = () => {
    toast({ title: 'Filters Applied', description: `Showing students matching your criteria.`});
  }

  const handleResetFilters = () => {
      setSearchTerm('');
      setFilterCourse('all');
  }

  const handleAddSuccess = () => {
    setSuccessMessage("The new student has been successfully created.");
    setShowSuccessDialog(true);
    setOpenAddDialog(false);
  }

  const handleEditSuccess = () => {
    setSuccessMessage("Student details have been updated successfully.");
    setShowSuccessDialog(true);
    setOpenEditDialog(false);
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this student? This may also affect their login access.")) {
        try {
            await remove(ref(database, `students/${studentId}`));
            toast({ title: 'Student Deleted', description: 'The student has been removed successfully.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
        }
    }
  }

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setOpenDetailDialog(true);
  };
  
  const handleOpenEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setOpenEditDialog(true);
  }

  const handleExportPDF = () => {
    const doc = new jsPDF();
    (doc as any).autoTable({
        head: [['SR NO.', 'ENROLLMENT NO.', 'STUDENT NAME', 'ROLL NO.', 'COURSE', 'SESSION', 'MOBILE']],
        body: filteredStudents.map((student, index) => [
            index + 1,
            student.enrollmentNo,
            student.studentName,
            student.rollNo,
            student.course,
            student.session,
            student.studentMobile
        ]),
    });
    doc.save('student_admission_list.pdf');
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStudents.map((student, index) => ({
        'SR NO.': index + 1,
        'ENROLLMENT NO.': student.enrollmentNo,
        'STUDENT NAME': student.studentName,
        'ROLL NO.': student.rollNo,
        'COURSE': student.course,
        'SESSION': student.session,
        'MOBILE': student.studentMobile,
        'LOGIN STATUS': student.loginStatus ? 'Active' : 'Inactive',
        'TRANSFER TO': student.transferTo
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "student_admission_list.xlsx");
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
              <p className="text-2xl font-bold">{allStudents.length}</p>
            </div>
          </div>
           <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Course</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </div>
           <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Enquiry</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Select Criteria</CardTitle>
        </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
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
                <Label htmlFor="class">COURSE</Label>
                 <Select value={filterCourse} onValueChange={setFilterCourse}>
                    <SelectTrigger id="class"><SelectValue placeholder="Select Course" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map(course => (
                            <SelectItem key={course.id} value={course.courseName}>{course.courseName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="flex gap-2 justify-start items-end">
                <Button onClick={handleSearch}>Search</Button>
                <Button variant="destructive" onClick={handleResetFilters}>Reset</Button>
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
                <CardTitle>Admission List ({filteredStudents.length})</CardTitle>
                <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1" disabled={!userBranch}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            Add New+
                        </Button>
                    </DialogTrigger>
                    {userBranch && <StudentFormDialog mode="add" onAddSuccess={handleAddSuccess} branch={userBranch} courses={courses} open={openAddDialog} onOpenChange={setOpenAddDialog}/>}
                </Dialog>
           </div>
           <div className="flex items-center justify-between pt-4">
               <Input 
                placeholder="Search Student Name..." 
                className="max-w-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                />
               <div className="flex gap-2">
                   <Button variant="outline" size="icon" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 text-green-600" /></Button>
                   <Button variant="outline" size="icon" onClick={handleExportPDF}><FileText className="h-4 w-4 text-red-600" /></Button>
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
                    ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((student, index) => (
                        <TableRow key={student.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(student)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleViewDetails(student)}><Eye className="h-4 w-4" /></Button>
                            </TableCell>
                            <TableCell>{student.enrollmentNo}</TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell>{student.rollNo}</TableCell>
                            <TableCell>{student.course}</TableCell>
                            <TableCell>{student.session}</TableCell>
                            <TableCell>{student.studentMobile}</TableCell>
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
      
      {selectedStudent && <StudentFormDialog mode="edit" student={selectedStudent} onEditSuccess={handleEditSuccess} branch={userBranch!} courses={courses} open={openEditDialog} onOpenChange={setOpenEditDialog} />}
      <StudentDetailDialog student={selectedStudent} open={openDetailDialog} onOpenChange={setOpenDetailDialog} />
      
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Success!"
        description={successMessage}
      />
    </div>
  );
}

const initialFormData = {
    admissionSession: '',
    admissionNo: '',
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
    session: '2024-2025',
    photoUrl: ''
};

function StudentFormDialog({ mode, student, onAddSuccess, onEditSuccess, branch, courses, open, onOpenChange }: { 
    mode: 'add' | 'edit',
    student?: Student | null,
    onAddSuccess?: () => void,
    onEditSuccess?: () => void,
    branch: BranchInfo,
    courses: Course[],
    open: boolean,
    onOpenChange: (open: boolean) => void,
}) {
    const auth = useAuth();
    const database = useDatabase();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState(initialFormData);

     useEffect(() => {
        if (mode === 'edit' && student) {
            const studentDataForForm = {
                ...initialFormData,
                ...student,
                admissionDate: student.admissionDate ? parseISO(student.admissionDate) : undefined,
                dob: student.dob ? parseISO(student.dob) : undefined,
                loginEmail: '',
                loginPassword: ''
            };
            setFormData(studentDataForForm);
        } else {
            setFormData(initialFormData);
        }
    }, [student, mode, open]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSelectChange = (id: string) => (value: string) => {
         setFormData(prev => ({...prev, [id]: value}));
    }
    
    const handleDateChange = (id: 'admissionDate' | 'dob') => (date: Date | undefined) => {
        setFormData(prev => ({...prev, [id]: date}));
    }

    const handleSubmit = async () => {
        if(!database || !auth) {
            toast({ variant: "destructive", title: "Firebase not initialized" });
            return;
        }
        setIsLoading(true);

        if (mode === 'add') {
            const { loginEmail, loginPassword, studentName, email } = formData;
            if (!loginEmail || !loginPassword || !studentName || !email) {
                toast({ variant: "destructive", title: "Missing Required Fields", description: "Please fill in student name, email, login email, and password." });
                setIsLoading(false);
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
                const user = userCredential.user;

                const studentData = {
                    ...formData,
                    branchId: branch.id, 
                    uid: user.uid,
                    admissionDate: formData.admissionDate ? formData.admissionDate.toISOString() : null,
                    dob: formData.dob ? formData.dob.toISOString() : null,
                    createdAt: serverTimestamp(),
                    loginStatus: true,
                    enrollmentNo: `ENR${Date.now()}`,
                    rollNo: Math.floor(1000 + Math.random() * 9000).toString(),
                    transferTo: "Not Updated"
                };
                
                delete (studentData as any).loginEmail;
                delete (studentData as any).loginPassword;

                const newStudentRef = push(ref(database, 'students'));
                await set(newStudentRef, studentData);

                if (onAddSuccess) onAddSuccess();

            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Failed to add student",
                    description: error.message || "An unknown error occurred.",
                });
            } finally {
                setIsLoading(false);
            }
        } else { // Edit mode
             if (!student?.id) return;
            const { loginEmail, loginPassword, ...studentDataToUpdate } = formData;
            const studentRef = ref(database, `students/${student.id}`);
            
            try {
                await update(studentRef, {
                    ...studentDataToUpdate,
                    admissionDate: formData.admissionDate ? formData.admissionDate.toISOString() : null,
                    dob: formData.dob ? formData.dob.toISOString() : null,
                });
                if (onEditSuccess) onEditSuccess();
            } catch (error: any) {
                 toast({
                    variant: "destructive",
                    title: "Failed to update student",
                    description: error.message || "An unknown error occurred.",
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? `Add New Admission to ${branch.name}` : `Edit Student: ${student?.studentName}`}</DialogTitle>
                    <DialogDescription>
                       {mode === 'add' ? 'Fill in the details below to add a new student. Fields marked with * are required.' : 'Update the details for this student.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[80vh] overflow-y-auto p-1 pr-4">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-6">
                        <div className="space-y-2">
                            <Label>ADMISSION SESSION*</Label>
                            <Select onValueChange={handleSelectChange('admissionSession')} value={formData.admissionSession}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent><SelectItem value="2024-2025">2024-2025</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>ADMISSION NO*</Label>
                            <Input id="admissionNo" value={formData.admissionNo} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label>ENROLLMENT NO</Label>
                            <Input placeholder={mode === 'add' ? "Auto Generated" : formData.enrollmentNo} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>ADMISSION DATE*</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.admissionDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.admissionDate ? format(formData.admissionDate, "PPP") : "mm/dd/yyyy"}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.admissionDate} onSelect={handleDateChange('admissionDate')} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                    </div>

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
                                    {formData.dob ? format(formData.dob, "PPP") : "mm/dd/yyyy"}
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
                            <Select onValueChange={handleSelectChange('course')} value={formData.course}>
                                <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.courseName}>{course.courseName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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

                    <div className="border-b pb-6">
                        <h3 className="text-lg font-medium mb-4">Document Uploads</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="space-y-2"><Label>UPLOAD PHOTO</Label><Input type="file" onChange={handleFileChange} /></div>
                            <div className="space-y-2"><Label>UPLOAD ADHAAR</Label><Input type="file" /></div>
                            <div className="space-y-2"><Label>UPLOAD 10TH MARKSHEET</Label><Input type="file" /></div>
                            <div className="space-y-2"><Label>UPLOAD 12TH MARKSHEET</Label><Input type="file" /></div>
                            <div className="space-y-2"><Label>UPLOAD FEE RECEIPT</Label><Input type="file" /></div>
                        </div>
                    </div>
                    
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
                    
                    {mode === 'add' && (
                        <div>
                            <h3 className="text-lg font-medium mb-4">Login Credential</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loginEmail">LOGIN E-MAIL*</Label>
                                    <Input id="loginEmail" type="email" value={formData.loginEmail} onChange={handleInputChange} autoComplete="off"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loginPassword">LOGIN PASSWORD*</Label>
                                    <Input id="loginPassword" type="password" value={formData.loginPassword} onChange={handleInputChange} autoComplete="new-password"/>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </div>
                <DialogFooter className="pt-6">
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit Now"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StudentDetailDialog({ student, open, onOpenChange }: { student: Student | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    if (!student) return null;

    const details = [
        { label: "Enrollment No", value: student.enrollmentNo },
        { label: "Admission No", value: student.admissionNo },
        { label: "Roll No", value: student.rollNo },
        { label: "Student Name", value: student.studentName },
        { label: "Father's Name", value: student.fatherName },
        { label: "Mother's Name", value: student.motherName },
        { label: "Course", value: student.course },
        { label: "Session", value: student.session },
        { label: "Date of Birth", value: student.dob ? format(parseISO(student.dob), "PPP") : 'N/A' },
        { label: "Gender", value: student.gender },
        { label: "Category", value: student.category },
        { label: "Religion", value: student.religion },
        { label: "Aadhar No", value: student.aadharNo },
        { label: "Mobile", value: student.studentMobile },
        { label: "Alternate Mobile", value: student.alternateMobile },
        { label: "Email", value: student.email },
        { label: "State", value: student.state },
        { label: "City/Village", value: student.city },
        { label: "Post Office", value: student.postOffice },
        { label: "Pin Code", value: student.pinCode },
        { label: "Full Address", value: student.fullAddress },
        { label: "Admission Date", value: student.admissionDate ? format(parseISO(student.admissionDate), "PPP") : 'N/A'},
        { label: "Admission Session", value: student.admissionSession },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Student Details</DialogTitle>
                    <DialogDescription>
                        Full information for {student.studentName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 py-4">
                        {details.map(detail => (
                            <div key={detail.label} className="flex flex-col">
                                <Label className="text-sm text-muted-foreground">{detail.label}</Label>
                                <p className="font-medium break-words">{detail.value || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
