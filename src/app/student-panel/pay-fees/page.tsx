
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { SuccessDialog } from "@/components/success-dialog";
import { useRouter } from "next/navigation";
import { useAuth, useDatabase } from "@/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import jsPDF from "jspdf";
import 'jspdf-autotable';

type StudentData = {
  studentName: string;
  enrollmentNo: string;
  course: string;
  fatherName: string;
  studentMobile: string;
};

export default function PayFeesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const database = useDatabase();

  const [feeAmount] = useState(1500);
  const [accountNumber, setAccountNumber] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    if (!auth?.currentUser || !database) return;
    const fetchStudentData = async () => {
      const studentQuery = query(ref(database, 'students'), orderByChild('uid'), equalTo(auth.currentUser!.uid));
      const snapshot = await get(studentQuery);
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val())[0] as StudentData;
        setStudentData(data);
      }
    };
    fetchStudentData();
  }, [auth, database]);

  const generateReceiptPDF = () => {
    if (!studentData) {
        toast({ variant: 'destructive', title: "Error", description: "Student data not loaded." });
        return;
    }
    const doc = new jsPDF();
    const transactionId = `TXN${Date.now()}`;
    const issueDate = new Date().toLocaleDateString('en-GB');

    // Add Logo
    const logoUrl = 'https://ik.imagekit.io/rgazxzsxr/68c4095c2a95d.png?updatedAt=1761819080151';
    
    try {
      doc.addImage(logoUrl, 'PNG', 15, 15, 40, 40);
    } catch(e) {
      console.error("Could not add logo to PDF, might be an unsupported image format.", e);
    }


    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Fee Receipt", 105, 35, { align: "center" });

    // Receipt Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt No: ${transactionId}`, 15, 70);
    doc.text(`Date: ${issueDate}`, 150, 70);

    // Student Information
    doc.setLineWidth(0.5);
    doc.line(15, 75, 195, 75);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 15, 85);
    doc.setFont("helvetica", "normal");
    doc.text(studentData.studentName, 15, 92);
    doc.text(`Enrollment: ${studentData.enrollmentNo}`, 15, 99);
    doc.text(`Course: ${studentData.course}`, 15, 106);
    doc.text(`Contact: ${studentData.studentMobile}`, 15, 113);
    doc.line(15, 120, 195, 120);

    // Payment Details Table
    const tableColumn = ["Description", "Amount"];
    const subtotal = feeAmount; // Base amount is 1500
    // To make total 1500, we need to calculate base amount from total
    // total = base + base*0.09 + base*0.09 = base * 1.18
    // base = total / 1.18
    const baseAmount = 1500 / 1.18;
    const gst = baseAmount * 0.09;
    const cgst = baseAmount * 0.09;
    const total = baseAmount + gst + cgst;

    const tableRows = [
        ["Course Fee", `Rs. ${baseAmount.toFixed(2)}`],
        ["GST (9%)", `Rs. ${gst.toFixed(2)}`],
        ["CGST (9%)", `Rs. ${cgst.toFixed(2)}`],
        ["", ""], // spacer
        [{ content: "Total Amount", styles: { fontStyle: 'bold' } }, { content: `Rs. ${total.toFixed(2)}`, styles: { fontStyle: 'bold' } }],
    ];
    
    (doc as any).autoTable({
        startY: 130,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
        footStyles: { fontStyle: 'bold' }
    });

    // Footer
    let finalY = (doc as any).lastAutoTable.finalY;
    doc.text("This is a computer-generated receipt and does not require a signature.", 105, finalY + 20, { align: "center" });
    doc.text("Thank you for your payment!", 105, finalY + 27, { align: "center" });


    doc.save(`Fee_Receipt_${studentData.enrollmentNo}.pdf`);
  };

  const handlePay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accountNumber) {
      toast({
        variant: "destructive",
        title: "Account Number Required",
        description: "Please enter the account number to proceed.",
      });
      return;
    }

    toast({
      title: "Processing Payment...",
      description: "Please wait while we process your transaction.",
    });

    setTimeout(() => {
      setShowSuccess(true);
      generateReceiptPDF();
    }, 2000);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccess(false);
    router.push('/student-panel/upload-fee-receipt');
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Pay Your Fees</CardTitle>
          <CardDescription>
            Manually transfer fees to the institution's account and record the
            transaction here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePay} className="space-y-6">
            <div className="space-y-2">
              <Label>Institution's Account Details</Label>
              <div className="p-4 border rounded-md bg-muted text-muted-foreground text-sm">
                <p><strong>Bank Name:</strong> State Bank of India</p>
                <p><strong>Account Number:</strong> 12345678901</p>
                <p><strong>IFSC Code:</strong> SBIN0001234</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Fee Amount</Label>
              <Input
                id="amount"
                value={`₹ ${feeAmount.toLocaleString()}`}
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">
                This is the total amount inclusive of all taxes.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-number">
                Your Account Number (For Reference)
              </Label>
              <Input
                id="account-number"
                placeholder="Enter account number you paid from"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={!studentData}>
              {studentData ? "Confirm Payment & Download Receipt" : "Loading student data..."}
            </Button>
          </form>
        </CardContent>
      </Card>
      <SuccessDialog
        open={showSuccess}
        onOpenChange={handleSuccessDialogClose}
        title="Payment Confirmed!"
        description="Your receipt has been downloaded. Please proceed to upload it for verification."
      />
    </div>
  );
}
