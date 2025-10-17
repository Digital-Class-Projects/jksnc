
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function NocApplyPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would handle the form submission logic.
    // For this example, we'll just show a success toast.
    toast({
      title: "Application Submitted",
      description: "Your NOC application has been submitted for verification.",
    });
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Apply for NOC</CardTitle>
          <CardDescription>
            Fill out the form below to apply for a No Objection Certificate (NOC). Your application will be sent to the administration for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for NOC</Label>
              <Textarea
                id="reason"
                placeholder="Please state the reason for your NOC request in detail..."
                rows={5}
                required
              />
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
