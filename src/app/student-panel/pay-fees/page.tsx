
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
import { useState } from "react";
import { SuccessDialog } from "@/components/success-dialog";
import { useRouter } from "next/navigation";

export default function PayFeesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [feeAmount] = useState(5000); // Fixed fee amount
  const [accountNumber, setAccountNumber] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

    // Simulate payment processing
    toast({
      title: "Processing Payment...",
      description: "Please wait while we process your transaction.",
    });

    setTimeout(() => {
      setShowSuccess(true);
    }, 2000);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccess(false);
    // Redirect to the upload receipt page
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
                This amount is fixed and cannot be changed.
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

            <Button type="submit" className="w-full">
              Confirm Payment & Proceed
            </Button>
          </form>
        </CardContent>
      </Card>
      <SuccessDialog
        open={showSuccess}
        onOpenChange={handleSuccessDialogClose}
        title="Payment Successful!"
        description="You can now upload your payment receipt for verification."
      />
    </div>
  );
}
