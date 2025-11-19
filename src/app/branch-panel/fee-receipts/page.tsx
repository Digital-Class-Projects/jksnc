
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
import { useAuth, useDatabase } from "@/firebase";
import { ref, onValue, update, query, orderByChild, equalTo, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";

type Receipt = {
  id: string;
  studentId: string;
  studentName: string;
  receiptUrl: string;
  amount: number;
  status: "pending" | "verified" | "rejected";
  submittedAt: number;
  notes?: string;
  branchId?: string;
};

export default function BranchFeeReceiptsPage() {
  const database = useDatabase();
  const auth = useAuth();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database || !auth?.currentUser) return;
    setIsLoading(true);

    const branchAdminQuery = query(ref(database, 'branches'), orderByChild('branchAdminUid'), equalTo(auth.currentUser.uid));

    get(branchAdminQuery).then((snapshot) => {
        if (snapshot.exists()) {
            const branchId = Object.keys(snapshot.val())[0];
            
            const allReceiptsRef = ref(database, 'feeReceipts');
            const unsubscribe = onValue(allReceiptsRef, async (receiptSnapshot) => {
                const allReceipts: Receipt[] = [];
                receiptSnapshot.forEach((child) => {
                    allReceipts.push({ id: child.key!, ...child.val() });
                });

                const studentPromises = allReceipts.map(receipt => 
                    get(query(ref(database, `students`), orderByChild('uid'), equalTo(receipt.studentId)))
                );
                
                const studentSnapshots = await Promise.all(studentPromises);

                const branchReceipts = allReceipts.filter((receipt, index) => {
                    const studentSnapshot = studentSnapshots[index];
                    if (studentSnapshot.exists()) {
                        const studentData = Object.values(studentSnapshot.val())[0] as any;
                        return studentData.branchId === branchId;
                    }
                    return false;
                });
                
                setReceipts(branchReceipts.sort((a, b) => b.submittedAt - a.submittedAt));
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
             toast({
                variant: "destructive",
                title: "Not a Branch Admin",
                description: "You do not have permission to view this page.",
            });
            setIsLoading(false);
        }
    });

  }, [database, auth, toast]);

  const handleStatusChange = async (
    receiptId: string,
    status: "verified" | "rejected"
  ) => {
    if (!database) return;
    const receiptRef = ref(database, `feeReceipts/${receiptId}`);
    try {
      await update(receiptRef, { status });
      toast({
        title: "Status Updated",
        description: `Receipt has been marked as ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDownload = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(() => toast({
          variant: "destructive",
          title: "Download failed",
          description: "Could not download the image."
      }));
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Fee Receipt Verification</CardTitle>
          <CardDescription>
            Review and verify fee receipts uploaded by students in your branch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading receipts...
                  </TableCell>
                </TableRow>
              ) : receipts.length > 0 ? (
                receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      {receipt.studentName}
                    </TableCell>
                    <TableCell>₹{receipt.amount?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(receipt.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          receipt.status === "pending"
                            ? "secondary"
                            : receipt.status === "verified"
                            ? "default"
                            : "destructive"
                        }
                        className={receipt.status === "verified" ? "bg-green-500 text-white" : ""}
                      >
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Receipt from {receipt.studentName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <Image
                              src={receipt.receiptUrl}
                              alt="Fee Receipt"
                              width={800}
                              height={1000}
                              className="w-full h-auto rounded-md"
                            />
                            {receipt.notes && <p className="mt-4 text-sm text-muted-foreground">Notes: {receipt.notes}</p>}
                          </div>
                           <DialogFooter>
                              <Button variant="secondary" onClick={() => handleDownload(receipt.receiptUrl, `receipt-${receipt.studentName.replace(' ', '_')}.png`)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {receipt.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleStatusChange(receipt.id, "verified")
                            }
                          >
                            Verify
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(receipt.id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No fee receipts found for your branch.
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
