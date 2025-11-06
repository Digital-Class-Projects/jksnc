
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

type NocApplication = {
  id: string;
  studentUid: string;
  appId: string;
  fullName: string;
  nocPurpose: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Declined';
  branchId?: string;
};

export default function BranchNocApplicationsPage() {
  const database = useDatabase();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [applications, setApplications] = useState<NocApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database || !auth?.currentUser) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: () => void;

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const branchQuery = query(ref(database, 'branches'), orderByChild('branchAdminUid'), equalTo(auth.currentUser!.uid));
            const branchSnapshot = await get(branchQuery);

            if (!branchSnapshot.exists()) {
                toast({ variant: 'destructive', title: 'Branch Not Found' });
                setIsLoading(false);
                return;
            }

            const branchId = Object.keys(branchSnapshot.val())[0];
            
            const nocsRef = ref(database, 'applications/noc');
            
            unsubscribe = onValue(nocsRef, (snapshot) => {
              const allApps: NocApplication[] = [];
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
              setApplications(allApps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
              setIsLoading(false);
            });

        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error fetching NOC applications', description: error.message });
             setIsLoading(false);
        }
    };

    fetchApplications();

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };

  }, [database, auth, toast]);

  const getStatusBadgeVariant = (status: NocApplication['status']) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Declined': return 'destructive';
      case 'Pending': default: return 'secondary';
    }
  };

  const getStatusBadgeClass = (status: NocApplication['status']) => {
    switch (status) {
      case 'Approved': return 'bg-green-500 text-white';
      case 'Pending': return 'bg-yellow-500 text-white';
      default: return '';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">NOC Applications</CardTitle>
          <CardDescription>
            Review NOC applications submitted by students in your branch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>NOC Purpose</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading applications...</TableCell></TableRow>
              ) : applications.length > 0 ? (
                applications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.fullName}</TableCell>
                    <TableCell>{app.nocPurpose}</TableCell>
                    <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(app.status)} className={getStatusBadgeClass(app.status)}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/noc-applications/${app.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">No NOC applications found for your branch.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
