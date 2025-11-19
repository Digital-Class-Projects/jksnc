
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useDatabase } from "@/firebase";
import { ref, push, set, serverTimestamp, query, orderByChild, equalTo, get } from "firebase/database";
import { SuccessDialog } from "@/components/success-dialog";
import Image from "next/image";

export default function UploadFeeReceiptPage() {
  const { toast } = useToast();
  const database = useDatabase();
  const auth = useAuth();

  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    if (!auth?.currentUser || !database) return;

    const fetchStudentName = async () => {
      const studentQuery = query(ref(database, 'students'), orderByChild('uid'), equalTo(auth.currentUser!.uid));
      const snapshot = await get(studentQuery);
      if (snapshot.exists()) {
        const studentData = Object.values(snapshot.val())[0] as { studentName: string };
        setStudentName(studentData.studentName);
      } else {
        setStudentName(auth.currentUser?.displayName || "Unknown Student");
      }
    };

    fetchStudentName();
  }, [auth, database]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!receiptFile) {
      toast({ variant: "destructive", title: "No file selected", description: "Please upload a receipt file." });
      return;
    }
    if (!database || !auth?.currentUser) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to submit a receipt." });
      return;
    }

    setIsLoading(true);

    // In a real production app, you would upload to Firebase Storage.
    // For this demonstration, we'll use a known placeholder URL for the saved data,
    // but the preview will show the user's actual selected file.
    const placeholderUrl = "https://i.imgur.com/rD2Jp8i.png"; 

    const receiptData = {
      studentId: auth.currentUser.uid,
      studentName: studentName,
      receiptUrl: placeholderUrl,
      amount: 5000, 
      status: "pending",
      submittedAt: serverTimestamp(),
      notes: notes,
    };

    try {
      const receiptsRef = ref(database, 'feeReceipts');
      const newReceiptRef = push(receiptsRef);
      await set(newReceiptRef, receiptData);
      
      setShowSuccess(true);
      setNotes('');
      setReceiptFile(null);
      setReceiptPreview(null);
      (e.target as HTMLFormElement).reset();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not save receipt details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Fee Receipt</CardTitle>
          <CardDescription>
            If you have paid your fees manually, please upload the receipt here for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="receipt-file">Fee Receipt</Label>
              <Input id="receipt-file" type="file" required onChange={handleFileChange} accept="image/*,.pdf" />
              <p className="text-xs text-muted-foreground">Please upload a clear image or PDF of your receipt.</p>
              {receiptPreview && (
                  <div className="mt-4 p-4 border rounded-md">
                      <p className="text-sm font-medium mb-2">Image Preview:</p>
                      <Image src={receiptPreview} alt="Receipt Preview" width={200} height={300} className="rounded-md" />
                  </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes for the admin, e.g., transaction ID..." />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload Receipt"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="Receipt Uploaded!"
        description="Your fee receipt has been submitted for verification."
      />
    </div>
  );
}
