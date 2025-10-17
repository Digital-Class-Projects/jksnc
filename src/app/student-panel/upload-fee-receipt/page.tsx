
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function UploadFeeReceiptPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would handle the file upload and form submission logic.
    // For this example, we'll just show a success toast.
    toast({
      title: "Receipt Uploaded",
      description: "Your fee receipt has been submitted for verification.",
    });
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
              <Input id="receipt-file" type="file" required />
              <p className="text-xs text-muted-foreground">Please upload a clear image or PDF of your receipt.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Add any notes for the admin, e.g., transaction ID..." />
            </div>

            <Button type="submit" className="w-full">
              Upload Receipt
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
