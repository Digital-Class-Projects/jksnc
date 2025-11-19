
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDatabase } from "@/firebase";
import { ref, onValue, update } from "firebase/database";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type NocApplication = {
  id: string;
  studentUid: string;
  fullName: string;
  age: string;
  address: string;
  contact: string;
  nocPurpose: string;
  propertyDetails: string;
  refNumbers?: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Declined';
  declineReason?: string;
};

function ApplicationDetail({ label, value }: { label: string, value: string | undefined | number }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <p className="font-medium break-words text-sm p-2 bg-muted rounded-md min-h-[40px]">
        {value || 'N/A'}
      </p>
    </div>
  );
}

export default function NocApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const database = useDatabase();
  const { toast } = useToast();

  const [application, setApplication] = useState<NocApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState("");

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [studentUid, appId] = id ? id.split('_') : [null, null];
  
  useEffect(() => {
    if (!database || !studentUid || !appId) {
      setIsLoading(false);
      return;
    }
    const appRef = ref(database, `applications/noc/${studentUid}/${appId}`);
    const unsubscribe = onValue(appRef, (snapshot) => {
      if (snapshot.exists()) {
        setApplication({ id: snapshot.key!, studentUid, ...snapshot.val() });
      } else {
        toast({ variant: "destructive", title: "Not Found", description: "Application not found." });
        setApplication(null);
      }
      setIsLoading(false);
    }, (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [database, studentUid, appId, toast]);
  
  const handleStatusUpdate = async (status: 'Approved' | 'Declined') => {
    if (!database || !studentUid || !appId) return;

    if (status === 'Declined' && !declineReason.trim()) {
        toast({ variant: 'destructive', title: 'Reason Required', description: 'Please provide a reason for declining.'});
        return;
    }

    const appRef = ref(database, `applications/noc/${studentUid}/${appId}`);
    try {
        const updateData: any = { status };
        if (status === 'Declined') {
            updateData.declineReason = declineReason;
        }
        await update(appRef, updateData);
        toast({ title: 'Success', description: `Application has been ${status.toLowerCase()}.`});
        if (status === 'Declined') {
            setDeclineReason("");
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Application Not Found</h2>
            <p className="text-muted-foreground">The requested application could not be loaded.</p>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
    );
  }
  
  const appStatus = application.status;

  return (
    <div className="p-4 md:p-8">
       <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Applications
      </Button>

      <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Review NOC Application</CardTitle>
                    <CardDescription>Submitted on {new Date(application.submittedAt).toLocaleString()}</CardDescription>
                </div>
                <Badge variant={appStatus === 'Approved' ? 'default' : appStatus === 'Declined' ? 'destructive' : 'secondary'} className={`${appStatus === 'Approved' ? 'bg-green-500' : ''}`}>
                    {appStatus}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-xl">Applicant Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ApplicationDetail label="Full Name" value={application.fullName} />
                        <ApplicationDetail label="Age" value={application.age} />
                        <ApplicationDetail label="Contact" value={application.contact} />
                        <div className="md:col-span-2 lg:col-span-3">
                            <ApplicationDetail label="Address" value={application.address} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-xl">NOC Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                        <ApplicationDetail label="Purpose for NOC" value={application.nocPurpose} />
                        <ApplicationDetail label="Property/Vehicle Details" value={application.propertyDetails} />
                        <ApplicationDetail label="Account/Reference Numbers" value={application.refNumbers} />
                    </CardContent>
                </Card>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Take Action</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {application.status === 'Declined' && application.declineReason && (
                    <div className="p-3 border-l-4 border-destructive bg-destructive/10 rounded-r-lg">
                        <p className="text-sm font-semibold text-destructive">Decline Reason:</p>
                        <p className="text-sm text-destructive/80">{application.declineReason}</p>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('Approved')} disabled={application.status === 'Approved'}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve Application
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={application.status === 'Declined'}>
                                <XCircle className="mr-2 h-4 w-4" /> Decline Application
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Decline Application?</AlertDialogTitle>
                            <AlertDialogDescription>Please provide a reason for declining.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea placeholder="Reason for decline..." value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeclineReason('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleStatusUpdate('Declined')}>Confirm Decline</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
