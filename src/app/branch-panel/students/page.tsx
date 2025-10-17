
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
import { format } from "date-fns";
import { CalendarIcon, GraduationCap, PlusCircle, Edit, Trash2, Eye, FileSpreadsheet, FileText } from "lucide-react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

type Student = {
  id: string;
  enrollmentNo: string;
  studentName: string;
  rollNo: string;
  course: string;
  session: string;
  mobile: string;
  loginStatus: boolean;
  transferTo: string;
};

const initialStudents: Student[] = [
    {
        id: "1",
        enrollmentNo: "1",
        studentName: "Mohd Fahad",
        rollNo: "1",
        course: "Not Updated",
        session: "-",
        mobile: "7348038685",
        loginStatus: true,
        transferTo: "Not Updated",
    },
]

export default function StudentAdmissionPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Student</p>
              <p className="text-2xl font-bold">{students.length}</p>
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
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !null && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        mm/dd/yyyy
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-1">
                <Label htmlFor="to-date">TO DATE</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !null && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        mm/dd/yyyy
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" initialFocus />
                    </PopoverContent>
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
                        <Button size="sm" className="gap-1">
                            <PlusCircle className="h-3.5 w-3.5" />
                            Add New+
                        </Button>
                    </DialogTrigger>
                    <AddNewStudentDialog />
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
                    {students.map((student, index) => (
                    <TableRow key={student.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="flex gap-1">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
                    ))}
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
    </div>
  );
}


function AddNewStudentDialog() {
    return (
        <DialogContent className="max-w-6xl">
            <DialogHeader>
                <DialogTitle>Add New Admission</DialogTitle>
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
                        <Select>
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
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !null && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />mm/dd/yyyy</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-6">
                    <div className="space-y-2">
                        <Label>STUDENT NAME*</Label>
                        <Input />
                    </div>
                     <div className="space-y-2">
                        <Label>FATHER NAME</Label>
                        <Input />
                    </div>
                    <div className="space-y-2">
                        <Label>MOTHER NAME</Label>
                        <Input />
                    </div>
                    <div className="space-y-2">
                        <Label>DATE OF BIRTH*</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !null && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />mm/dd/yyyy</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label>GENDER*</Label>
                         <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label>CATEGORY*</Label>
                         <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="gen">GEN</SelectItem><SelectItem value="obc">OBC</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label>RELIGION*</Label>
                         <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="hindu">Hindu</SelectItem><SelectItem value="muslim">Muslim</SelectItem></SelectContent></Select>
                    </div>
                     <div className="space-y-2">
                        <Label>AADHAR NO</Label>
                        <Input />
                    </div>
                </div>
                
                {/* Contact and Course */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-6">
                    <div className="space-y-2">
                        <Label>STUDENT MOBILE*</Label>
                        <Input type="tel" />
                    </div>
                    <div className="space-y-2">
                        <Label>ALTERNATE MOBILE</Label>
                        <Input type="tel" />
                    </div>
                    <div className="space-y-2">
                        <Label>EMAIL ID*</Label>
                        <Input type="email" />
                    </div>
                    <div className="space-y-2">
                        <Label>COURSE*</Label>
                        <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="course-1">Course 1</SelectItem></SelectContent></Select>
                    </div>
                 </div>

                {/* Address */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-6">
                    <div className="space-y-2">
                        <Label>STATE*</Label>
                        <Input />
                    </div>
                    <div className="space-y-2">
                        <Label>CITY/VILLAGE</Label>
                        <Input />
                    </div>
                    <div className="space-y-2">
                        <Label>POST OFFICE</Label>
                        <Input />
                    </div>
                     <div className="space-y-2">
                        <Label>PIN CODE</Label>
                        <Input />
                    </div>
                    <div className="space-y-2 md:col-span-4">
                        <Label>FULL ADDRESS*</Label>
                        <Textarea />
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
                            <Label>LOGIN E-MAIL*</Label>
                            <Input type="email" />
                        </div>
                        <div className="space-y-2">
                            <Label>LOGIN PASSWORD*</Label>
                            <Input type="password" />
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <DialogFooter className="pt-6">
                <Button>Submit Now</Button>
            </DialogFooter>
        </DialogContent>
    );
}


    