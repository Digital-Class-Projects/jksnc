
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDatabase } from "@/firebase";
import { ref, set, onValue } from "firebase/database";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";

type AboutUsDetails = {
  bannerUrl: string;
  heading: string;
  shortDescription: string;
  highlightedText: string;
  longDescription: string;
  totalStudent: string;
  totalBranch: string;
};

export default function AboutUsPage() {
  const { toast } = useToast();
  const database = useDatabase();
  const [details, setDetails] = useState<AboutUsDetails>({
    bannerUrl: "",
    heading: "Coachify Institute",
    shortDescription: "Produce: Skilled & Employable Professional with International Curriculum",
    highlightedText: "International Precision, Beauty Mastery",
    longDescription: "The ClimbLink Institute of Professional Courses is well-known for its unmistakable culture of quality, exceptional car",
    totalStudent: "1000",
    totalBranch: "3",
  });
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (!database) return;
    const aboutUsRef = ref(database, 'websiteContent/aboutUsDetails');
    const unsubscribe = onValue(aboutUsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as AboutUsDetails;
        setDetails(data);
        if (data.bannerUrl) {
          setBannerPreview(data.bannerUrl);
        }
      }
    });
    return () => unsubscribe();
  }, [database]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to Firebase Storage and get a URL.
      // For now, we'll just display a preview.
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      setDetails(prev => ({ ...prev, bannerUrl: previewUrl })); // Note: this is a temporary local URL
    }
  };

  const handlePublish = async () => {
    if (!database) {
        toast({ variant: "destructive", title: "Database not available" });
        return;
    }
    const aboutUsRef = ref(database, 'websiteContent/aboutUsDetails');
    try {
        await set(aboutUsRef, details);
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
      <Card>
        <CardHeader>
          <CardTitle>About Us Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="banner">BANNER</Label>
            <Input id="banner" type="file" onChange={handleFileChange} />
             {bannerPreview && (
              <div className="mt-4">
                <Image src={bannerPreview} alt="Banner preview" width={200} height={100} className="rounded-md object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="heading">HEADING</Label>
              <Input id="heading" value={details.heading} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDescription">SHORT DESCRIPTION</Label>
              <Input id="shortDescription" value={details.shortDescription} onChange={handleInputChange} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="highlightedText">HIGHLIGHTED TEXT</Label>
              <Input id="highlightedText" value={details.highlightedText} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="longDescription">LONG DESCRIPTION</Label>
              <Textarea id="longDescription" value={details.longDescription} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalStudent">TOTAL STUDENT</Label>
              <Input id="totalStudent" type="number" value={details.totalStudent} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalBranch">TOTAL BRANCH</Label>
              <Input id="totalBranch" type="number" value={details.totalBranch} onChange={handleInputChange} />
            </div>
          </div>

          <div>
            <Button onClick={handlePublish}>Publish</Button>
          </div>
        </CardContent>
      </Card>

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        description="About Us details have been published."
      />
    </div>
  );
}
