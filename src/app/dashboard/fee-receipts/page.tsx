
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
import { useDatabase } from "@/firebase";
import { ref, onValue, update } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Receipt = {
  id: string;
  studentId: string;
  studentName: string;
  receiptUrl: string;
  amount: number;
  status: "pending" | "verified" | "rejected";
  submittedAt: number;
  notes?: string;
};

export default function FeeReceiptsPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);
    const receiptsRef = ref(database, "feeReceipts");
    const unsubscribe = onValue(receiptsRef, (snapshot) => {
      const data: Receipt[] = [];
      snapshot.forEach((child) => {
        data.push({ id: child.key!, ...child.val() });
      });
      setReceipts(data.sort((a, b) => b.submittedAt - a.submittedAt));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [database]);

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

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Fee Receipt Verification</CardTitle>
          <CardDescription>
            Review and verify fee receipts uploaded by students.
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
                    <TableCell>₹{receipt.amount.toLocaleString()}</TableCell>
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
                    No fee receipts have been uploaded yet.
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
