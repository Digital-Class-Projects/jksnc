
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useDatabase } from "@/firebase";
import { ref, onValue } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Student = {
  id: string;
  photoUrl: string;
  studentName: string;
  fatherName: string;
  dob: string;
  studentMobile: string;
  fullAddress: string;
  enrollmentNo: string;
  rollNo: string;
};

const idCardFrames = [
    { name: "Frame 1", url: "https://i.imgur.com/GZ5gEaV.png" },
    { name: "Frame 2", url: "https://i.imgur.com/9g3D04U.png" },
    { name: "Frame 3", url: "https://i.imgur.com/jM3B8iE.png" },
    { name: "Frame 4", url: "https://i.imgur.com/Jt21s0j.png" },
    { name: "Frame 5", url: "https://i.imgur.com/gO2hA4V.png" },
]


export default function StudentIdCardPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState(idCardFrames[0].url);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);
    const studentsRef = ref(database, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
        const studentsData: Student[] = [];
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            studentsData.push({ 
                id: childSnapshot.key!,
                photoUrl: data.photoUrl || "https://i.imgur.com/iB3gYg0.png",
                studentName: data.studentName,
                fatherName: data.fatherName,
                dob: data.dob ? new Date(data.dob).toLocaleDateString('en-GB') : 'N/A',
                studentMobile: data.studentMobile,
                fullAddress: data.fullAddress,
                enrollmentNo: data.enrollmentNo,
                rollNo: data.rollNo
            });
        });
        setStudents(studentsData);
        setIsLoading(false);
    }, (error) => {
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'Error loading students', description: error.message });
    });

    return () => unsubscribe();
  }, [database, toast]);


  const handleGenerateCard = (student: Student) => {
    const cardHtml = `
      <html>
        <head>
          <title>ID Card - ${student.studentName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: sans-serif; background-color: #f0f2f5; }
            .id-card-container {
              width: 320px; 
              height: 512px;
              position: relative;
              background-image: url('${selectedFrame}');
              background-size: cover;
              background-position: center;
            }
            .card-content {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              z-index: 20;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 20px;
            }
            @media print {
              #print-button { display: none; }
              body { background-color: #fff; }
              .id-card-container {
                  margin: 0;
                  box-shadow: none;
              }
            }
            .content-area {
                position: absolute;
                top: 25%;
                left: 10%;
                right: 10%;
                height: 60%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
          </style>
        </head>
        <body class="flex items-center justify-center min-h-screen">
          <div class="fixed top-4 right-4 z-50">
              <button id="print-button" onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded shadow-lg">Print</button>
          </div>
          <div class="id-card-container shadow-lg">
            <div class="card-content">
              <h3 class="text-lg font-bold mt-10">J.K.S.N.C</h3>
              <p class="text-xs mb-4">Jammu & Kashmir State Nursing Council</p>
              <div class="content-area">
                <img src="${student.photoUrl}" alt="${student.studentName}" class="w-24 h-24 border-2 border-gray-300 rounded-full object-cover" />
                <h4 class="mt-3 font-bold text-base">${student.studentName}</h4>
                <div class="text-xs space-y-1 mt-4 text-left w-full pl-2">
                  <p><span class="font-bold">S/O:</span> ${student.fatherName || 'N/A'}</p>
                  <p><span class="font-bold">D.O.B:</span> ${student.dob}</p>
                  <p><span class="font-bold">Contact:</span> ${student.studentMobile}</p>
                  <p class="text-xs"><span class="font-bold">Address:</span> ${student.fullAddress || 'N/A'}</p>
                  <p><span class="font-bold">Roll No:</span> ${student.rollNo}</p>
                </div>
              </div>
              <div class="absolute bottom-12">
                <p class="text-xs font-bold">Principal</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const newWindow = window.open();
    if(newWindow) {
        newWindow.document.write(cardHtml);
        newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Background Frame</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {idCardFrames.map((frame) => (
                    <Card 
                        key={frame.name}
                        onClick={() => setSelectedFrame(frame.url)}
                        className={cn(
                            "cursor-pointer transition-all",
                            selectedFrame === frame.url ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md"
                        )}
                    >
                        <CardContent className="p-2">
                            <Image 
                                src={frame.url}
                                alt={frame.name}
                                width={160}
                                height={256}
                                className="w-full h-auto aspect-[5/8] object-cover rounded-md"
                            />
                            <p className="text-center text-sm font-medium mt-2">{frame.name}</p>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Criteria</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="admission-session">ADMISSION SESSION</Label>
            <Select>
              <SelectTrigger id="admission-session">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="class">CLASS</Label>
            <Select>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class-a">Class A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
             <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <div className="flex items-center justify-between pt-4">
            <Input placeholder="Search Student..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ADMISSION NO</TableHead>
                <TableHead>STUDENT NAME</TableHead>
                <TableHead>FATHER NAME</TableHead>
                <TableHead>DATE OF BIRTH</TableHead>
                <TableHead>MOBILE NO</TableHead>
                <TableHead className="text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center">Loading students...</TableCell></TableRow>
                ) : students.length > 0 ? (
                    students.map((student) => (
                        <TableRow key={student.id}>
                        <TableCell>{student.enrollmentNo}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.fatherName}</TableCell>
                        <TableCell>{student.dob}</TableCell>
                        <TableCell>{student.studentMobile}</TableCell>
                        <TableCell className="text-right">
                           <Button size="sm" onClick={() => handleGenerateCard(student)}>Generate</Button>
                        </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={6} className="text-center">No students found.</TableCell></TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
