

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
    { name: "Frame 1", url: "https://ik.imagekit.io/rgazxzsxr/download%20(1).jpeg?updatedAt=1762158919465" },
    { name: "Frame 2", url: "https://ik.imagekit.io/rgazxzsxr/download.jpeg?updatedAt=1762158919459" },
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
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            body { font-family: 'Roboto', sans-serif; background-color: #f0f2f5; }
            .id-card-container {
              width: 320px; 
              height: 512px;
              position: relative;
              background-image: url('${selectedFrame}');
              background-size: cover;
              background-position: center;
              color: black;
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
              body { background-color: #fff; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              .id-card-container {
                  margin: 0 auto;
                  box-shadow: none;
                  -webkit-print-color-adjust: exact;
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
            .student-photo {
                width: 96px;
                height: 96px;
                border: 2px solid #ccc;
                border-radius: 9999px;
                object-fit: cover;
            }
            .student-name {
                margin-top: 12px;
                font-weight: 700;
                font-size: 1rem;
            }
            .details-grid {
                font-size: 0.75rem; /* 12px */
                line-height: 1.25;
                margin-top: 16px;
                text-align: left;
                width: 100%;
                padding-left: 8px;
            }
          </style>
        </head>
        <body class="flex items-center justify-center min-h-screen">
          <div class="fixed top-4 right-4 z-50">
              <button id="print-button" onclick="window.print()" style="background-color: #3B82F6; color: white; padding: 8px 16px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">Print</button>
          </div>
          <div class="id-card-container shadow-lg">
            <div class="card-content">
              <h3 style="font-size: 1.125rem; font-weight: 700; margin-top: 40px; color: #334155;">J.K.S.N.C</h3>
              <p style="font-size: 0.75rem; margin-bottom: 16px; color: #475569;">Jammu & Kashmir State Nursing Council</p>
              <div class="content-area">
                <img src="${student.photoUrl}" alt="${student.studentName}" class="student-photo" />
                <h4 class="student-name">${student.studentName}</h4>
                <div class="details-grid">
                  <p><b style="color: #1E293B;">S/O:</b> ${student.fatherName || 'N/A'}</p>
                  <p><b style="color: #1E293B;">D.O.B:</b> ${student.dob}</p>
                  <p><b style="color: #1E293B;">Contact:</b> ${student.studentMobile}</p>
                  <p style="font-size: 0.7rem;"><b style="color: #1E293B;">Address:</b> ${student.fullAddress || 'N/A'}</p>
                  <p><b style="color: #1E293B;">Roll No:</b> ${student.rollNo}</p>
                </div>
              </div>
              <div style="position: absolute; bottom: 48px; text-align: center; width: 100%;">
                <p style="font-size: 0.75rem; font-weight: 700; color: #334155;">Principal</p>
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
