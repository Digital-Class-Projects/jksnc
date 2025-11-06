
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useDatabase } from "@/firebase";
import { onValue, query, ref, orderByChild, equalTo } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type StudentData = {
  studentName: string;
  enrollmentNo: string;
  rollNo: string;
  fatherName: string;
  course: string; 
  session: string;
  dob: string;
  gender: string;
  studentMobile: string;
  email: string;
  admissionDate: string;
  photoUrl?: string;
  motherName: string;
  category: string;
  religion: string;
  aadharNo: string;
  alternateMobile: string;
  state: string;
  city: string;
  postOffice: string;
  pinCode: string;
  fullAddress: string;
};

export default function StudentPanelPage() {
  const auth = useAuth();
  const database = useDatabase();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!auth?.currentUser || !database) {
      if (!auth?.currentUser) {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    const currentUserUid = auth.currentUser.uid;
    const studentsQuery = query(ref(database, 'students'), orderByChild('uid'), equalTo(currentUserUid));

    const unsubscribe = onValue(studentsQuery, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const studentKey = Object.keys(data)[0];
            const studentRecord = data[studentKey];
            setStudentData(studentRecord as StudentData);
        } else {
            toast({
                variant: 'destructive',
                title: 'No student data found',
                description: 'Your student profile could not be found. Please contact administration.'
            });
        }
        setIsLoading(false);
    }, (error) => {
        toast({ variant: 'destructive', title: 'Error fetching data', description: error.message });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, database, toast]);

  const DetailForm = ({ data }: { data: StudentData }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="space-y-2">
            <Label>ENROLLMENT NO.</Label>
            <Input value={data.enrollmentNo || ''} readOnly />
        </div>
         <div className="space-y-2">
            <Label>ROLL NO.</Label>
            <Input value={data.rollNo || ''} readOnly />
        </div>
         <div className="space-y-2">
            <Label>ADMISSION DATE</Label>
            <Input value={data.admissionDate ? new Date(data.admissionDate).toLocaleDateString() : ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>COURSE</Label>
            <Input value={data.course || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>STUDENT NAME</Label>
            <Input value={data.studentName || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>FATHER NAME</Label>
            <Input value={data.fatherName || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>MOTHER NAME</Label>
            <Input value={data.motherName || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>D.O.B</Label>
            <Input value={data.dob ? new Date(data.dob).toLocaleDateString() : ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>GENDER</Label>
            <Input value={data.gender || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>CATEGORY</Label>
            <Input value={data.category || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>RELIGION</Label>
            <Input value={data.religion || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>AADHAR NO.</Label>
            <Input value={data.aadharNo || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>STUDENT MOBILE</Label>
            <Input value={data.studentMobile || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>ALTERNATE MOBILE</Label>
            <Input value={data.alternateMobile || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>EMAIL ID</Label>
            <Input value={data.email || ''} readOnly />
        </div>
         <div className="space-y-2">
            <Label>STATE</Label>
            <Input value={data.state || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>CITY/VILLAGE</Label>
            <Input value={data.city || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>POST OFFICE</Label>
            <Input value={data.postOffice || ''} readOnly />
        </div>
        <div className="space-y-2">
            <Label>PIN CODE</Label>
            <Input value={data.pinCode || ''} readOnly />
        </div>
         <div className="space-y-2 md:col-span-4">
            <Label>FULL ADDRESS</Label>
            <Input value={data.fullAddress || ''} readOnly />
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
          <Skeleton className="h-32 w-full" />
      ) : studentData ? (
        <Card className="shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-semibold">
                <span role="img" aria-label="waving hand" className="mr-2">👋</span>
                Welcome, {studentData?.studentName || 'Student'}
                </h2>
                <p className="text-muted-foreground">
                I get up every morning and it's going to be a great day. You never know when it's going to be over so I refuse to have a bad day.
                </p>
            </div>
            <div className="hidden md:block">
                <Image
                src="https://picsum.photos/seed/student-welcome/180/120"
                alt="Welcome Illustration"
                width={180}
                height={120}
                className="rounded-lg"
                data-ai-hint="person working laptop"
                />
            </div>
            </CardContent>
        </Card>
      ) : (
          <Card className="shadow-md">
            <CardContent className="p-6">
                 <h2 className="text-2xl font-semibold">Welcome, Student</h2>
                 <p className="text-muted-foreground">Please log in to view your dashboard. If you are logged in and see this message, please contact support.</p>
            </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          {isLoading ? (
            <div className="flex items-center gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
          ) : studentData ? (
             <div className="flex items-center gap-6">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={studentData.photoUrl || 'https://i.imgur.com/iB3gYg0.png'} alt={studentData.studentName} data-ai-hint="student portrait" />
                    <AvatarFallback>{studentData.studentName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 font-medium text-sm">
                    <p>Name : {studentData.studentName}</p>
                    <p>Enrollment No. : {studentData.enrollmentNo}</p>
                    <p>Roll No. : {studentData.rollNo}</p>
                    <p>Father Name : {studentData.fatherName}</p>
                    <p>Course : {studentData.course}</p>
                    <p>Section : {studentData.session || 'A'}</p>
                </div>
            </div>
          ) : (
            <p>No student data available.</p>
          )}
           <Button variant="outline" className="bg-cyan-400 text-white hover:bg-cyan-500 hover:text-white">Print Form</Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="flex-wrap h-auto justify-start">
              <TabsTrigger value="details">View Details</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="marksheet">Marksheet</TabsTrigger>
              <TabsTrigger value="material">Study Material</TabsTrigger>
              <TabsTrigger value="docs">My Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
                {isLoading ? (
                    <Skeleton className="h-64 w-full mt-6" />
                ) : studentData ? (
                    <DetailForm data={studentData} />
                ) : (
                    <p className="text-center py-8">No details to display.</p>
                )}
            </TabsContent>
             <TabsContent value="fees"><p className="p-4 text-center">Fees information is not available yet.</p></TabsContent>
             <TabsContent value="marksheet"><p className="p-4 text-center">Marksheet is not available yet.</p></TabsContent>
             <TabsContent value="material"><p className="p-4 text-center">Study materials are not available yet.</p></TabsContent>
             <TabsContent value="docs"><p className="p-4 text-center">Your documents are not available yet.</p></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
