
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDatabase, useAuth } from "@/firebase";
import { ref, set, push, get, query, orderByChild, equalTo } from "firebase/database";
import { SuccessDialog } from "@/components/success-dialog";

export default function NocApplyPage() {
  const { toast } = useToast();
  const database = useDatabase();
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
      fullName: '',
      age: '',
      address: '',
      contact: '',
      nocPurpose: '',
      propertyDetails: '',
      refNumbers: '',
      branchId: '',
      studentUid: '',
  });

  useEffect(() => {
    if (auth?.currentUser && database) {
      const studentQuery = query(ref(database, 'students'), orderByChild('uid'), equalTo(auth.currentUser.uid));
      get(studentQuery).then(snapshot => {
        if (snapshot.exists()) {
          const studentData = Object.values(snapshot.val())[0] as any;
          setFormData(prev => ({
            ...prev,
            fullName: studentData.studentName || '',
            address: studentData.fullAddress || '',
            contact: studentData.studentMobile || '',
            branchId: studentData.branchId || '',
            studentUid: auth.currentUser!.uid,
          }));
        }
      });
    }
  }, [auth, database]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormData(prev => ({
        ...prev,
        age: '',
        nocPurpose: '',
        propertyDetails: '',
        refNumbers: '',
    }));
    const fileInput = document.getElementById("supportingDocs") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!database || !auth?.currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit an application.' });
        return;
    }
    
    setIsLoading(true);

    const nocApplicationData = {
        ...formData,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
    };

    try {
        const studentId = auth.currentUser.uid;
        const nocRef = ref(database, `applications/noc/${studentId}`);
        const newNocRef = push(nocRef);
        await set(newNocRef, nocApplicationData);
        
        setShowSuccess(true);
        resetForm();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Application Failed",
            description: error.message || "Could not submit your NOC application.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Apply for NOC</CardTitle>
          <CardDescription>
            Fill out the form below to apply for a No Objection Certificate (NOC). Your application will be sent to the administration for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Enter your full name" required value={formData.fullName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" placeholder="Enter your age" required value={formData.age} onChange={handleInputChange} />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter your full address" required value={formData.address} onChange={handleInputChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Details</Label>
              <Input id="contact" placeholder="Enter your phone or email" required value={formData.contact} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nocPurpose">Purpose for NOC</Label>
              <Textarea
                id="nocPurpose"
                placeholder="Please state the reason for your NOC request in detail (e.g., 'Request for NOC to sell my property')"
                rows={4}
                required
                value={formData.nocPurpose} onChange={handleInputChange}
              />
            </div>
            
             <div className="space-y-2">
              <Label htmlFor="propertyDetails">Property/Vehicle Details</Label>
              <Textarea
                id="propertyDetails"
                placeholder="Specific details such as flat number, vehicle registration number, etc."
                rows={3}
                required
                value={formData.propertyDetails} onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="supportingDocs">Supporting Documents</Label>
                <Input id="supportingDocs" type="file" multiple />
                <p className="text-xs text-muted-foreground">Attach proof of identity, address, bill payments, loan agreements, etc.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refNumbers">Account/Reference Numbers</Label>
              <Input id="refNumbers" placeholder="Applicable bank account numbers or reference numbers" value={formData.refNumbers} onChange={handleInputChange} />
            </div>


            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
        <SuccessDialog
            open={showSuccess}
            onOpenChange={setShowSuccess}
            title="Application Submitted!"
            description="Your NOC application has been successfully submitted for verification."
        />
    </div>
  );
}
