
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
import { ref, onValue, update, remove, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, Trash2, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";

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

type Student = {
    [key: string]: any;
};

function StudentDetailDialog({ student, open, onOpenChange }: { student: Student | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    if (!student) return null;

    const details = [
        { label: "Enrollment No", value: student.enrollmentNo },
        { label: "Roll No", value: student.rollNo },
        { label: "Student Name", value: student.studentName },
        { label: "Father's Name", value: student.fatherName },
        { label: "Mother's Name", value: student.motherName },
        { label: "Course", value: student.course },
        { label: "Session", value: student.session },
        { label: "Date of Birth", value: student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A' },
        { label: "Gender", value: student.gender },
        { label: "Mobile", value: student.studentMobile },
        { label: "Email", value: student.email },
        { label: "Address", value: student.fullAddress },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Student Details</DialogTitle>
                    <DialogDescription>
                        Full information for {student.studentName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
                        {details.map(detail => (
                            <div key={detail.label} className="flex flex-col">
                                <Label className="text-sm text-muted-foreground">{detail.label}</Label>
                                <p className="font-medium">{detail.value || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function FeeReceiptsPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const entriesPerPage = 10;

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

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this receipt? This action cannot be undone.")) {
        const receiptRef = ref(database, `feeReceipts/${receiptId}`);
        try {
            await remove(receiptRef);
            toast({ title: 'Receipt Deleted', description: 'The fee receipt has been removed.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    }
  };

  const handleShowDetails = async (studentId: string) => {
    if (!database) return;
    try {
        const studentsRef = ref(database, `students`);
        const snapshot = await get(studentsRef);
        if (snapshot.exists()) {
            let foundStudent: Student | null = null;
            snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().uid === studentId) {
                    foundStudent = { id: childSnapshot.key, ...childSnapshot.val() };
                }
            });

            if (foundStudent) {
                setSelectedStudent(foundStudent);
                setIsDetailViewOpen(true);
            } else {
                 toast({ variant: 'destructive', title: 'Not Found', description: 'Could not find details for this student.' });
            }
        } else {
             toast({ variant: 'destructive', title: 'Not Found', description: 'Could not find details for this student.' });
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };


  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentReceipts = receipts.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(receipts.length / entriesPerPage);

  const handlePrevPage = () => setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
  const handleNextPage = () => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));

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
              ) : currentReceipts.length > 0 ? (
                currentReceipts.map((receipt) => (
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
                              data-ai-hint="payment receipt"
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
                    <TableCell className="text-right space-x-1">
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
                       <Button variant="ghost" size="icon" onClick={() => handleShowDetails(receipt.studentId)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteReceipt(receipt.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                  Showing {receipts.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, receipts.length)} of {receipts.length} entries
              </div>
              {receipts.length > entriesPerPage && (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
                    <span className="text-sm font-medium">{currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
      <StudentDetailDialog student={selectedStudent} open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen} />
    </div>
  );
}

    