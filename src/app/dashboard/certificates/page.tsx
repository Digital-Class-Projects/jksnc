
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, useDatabase } from "@/firebase";
import { ref, onValue, query, orderByChild, equalTo, push, set, serverTimestamp } from "firebase/database";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

type CertificateTemplate = {
  id: string;
  name: string;
  imageUrl: string;
};

type Branch = {
  id: string;
  name: string;
};

type Student = {
  id: string;
  uid: string;
  studentName: string;
  fatherName: string;
  dob: string;
  course: string;
  rollNo: string;
  branchId: string;
  session: string;
};

const certificateTemplates: CertificateTemplate[] = [
  { id: 'migration', name: 'Migration Certificate', imageUrl: 'https://ik.imagekit.io/rgazxzsxr/Migration%20Certifiate.png?updatedAt=1760612547767' },
];

function CertificateGenerator() {
  const database = useDatabase();
  const auth = useAuth();
  const { toast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | undefined>(certificateTemplates[0]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [certDesignUrl, setCertDesignUrl] = useState(certificateTemplates[0].imageUrl);

   // Load certificate design from DB
  useEffect(() => {
    if (!database) return;
    const designRef = ref(database, 'websiteContent/content/certificateDesigns/migration/imageUrl');
    const unsubscribe = onValue(designRef, (snapshot) => {
        if (snapshot.exists()) {
            setCertDesignUrl(snapshot.val());
        }
    });
    return () => unsubscribe();
  }, [database]);


  // Load branches
  useEffect(() => {
    if (!database) return;
    const branchesRef = ref(database, 'branches');
    const unsubscribe = onValue(branchesRef, (snapshot) => {
      const branchesData: Branch[] = [];
      snapshot.forEach(child => {
        const val = child.val();
        branchesData.push({ id: child.key!, name: val.name });
      });
      setBranches(branchesData);
    });
    return () => unsubscribe();
  }, [database]);

  // Load students for selected branch
  useEffect(() => {
    if (!database || !selectedBranchId) {
      setStudents([]);
      setSelectedStudentId('');
      setSelectedStudent(null);
      return;
    }

    setIsLoadingStudents(true);
    const studentsQuery = query(ref(database, 'students'), orderByChild('branchId'), equalTo(selectedBranchId));

    const unsubscribe = onValue(studentsQuery, (snapshot) => {
      const studentData: Student[] = [];
      if (snapshot.exists()) {
          snapshot.forEach(child => {
            const val = child.val();
            studentData.push({ id: child.key!, ...val });
          });
      }
      setStudents(studentData);
      setIsLoadingStudents(false);
    }, (error) => {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load students for this branch.'});
      setIsLoadingStudents(false)
    });

    return () => unsubscribe();
  }, [database, selectedBranchId, toast]);

  // Update selected student
  useEffect(() => {
    const student = students.find(s => s.id === selectedStudentId);
    setSelectedStudent(student || null);
  }, [selectedStudentId, students]);

  // Generate certificate
  const handleGenerate = async () => {
    if (!database || !auth?.currentUser || !selectedTemplate || !selectedStudent) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a template and a student.' });
      return;
    }

    const certificateRecord = {
        studentId: selectedStudent.uid,
        branchId: selectedStudent.branchId,
        certificateType: selectedTemplate.name,
        issueDate: serverTimestamp(),
        issuedBy: auth.currentUser.uid,
        studentName: selectedStudent.studentName,
        certificateDetails: {
            ...selectedStudent
        }
    };

    try {
        const certificatesRef = ref(database, 'generatedCertificates');
        const newCertificateRef = push(certificatesRef);
        await set(newCertificateRef, certificateRecord);
        toast({ title: "Certificate Issued", description: "The certificate record has been saved." });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Database Error', description: `Could not save certificate record: ${error.message}` });
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Popup blocked', description: 'Please allow popups for this site.' });
      return;
    }

    const student = selectedStudent;
    const certificateHtml = `
      <html>
        <head>
          <title>${selectedTemplate.name} - ${student.studentName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap');
            body { margin: 0; font-family: 'Tinos', serif; }
            .certificate-container {
              width: 827px;
              height: 1169px;
              position: relative;
              background-image: url('${certDesignUrl}');
              background-size: 100% 100%;
              background-repeat: no-repeat;
            }
            .data-field {
              position: absolute;
              font-size: 18px;
              font-weight: 400;
              color: #333;
              letter-spacing: 1px;
            }
            #student-name { top: 400px; left: 240px; }
            #father-name { top: 442px; left: 265px; }
            #course-name { top: 485px; left: 255px; }
            #year { top: 528px; left: 590px; }
            #roll-no { top: 572px; left: 230px; }

            @media print {
              @page { size: A4; margin: 0; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div id="student-name" class="data-field">${student.studentName}</div>
            <div id="father-name" class="data-field">${student.fatherName}</div>
            <div id="course-name" class="data-field">${student.course}</div>
            <div id="year" class="data-field">${student.session.split('-')[1] || new Date().getFullYear()}</div>
            <div id="roll-no" class="data-field">${student.rollNo}</div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(certificateHtml);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label>Select Certificate Design</Label>
          <Select onValueChange={(val) => setSelectedTemplate(certificateTemplates.find(t => t.id === val))} defaultValue={selectedTemplate?.id}>
            <SelectTrigger><SelectValue placeholder="Select a design" /></SelectTrigger>
            <SelectContent>
              {certificateTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Design Preview */}
        {selectedTemplate && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Design Preview:</h3>
            <Image
              src={certDesignUrl}
              alt={selectedTemplate.name}
              width={200}
              height={280}
              className="rounded-md"
              unoptimized
            />
          </div>
        )}

        {/* Branch Selection */}
        <div className="space-y-2">
          <Label>Select Branch</Label>
          <Select onValueChange={setSelectedBranchId} value={selectedBranchId}>
            <SelectTrigger><SelectValue placeholder="Select a branch" /></SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Student Selection */}
        <div className="space-y-2">
          <Label>Select Student</Label>
          <Select onValueChange={setSelectedStudentId} value={selectedStudentId} disabled={!selectedBranchId || isLoadingStudents}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingStudents ? "Loading students..." : !selectedBranchId ? "Select a branch first" : students.length === 0 ? "No students in this branch" : "Select a student"} />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>{student.studentName} ({student.rollNo})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerate} disabled={!selectedStudent}>Generate Certificate</Button>
      </CardContent>
    </Card>
  );
}

export default function CertificatesPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <CertificateGenerator />
    </div>
  );
}
