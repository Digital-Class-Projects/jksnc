
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
import { Eye } from "lucide-react";
import { useDatabase, useAuth } from "@/firebase";
import { ref, query, orderByChild, equalTo, get, onValue } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type CertificateApplication = {
  id: string; // This will be studentUid_appId
  studentUid: string;
  appId: string;
  fullName: string;
  enrollmentNumber: string;
  courseName: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Declined';
  branchName?: string;
  branchId?: string;
};

export default function BranchCertificateApplicationsPage() {
  const database = useDatabase();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [applications, setApplications] = useState<CertificateApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database || !auth?.currentUser) {
        setIsLoading(false);
        return;
    };

    let unsubscribe: () => void;

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const branchQuery = query(ref(database, 'branches'), orderByChild('branchAdminUid'), equalTo(auth.currentUser!.uid));
            const branchSnapshot = await get(branchQuery);

            if (!branchSnapshot.exists()) {
                toast({ variant: 'destructive', title: 'Branch Not Found', description: "Could not identify your branch." });
                setIsLoading(false);
                return;
            }
            
            const branchId = Object.keys(branchSnapshot.val())[0];

            const certsRef = ref(database, 'applications/certificates');
            
            unsubscribe = onValue(certsRef, (snapshot) => {
              const allApps: CertificateApplication[] = [];
              if (snapshot.exists()) {
                snapshot.forEach((studentSnapshot) => {
                  const studentUid = studentSnapshot.key;
                  studentSnapshot.forEach((appSnapshot) => {
                    const appData = appSnapshot.val();
                    if (appData.branchId === branchId) {
                      allApps.push({
                        id: `${studentUid}_${appSnapshot.key!}`,
                        studentUid: studentUid!,
                        appId: appSnapshot.key!,
                        ...appData,
                      });
                    }
                  });
                });
              }
              setApplications(allApps.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
              setIsLoading(false);
            });

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error fetching applications', description: error.message });
            setIsLoading(false);
        }
    };
    
    fetchApplications();

    return () => {
      if (unsubscribe) {
          unsubscribe();
      }
    }

  }, [database, auth, toast]);

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
            Review and manage certificate applications for your branch.
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
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={6} className="h-24 text-center">No certificate applications found for your branch.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
