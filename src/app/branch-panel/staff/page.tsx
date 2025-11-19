
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
  query,
  orderByChild,
  equalTo,
  get
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
import { Eye, EyeOff, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";
import { Switch } from "@/components/ui/switch";

type Staff = {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  phone?: string;
  active: boolean;
};

type BranchInfo = {
    id: string;
    name: string;
};


export default function MyStaffPage() {
  const { toast } = useToast();
  const database = useDatabase();
  const auth = useAuth();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [currentStaff, setCurrentStaff] = useState<Partial<Staff & { password?: string }>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userBranch, setUserBranch] = useState<BranchInfo | null>(null);

  useEffect(() => {
    if (!database || !auth?.currentUser) {
        setIsDataLoading(false);
        return;
    };
    
    setIsDataLoading(true);

    const branchQuery = query(ref(database, 'branches'), orderByChild('branchAdminUid'), equalTo(auth.currentUser.uid));
    
    get(branchQuery).then(branchSnapshot => {
        if (branchSnapshot.exists()) {
            const branchId = Object.keys(branchSnapshot.val())[0];
            const branchName = branchSnapshot.val()[branchId].name;
            setUserBranch({ id: branchId, name: branchName });

            const staffRef = query(ref(database, 'staff'), orderByChild('branchId'), equalTo(branchId));
            const unsubscribeStaff = onValue(staffRef, (snapshot) => {
                const staffData: Staff[] = [];
                snapshot.forEach((childSnapshot) => {
                    staffData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
                });
                setStaffList(staffData);
                setIsDataLoading(false);
            }, (error) => {
                setIsDataLoading(false);
                toast({ variant: 'destructive', title: 'Error loading staff', description: error.message });
            });
             return unsubscribeStaff;
        } else {
            setIsDataLoading(false);
            toast({variant: 'destructive', title: 'Branch not found', description: "Could not find the branch assigned to you."})
        }
    }).catch(error => {
        setIsDataLoading(false);
        toast({variant: 'destructive', title: 'Error', description: error.message});
    });

  }, [database, auth, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCurrentStaff((prev) => ({ ...prev, [id]: value }));
  };

  const handleOpenDialog = (staff: Staff | null = null) => {
    if (staff) {
        setIsEditMode(true);
        setCurrentStaff(staff);
    } else {
        setIsEditMode(false);
        setCurrentStaff({ role: "Teacher", active: true, branchId: userBranch?.id });
    }
    setOpenDialog(true);
  };

  const handleSaveStaff = async () => {
    if (!database || !auth || !currentStaff.name || !currentStaff.email || !userBranch) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name, email, and branch are required." });
      return;
    }
    
    setIsLoading(true);

    if (isEditMode) {
        if (!currentStaff.id) return;
        const staffRef = ref(database, `staff/${currentStaff.id}`);
        const { id, password, ...staffData } = currentStaff;
        try {
            await update(staffRef, staffData);
            toast({ title: "Staff Updated", description: `${currentStaff.name}'s information has been updated.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    } else {
        if (!currentStaff.password) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Password is required for new staff." });
            setIsLoading(false);
            return;
        }
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, currentStaff.email, currentStaff.password);
          const staffUid = userCredential.user.uid;
          
          const { password, ...staffData } = currentStaff;

          const staffToSave = {
            ...staffData,
            uid: staffUid,
            active: true,
            branchId: userBranch.id
          };
    
          const staffRef = ref(database, 'staff');
          const newStaffRef = push(staffRef);
          await set(newStaffRef, staffToSave);
          
          setShowSuccessDialog(true);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error Creating Staff",
            description: error.message || "An unknown error occurred.",
          });
        }
    }

    setIsLoading(false);
    setOpenDialog(false);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this staff member?")) {
      const staffMemberRef = ref(database, `staff/${staffId}`);
      await remove(staffMemberRef);
      toast({ title: "Staff Deleted", description: "The staff member has been removed." });
    }
  };
  
  const handleToggleActive = (staffId: string, currentStatus: boolean) => {
    if(!database) return;
    const staffRef = ref(database, `staff/${staffId}`);
    update(staffRef, { active: !currentStatus });
  }

  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
       <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Staff List ({filteredStaff.length})</CardTitle>
                  <CardDescription>Manage staff members for {userBranch?.name || 'your branch'}.</CardDescription>
                </div>
                <Button size="sm" className="gap-1" onClick={() => handleOpenDialog()} disabled={!userBranch}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add New
                </Button>
            </div>
            <div className="mt-4">
                <Label htmlFor="search">Search:</Label>
                <Input 
                    id="search"
                    placeholder="Search by name or email..." 
                    className="max-w-sm" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
             {isDataLoading ? (
                <div className="text-center p-8">Loading staff...</div>
             ) : filteredStaff.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    No staff members found for your branch.
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaff.map(staff => (
                        <Card key={staff.id}>
                             <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{staff.name}</CardTitle>
                                    <Switch checked={staff.active} onCheckedChange={() => handleToggleActive(staff.id, staff.active)} />
                                </div>
                                <CardDescription>{staff.role}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <p>Email: {staff.email}</p>
                                <p>Phone: {staff.phone || 'N/A'}</p>
                                <div className="flex items-center justify-between pt-2">
                                     <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" className="p-0 h-auto text-xs">Change Password</Button>
                                        </DialogTrigger>
                                        {/* You'll need to create a ChangePasswordDialog component */}
                                        <DialogContent><DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader><p>Password change functionality needs a secure backend implementation.</p></DialogContent>
                                    </Dialog>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(staff)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(staff.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             )}
        </CardContent>
       </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update the details for this staff member." : `Create a login for a new staff member in ${userBranch?.name}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Staff Name</Label>
                <Input id="name" value={currentStaff.name || ''} onChange={handleInputChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="email">Staff Email</Label>
                <Input id="email" type="email" value={currentStaff.email || ''} onChange={handleInputChange} disabled={isEditMode} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">Staff Phone</Label>
                <Input id="phone" type="tel" value={currentStaff.phone || ''} onChange={handleInputChange} />
              </div>
              {!isEditMode && (
                  <div className="space-y-2 relative">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type={showPassword ? "text" : "password"} value={currentStaff.password || ''} onChange={handleInputChange} />
                     <Button variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={currentStaff.role || 'Teacher'} onChange={handleInputChange} />
              </div>
               <div className="space-y-2">
                <Label>Branch</Label>
                <Input value={userBranch?.name || ''} disabled />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSaveStaff} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Staff'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Staff Added!"
        description="New staff member created successfully."
      />
    </div>
  );
}
