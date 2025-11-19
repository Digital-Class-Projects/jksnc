
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
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useDatabase } from "@/firebase";
import { ref, onValue, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

type CertificateApplication = {
  id: string; // This will be studentUid_appId
  studentUid: string;
  appId: string;
  fullName: string;
  enrollmentNumber: string;
  courseName: string;
  academicSession: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Declined';
};

export default function CertificateApplicationsPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const router = useRouter();
  const [applications, setApplications] = useState<CertificateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);
    const applicationsRef = ref(database, "applications/certificates");

    const unsubscribe = onValue(applicationsRef, (snapshot) => {
      const data: CertificateApplication[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((studentSnapshot) => {
            const studentUid = studentSnapshot.key!;
            studentSnapshot.forEach((appSnapshot) => {
                 const appData = appSnapshot.val();
                 data.push({
                  id: `${studentUid}_${appSnapshot.key!}`,
                  studentUid: studentUid,
                  appId: appSnapshot.key!,
                  ...appData,
                });
            });
        });
      }
      setApplications(data.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
      setIsLoading(false);
    }, (error) => {
        toast({ variant: 'destructive', title: 'Error fetching data', description: error.message });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [database, toast]);

  const handleStatusUpdate = async (studentUid: string, appId: string, status: 'Approved' | 'Declined', reason?: string) => {
    if (!database) return;
    const appRef = ref(database, `applications/certificates/${studentUid}/${appId}`);
    try {
        const updateData: any = { status };
        if (status === 'Declined' && reason) {
            updateData.declineReason = reason;
        }
        await update(appRef, updateData);
        toast({ title: 'Success', description: `Application has been ${status.toLowerCase()}.`});
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const getStatusBadgeVariant = (status: CertificateApplication['status']) => {
    switch (status) {
      case 'Approved':
        return 'default';
      case 'Declined':
        return 'destructive';
      case 'Pending':
      default:
        return 'secondary';
    }
  };
  
   const getStatusBadgeClass = (status: CertificateApplication['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      default:
        return '';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Certificate Applications</CardTitle>
          <CardDescription>
            Review and manage certificate applications submitted by students.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Enrollment No</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading applications...</TableCell></TableRow>
                    ) : applications.length > 0 ? (
                        applications.map(app => (
                            <TableRow key={app.id}>
                                <TableCell className="font-medium">{app.fullName}</TableCell>
                                <TableCell>{app.enrollmentNumber}</TableCell>
                                <TableCell>{app.courseName}</TableCell>
                                <TableCell>{new Date(app.submissionDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(app.status)} className={getStatusBadgeClass(app.status)}>
                                        {app.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/certificate-applications/${app.id}`)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleStatusUpdate(app.studentUid, app.appId, 'Approved')}>
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-red-600"><XCircle className="h-4 w-4" /></Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Decline Application?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Please provide a reason for declining this application.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <Input placeholder="Reason for decline" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
                                        <AlertDialogFooter>
                                          <AlertDialogCancel onClick={() => setDeclineReason('')}>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => { handleStatusUpdate(app.studentUid, app.appId, 'Declined', declineReason); setDeclineReason(''); }}>Decline</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={6} className="h-24 text-center">No certificate applications found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
