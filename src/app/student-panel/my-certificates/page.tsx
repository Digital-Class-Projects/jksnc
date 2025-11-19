
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
import { Download } from "lucide-react";
import { useAuth, useDatabase } from "@/firebase";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import 'jspdf-autotable';

type IssuedCertificate = {
  id: string;
  certificateType: string;
  issueDate: string;
  studentName: string;
  certificateDetails: any;
  branchId: string;
};

const certificateTemplates: { [key: string]: string } = {
  "Registration Certificate": "https://ik.imagekit.io/rgazxzsxr/Registration%20Certificate.png?updatedAt=1761992685429",
  "Marks Certificate": "https://ik.imagekit.io/rgazxzsxr/marks%20cards%20and%20registration%20CURVE%20FILE.png?updatedAt=1761988197015",
  "Migration Certificate": "https://ik.imagekit.io/rgazxzsxr/Migration%20Certifiate.png?updatedAt=1760612547767",
  "Diploma Certificate": "https://ik.imagekit.io/rgazxzsxr/Diploma%20Certificate.png?updatedAt=1761715718990",
  "Diploma": "https://ik.imagekit.io/rgazxzsxr/Diploma%20Certificate.png?updatedAt=1761715718990",
};


export default function MyCertificatesPage() {
  const database = useDatabase();
  const auth = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth?.currentUser || !database) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);

    const certsQuery = query(ref(database, 'generatedCertificates'), orderByChild('studentId'), equalTo(auth.currentUser.uid));
    
    const unsubscribeCerts = onValue(certsQuery, (snapshot) => {
      const data: IssuedCertificate[] = [];
      snapshot.forEach((child) => {
        data.push({ id: child.key!, ...child.val() });
      });
      setCertificates(data);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load your certificates.' });
    });

    return () => {
        unsubscribeCerts();
    };
  }, [database, auth, toast]);

  const handleDownload = (cert: IssuedCertificate) => {
    const isDiploma = cert.certificateType.toLowerCase().includes("diploma");
    const templateUrl = certificateTemplates[cert.certificateType] || "https://placehold.co/794x1123?text=Template+Not+Found";
        
    const student = cert.certificateDetails;
    const issueDate = new Date(cert.issueDate).toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [794, 1123]
    });

    doc.addImage(templateUrl, 'PNG', 0, 0, 794, 1123);

    doc.setFont('Times New Roman', 'normal');
    doc.setFontSize(18);
    doc.setTextColor('#000000');


    if (isDiploma) {
        // These positions are illustrative for a portrait layout and would need adjustment
        doc.text(student.enrollmentNumber || '', 680, 220); // Top-right
        doc.setFontSize(24);
        doc.text(student.fullName || '', doc.internal.pageSize.getWidth() / 2, 350, { align: 'center' });
        doc.setFontSize(18);
        doc.text(`S/O: ${student.fatherName || 'N/A'}`, doc.internal.pageSize.getWidth() / 2, 400, { align: 'center' });
        doc.setFontSize(16);
        doc.text(`Enrollment No: ${student.enrollmentNumber || "N/A"}`, 150, 450);
        doc.text(`Course: ${student.courseName || 'N/A'}`, 150, 480);
        doc.text(`Branch: ${student.branchName || 'Govt. Medical College, Srinagar'}`, 150, 510);
        doc.text(`Session: ${student.academicSession || 'N/A'}`, 150, 540);
        doc.setFontSize(18);
        doc.text(`Grade: ${student.marksPercentage || 'A+'}`, 500, 570);
        doc.setFontSize(16);
        doc.text(`Roll No: ${student.rollNumber || 'N/A'}`, 150, 570);
        doc.text(issueDate, 500, 1000);
    } else { // Assuming Migration Certificate layout logic
        const year = student.academicSession ? student.academicSession.split('-')[1] : new Date(cert.issueDate).getFullYear().toString();
        doc.setFontSize(20);
        doc.text(student.fullName || '____________________', 350, 262);
        doc.text(student.fatherName || '____________________', 350, 298);
        doc.text(student.courseName || '____________________', 320, 333);
        doc.text(year, 805, 333);
        doc.text(student.rollNumber || '____________________', 250, 370);
        doc.setFontSize(16);
        doc.text(issueDate, 790, 405);
    }

    doc.save(`Certificate_${cert.certificateType}_${student.fullName}.pdf`);
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>My Certificates</CardTitle>
          <CardDescription>
            Here are all the certificates that have been issued to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate Type</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Loading your certificates...
                  </TableCell>
                </TableRow>
              ) : certificates.length > 0 ? (
                certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">
                      {cert.certificateType}
                    </TableCell>
                    <TableCell>
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(cert)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    You have not been issued any certificates yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
