
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

type IssuedCertificate = {
  id: string;
  certificateType: string;
  issueDate: string;
  studentName: string;
  certificateDetails: any;
  branchId: string;
};

const MIGRATION_CERT_URL = "https://ik.imagekit.io/rgazxzsxr/Migration%20Certifiate.png?updatedAt=1760612547767";

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
    // For now, we only have one template. In the future this could be more dynamic.
    const templateUrl = MIGRATION_CERT_URL;
    
    const student = cert.certificateDetails;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Popup blocked', description: 'Please allow popups for this site.' });
      return;
    }

    const certificateHtml = `
      <html>
        <head>
          <title>${cert.certificateType} - ${student.studentName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap');
            body { margin: 0; font-family: 'Tinos', serif; }
            .certificate-container {
              width: 827px;
              height: 1169px;
              position: relative;
              background-image: url('${templateUrl}');
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
            <div id="year" class="data-field">${new Date(cert.issueDate).getFullYear()}</div>
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
