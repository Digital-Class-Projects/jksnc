
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDatabase } from "@/firebase";
import { ref, set, onValue } from "firebase/database";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";

type PaymentSettings = {
  upiId: string;
  upiQrUrl: string;
};

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const database = useDatabase();
  const [settings, setSettings] = useState<PaymentSettings>({
    upiId: "coachifyinstitute@gmail.com",
    upiQrUrl: "https://picsum.photos/seed/qr/200/200",
  });
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (!database) return;
    const settingsRef = ref(database, 'websiteContent/paymentSettings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as PaymentSettings;
        setSettings(data);
        if (data.upiQrUrl) {
          setQrPreview(data.upiQrUrl);
        }
      }
    });
    return () => unsubscribe();
  }, [database]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to Firebase Storage and get a URL.
      // For this demo, we'll use a local object URL for the preview.
      const previewUrl = URL.createObjectURL(file);
      setQrPreview(previewUrl);
      // NOTE: This local URL is temporary and won't be saved to the database.
      // To save, you'd need to implement Firebase Storage upload logic here.
      // For now, we'll keep the existing/placeholder URL in the state.
    }
  };

  const handlePublish = async () => {
    if (!database) {
        toast({ variant: "destructive", title: "Database not available" });
        return;
    }
    // In a real app, you would get the downloadURL from Firebase Storage after upload
    // and save that URL to the settings object before setting it in the database.
    const settingsToSave = {
        ...settings,
        // upiQrUrl: downloadURL_from_storage,
    };
    
    const settingsRef = ref(database, 'websiteContent/paymentSettings');
    try {
        await set(settingsRef, settingsToSave);
        setShowSuccessDialog(true);
    } catch (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: (error as Error).message,
        });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input id="upiId" value={settings.upiId} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upiQr">UPI QR</Label>
            <Input id="upiQr" type="file" onChange={handleFileChange} accept="image/*" />
            {qrPreview && (
              <div className="mt-4 p-4 border rounded-md flex justify-center">
                <Image 
                  src={qrPreview} 
                  alt="UPI QR Code Preview" 
                  width={150} 
                  height={150}
                  data-ai-hint="qr code"
                />
              </div>
            )}
          </div>
          
          <div>
            <Button onClick={handlePublish}>Submit Now</Button>
          </div>
        </CardContent>
      </Card>
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        description="Payment settings have been updated."
      />
    </div>
  );
}
