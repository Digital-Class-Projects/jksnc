
"use client";

import { useState, useEffect } from "react";
import { useDatabase, useAuth } from "@/firebase";
import {
  ref,
  push,
  onValue,
  remove,
  set,
  update,
} from "firebase/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { updateUserPassword } from "@/ai/flows/update-user-password";


type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  branchAdminUid: string;
  adminEmail?: string;
  phone?: string;
  active: boolean;
  branchCode?: string;
  managerName?: string;
};

function ChangePasswordDialog({ email, onPasswordReset, isResetting }: { email: string, onPasswordReset: () => void, isResetting: boolean }) {
    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Send Password Reset Email</DialogTitle>
                <DialogDescription>
                    This will send a password reset link to <span className="font-semibold">{email}</span>. The branch admin can use this link to set a new password.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={onPasswordReset} disabled={isResetting}>
                    {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function BranchesPage() {
  const { toast } = useToast();
  const database = useDatabase();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Partial<Branch & { adminPassword?: string }>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    if (!database) return;
    setIsDataLoading(true);
    const branchesRef = ref(database, "branches");
    const unsubscribe = onValue(branchesRef, (snapshot) => {
      const branchesData: Branch[] = [];
      snapshot.forEach(childSnapshot => {
          const branchVal = childSnapshot.val();
          branchesData.push({
            id: childSnapshot.key!,
            ...branchVal,
            active: branchVal.active ?? true,
          });
      });
      setBranches(branchesData);
      setIsDataLoading(false);
    }, (error) => {
        setIsDataLoading(false);
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    });
    return () => unsubscribe();
  }, [database, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setCurrentBranch((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleOpenDialog = (branch: Branch | null = null) => {
    if(branch) {
      setIsEditMode(true);
      setCurrentBranch(branch);
    } else {
      setIsEditMode(false);
      setCurrentBranch({ name: "", city: "", address: "", adminEmail: "", adminPassword: "", phone: "", branchCode: "", managerName: "", active: true });
    }
    setOpenDialog(true);
  }

  const handleSaveBranch = async () => {
    if (!database || !currentBranch.name || !currentBranch.adminEmail) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out name and email.",
      });
      return;
    }
    
    setIsLoading(true);

    if (isEditMode) {
        if(!currentBranch.id) return;
        const branchRef = ref(database, `branches/${currentBranch.id}`);
        const { id, adminPassword, ...branchData } = currentBranch;
        try {
            await update(branchRef, branchData);
            toast({ title: 'Branch Updated', description: "The branch details have been updated." });
            
            if (adminPassword) {
              await updateUserPassword({
                email: currentBranch.adminEmail,
                newPassword: adminPassword,
                role: 'branch',
                id: currentBranch.id,
              });
              toast({ title: 'Password Updated', description: "The branch admin's password has been changed." });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error updating branch', description: error.message });
        }
    } else {
        if (!currentBranch.adminPassword) {
            toast({ variant: 'destructive', title: 'Missing Password', description: 'Password is required for new branch admin.'});
            setIsLoading(false);
            return;
        }

        try {
          const result = await updateUserPassword({
            email: currentBranch.adminEmail,
            newPassword: currentBranch.adminPassword,
            role: 'branch',
            isNewUser: true,
          });

          const branchData = {
            name: currentBranch.name,
            city: currentBranch.city,
            address: currentBranch.address,
            phone: currentBranch.phone,
            branchAdminUid: result.uid,
            adminEmail: currentBranch.adminEmail,
            branchCode: currentBranch.branchCode,
            managerName: currentBranch.managerName,
            active: true,
          };
          
          const newBranchRef = push(ref(database, "branches"));
          await set(newBranchRef, branchData);

          setShowSuccessDialog(true);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error Creating Branch",
            description: error.message || "An unknown error occurred.",
          });
        }
    }
    
    setIsLoading(false);
    setOpenDialog(false);
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this branch? This action cannot be undone.")) {
      try {
        await remove(ref(database, `branches/${branchId}`));
        // In a real app, you would also delete the auth user via a cloud function
        toast({ title: 'Success', description: 'Branch deleted successfully.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete branch.' });
      }
    }
  };

  const handleToggleActive = (branchId: string, currentStatus: boolean) => {
    if (!database) return;
    const branchRef = ref(database, `branches/${branchId}`);
    update(branchRef, { active: !currentStatus });
  };
  
  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
            <Input 
              placeholder="Search Branch..." 
              className="max-w-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button size="sm" className="gap-1" onClick={() => handleOpenDialog()}>
              <PlusCircle className="h-3.5 w-3.5" />
              Add
            </Button>
        </div>

          {isDataLoading ? (
            <div className="text-center p-8">Loading branches...</div>
          ) : filteredBranches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No branches found. Start by adding a new branch.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBranches.map((branch) => (
                  <Card key={branch.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{branch.name}</h3>
                        <Switch checked={branch.active} onCheckedChange={() => handleToggleActive(branch.id, branch.active)} />
                      </div>
                      <hr className="border-dashed my-2"/>
                      <ul className="text-sm text-muted-foreground space-y-1 mt-4">
                        <li>Email: {branch.adminEmail}</li>
                        <li>Phone: {branch.phone || 'N/A'}</li>
                      </ul>
                      <div className="flex items-center justify-between mt-4">
                         <Button variant="link" className="p-0 h-auto text-sm" onClick={() => handleOpenDialog(branch)}>Change Password</Button>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(branch)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBranch(branch.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             <div className="flex justify-center">
                <Image src="https://i.imgur.com/3gFzY8E.png" width={100} height={100} alt="id card" className="rounded-full" data-ai-hint="id card" />
             </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input id="name" placeholder="" value={currentBranch.name || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input id="branchCode" placeholder="" value={currentBranch.branchCode || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerName">Manager Name</Label>
                <Input id="managerName" placeholder="" value={currentBranch.managerName || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input id="phone" placeholder="" value={currentBranch.phone || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="" value={currentBranch.address || ''} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input id="adminEmail" type="email" placeholder="" value={currentBranch.adminEmail || ''} onChange={handleInputChange} disabled={isEditMode}/>
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="adminPassword">Password</Label>
                <Input id="adminPassword" type={showPassword ? "text" : "password"} placeholder={isEditMode ? "Enter new password to change" : ""} value={currentBranch.adminPassword || ''} onChange={handleInputChange} />
                <Button variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
             <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveBranch} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Branch Created!"
        description="Branch added successfully."
      />
    </div>
  );
}
