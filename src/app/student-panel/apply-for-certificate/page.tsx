
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ApplyForCertificatePage() {
  const { toast } = useToast();
  const [paymentAmount] = useState(1500);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would handle the form submission, including file upload and payment processing logic.
    // For this example, we'll just show a success toast.
    toast({
      title: "Application Submitted",
      description: "Your diploma certificate application and payment proof have been submitted for verification.",
    });
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Apply For Diploma Certificate</CardTitle>
          <CardDescription>
            Complete the form below to apply for your diploma certificate. A fee of ₹{paymentAmount} is required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input id="payment-amount" value={`₹ ${paymentAmount}`} readOnly disabled />
            </div>
            
            <div className="space-y-2">
                <p className="text-sm font-medium">Payment Instructions</p>
                <p className="text-sm text-muted-foreground">Please transfer the required amount to the account details provided by your institution and upload the payment receipt below.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-receipt">Upload Payment Receipt</Label>
              <Input id="payment-receipt" type="file" required />
              <p className="text-xs text-muted-foreground">Please upload a clear image or PDF of your payment confirmation.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Any additional information for the admin..." />
            </div>

            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
