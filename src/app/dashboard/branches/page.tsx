
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";
import { Switch } from "@/components/ui/switch";

type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  branchAdminUid: string;
  adminEmail?: string;
  phone?: string;
  active: boolean;
};

function ChangePasswordDialog({ email }: { email: string }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const handleUpdatePassword = () => {
        // In a real app, you would securely update the password using a backend function.
        // The client-side SDK cannot change another user's password directly.
        toast({ title: 'Password Updated (Simulated)', description: `Password for ${email} has been set to: ${password}` });
    };

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                    Update the password for the admin of this branch.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input id="email" value={email} readOnly disabled />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="password">New Password</Label>
                    <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                     <Button variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleUpdatePassword}>Update Password</Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function BranchesPage() {
  const { toast } = useToast();
  const database = useDatabase();
  const auth = useAuth();

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
      setCurrentBranch({ name: "", city: "", address: "", adminEmail: "", adminPassword: "", phone: "", active: true });
    }
    setOpenDialog(true);
  }

  const handleSaveBranch = async () => {
    if (!database || !auth || !currentBranch.name || !currentBranch.city || !currentBranch.adminEmail) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all required fields.",
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
          // This creates the user in Firebase Auth.
          // Note: You can't easily change this email later from the admin panel.
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            currentBranch.adminEmail,
            currentBranch.adminPassword
          );
          const branchAdminUid = userCredential.user.uid;

          const branchData = {
            name: currentBranch.name,
            city: currentBranch.city,
            address: currentBranch.address,
            phone: currentBranch.phone,
            branchAdminUid: branchAdminUid,
            adminEmail: currentBranch.adminEmail, // Saving the email for display purposes
            active: true,
          };
          
          const branchesRef = ref(database, "branches");
          const newBranchRef = push(branchesRef);
          await set(newBranchRef, branchData);

          setShowSuccessDialog(true);
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            toast({
              variant: "destructive",
              title: "Email Already in Use",
              description: "This email address is already registered. Please use a different email.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to create branch admin user.",
            });
          }
        }
    }
    
    setIsLoading(false);
    setOpenDialog(false);
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this branch? This action cannot be undone.")) {
      const branchRef = ref(database, `branches/${branchId}`);
      try {
        await remove(branchRef);
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-sm">Change Password</Button>
                          </DialogTrigger>
                          <ChangePasswordDialog email={branch.adminEmail || 'N/A'} />
                        </Dialog>
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the details for this branch." : "Fill in the details for the new branch and create its admin account."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input id="name" placeholder="Main Campus" value={currentBranch.name || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" value={currentBranch.city || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="123-456-7890" value={currentBranch.phone || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Branch Address</Label>
              <Textarea id="address" placeholder="123 Main St, New York, NY 10001" value={currentBranch.address || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Branch Admin Email</Label>
              <Input id="adminEmail" type="email" placeholder="admin@maincampus.com" value={currentBranch.adminEmail || ''} onChange={handleInputChange} />
            </div>
            {!isEditMode && (
              <div className="space-y-2 relative">
                <Label htmlFor="adminPassword">Branch Admin Password</Label>
                <Input id="adminPassword" type={showPassword ? "text" : "password"} placeholder="Enter a secure password" value={currentBranch.adminPassword || ''} onChange={handleInputChange} />
                <Button variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
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
