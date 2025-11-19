
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, EyeOff, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/success-dialog";
import { Switch } from "@/components/ui/switch";
import { updateUserPassword } from "@/ai/flows/update-user-password";

type Staff = {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  branchId: string;
  branchName?: string;
  phone?: string;
  active: boolean;
};

type Branch = {
  id: string;
  name: string;
}

const staffPermissionModules = [
  { name: "Front Office", access: true },
  { name: "Student Info.", access: true },
  { name: "Fee Collection", access: false },
  { name: "Attendance", access: false },
  { name: "Certificates", access: false },
  { name: "Examination", access: false },
  { name: "HR Manager", access: false },
  { name: "Income", access: false },
  { name: "Expenses", access: false },
  { name: "Communicate", access: false },
  { name: "List Business", access: false },
  { name: "Sell Courses", access: false },
  { name: "Website Manage", access: false },
];


function ChangePasswordDialog({ staff, onPasswordUpdate, isUpdating }: { staff: Staff, onPasswordUpdate: (newPassword: string) => void, isUpdating: boolean }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Change Password for {staff.name}</DialogTitle>
                <DialogDescription>
                    Enter a new password for this staff member. They will be able to log in with the new credentials immediately.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Staff Email</Label>
                    <Input id="email" value={staff.email} readOnly disabled />
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
                <Button onClick={() => onPasswordUpdate(password)} disabled={isUpdating || !password}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}


function StaffPermissionsDialog({ staff }: { staff: Staff }) {
  const [permissions, setPermissions] = useState(staffPermissionModules);
  const { toast } = useToast();
  const database = useDatabase();

  useEffect(() => {
    if (!database) return;
    const permissionsRef = ref(database, `staffPermissions/${staff.id}`);
    const unsubscribe = onValue(permissionsRef, (snapshot) => {
      if (snapshot.exists()) {
        setPermissions(snapshot.val());
      }
    });
    return () => unsubscribe();
  }, [database, staff.id]);


  const handleAccessChange = (index: number, checked: boolean) => {
    const newPermissions = [...permissions];
    newPermissions[index].access = checked;
    setPermissions(newPermissions);
  };
  
  const handleSavePermissions = () => {
    if (!database) return;
    const permissionsRef = ref(database, `staffPermissions/${staff.id}`);
    set(permissionsRef, permissions)
    .then(() => {
        toast({ title: "Permissions Updated", description: `Permissions for ${staff.name} have been saved.` });
    })
    .catch((error) => {
        toast({ variant: "destructive", title: "Error", description: error.message });
    });
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Permission List for {staff.name}</DialogTitle>
        <DialogDescription>
          Enable or disable access to modules for this staff member.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 max-h-[60vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">SR NO.</TableHead>
              <TableHead>MODULE NAME</TableHead>
              <TableHead className="text-right">ACCESS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{permission.name}</TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={permission.access}
                    onCheckedChange={(checked) =>
                      handleAccessChange(index, checked)
                    }
                    aria-label={`${permission.name} access`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <DialogFooter>
          <Button type="button" onClick={handleSavePermissions}>
            Save Permissions
          </Button>
        </DialogFooter>
    </DialogContent>
  );
}


export default function StaffPage() {
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
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [staffForPasswordChange, setStaffForPasswordChange] = useState<Staff | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (!database) return;
    
    setIsDataLoading(true);

    const branchesRef = ref(database, "branches");
    const staffRef = ref(database, "staff");

    const unsubscribeBranches = onValue(branchesRef, (snapshot) => {
        const branchesData: Branch[] = [];
        const branchMap = new Map<string, string>();
        snapshot.forEach(childSnapshot => {
            const branch = { id: childSnapshot.key!, name: childSnapshot.val().name };
            branchesData.push(branch);
            branchMap.set(branch.id, branch.name);
        });
        setBranches(branchesData);

        // Fetch staff after branches are loaded to map branch names
        const unsubscribeStaff = onValue(staffRef, (staffSnapshot) => {
            const staffData: Staff[] = [];
            staffSnapshot.forEach(childSnapshot => {
                const staffVal = childSnapshot.val();
                staffData.push({ 
                    id: childSnapshot.key!, 
                    ...staffVal, 
                    active: staffVal.active ?? true,
                    branchName: staffVal.branchId ? branchMap.get(staffVal.branchId) : 'N/A'
                });
            });
            setStaffList(staffData);
            setIsDataLoading(false);
        });
        return unsubscribeStaff;
    });

    return () => {
        unsubscribeBranches();
    };
  }, [database]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCurrentStaff((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: 'branchId' | 'role') => (value: string) => {
    setCurrentStaff((prev) => ({ ...prev, [id]: value }));
  }

  const handleOpenDialog = (staff: Staff | null = null) => {
    if (staff) {
        setIsEditMode(true);
        setCurrentStaff(staff);
    } else {
        setIsEditMode(false);
        setCurrentStaff({ role: "Teacher", active: true });
    }
    setOpenDialog(true);
  };
  
  const handleOpenPasswordDialog = (staff: Staff) => {
    setStaffForPasswordChange(staff);
    setOpenPasswordDialog(true);
  }

  const handlePasswordUpdate = async (newPassword: string) => {
      if (staffForPasswordChange) {
        setIsUpdatingPassword(true);
        try {
            await updateUserPassword({
                email: staffForPasswordChange.email,
                newPassword: newPassword,
                role: 'staff',
                id: staffForPasswordChange.id
            });
            toast({
                title: "Password Updated",
                description: `Password for ${staffForPasswordChange.name} has been changed.`,
            });
            setOpenPasswordDialog(false);
            setStaffForPasswordChange(null);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: error.message || 'Could not update password.',
            });
        } finally {
            setIsUpdatingPassword(false);
        }
      }
  };

  const handleSaveStaff = async () => {
    if (!database || !currentStaff.name || !currentStaff.email || !currentStaff.branchId) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name, email, and branch are required." });
      return;
    }
    
    setIsLoading(true);

    if (isEditMode) {
        if (!currentStaff.id) return;
        const staffRef = ref(database, `staff/${currentStaff.id}`);
        const { id, password, branchName, ...staffData } = currentStaff;
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
          const result = await updateUserPassword({
              email: currentStaff.email,
              newPassword: currentStaff.password,
              role: 'staff',
              isNewUser: true,
          });

          const { password, branchName, ...staffData } = currentStaff;

          const staffToSave = {
            ...staffData,
            uid: result.uid,
            active: true,
          };
    
          const newStaffRef = push(ref(database, 'staff'));
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
    if (confirm("Are you sure you want to delete this staff member? This will also delete their login credentials and cannot be undone.")) {
      try {
        await remove(ref(database, `staff/${staffId}`));
        // TODO: In a real app, you would also delete the user from Firebase Auth
        // using a Cloud Function to handle this securely.
        toast({ title: "Staff Deleted", description: "The staff member has been removed." });
      } catch(e: any) {
        toast({ variant: 'destructive', title: 'Deletion failed', description: e.message });
      }
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
       <div className="flex justify-between items-center">
            <Input 
                placeholder="Search Teacher..." 
                className="max-w-sm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button size="sm" className="gap-1" onClick={() => handleOpenDialog()}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add
              </span>
            </Button>
        </div>

        {isDataLoading ? (
            <div className="text-center p-8">Loading staff...</div>
        ) : filteredStaff.length === 0 ? (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No staff members found.
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredStaff.map(staff => (
                    <Card key={staff.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{staff.name}</CardTitle>
                                <Switch checked={staff.active} onCheckedChange={() => handleToggleActive(staff.id, staff.active)} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Email : {staff.email}</p>
                            <p>Phone : {staff.phone || 'N/A'}</p>
                            <p>Role : {staff.role}</p>
                            <p>Branch : {staff.branchName}</p>
                            <div className="flex items-center justify-between pt-2">
                                <Button variant="link" className="p-0 h-auto" onClick={() => handleOpenPasswordDialog(staff)}>Change Password</Button>
                                <div className="flex items-center">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(staff)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(staff.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full">Set Permission</Button>
                                </DialogTrigger>
                                <StaffPermissionsDialog staff={staff} />
                           </Dialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update the details for this staff member." : "Create a login and assign a role and branch."}
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
                <Input id="role" value={currentStaff.role || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                 <Select onValueChange={handleSelectChange('branchId')} value={currentStaff.branchId || ''}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                        {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleSaveStaff} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Staff'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {staffForPasswordChange &&
            <Dialog open={openPasswordDialog} onOpenChange={setOpenPasswordDialog}>
                <ChangePasswordDialog staff={staffForPasswordChange} onPasswordUpdate={handlePasswordUpdate} isUpdating={isUpdatingPassword} />
            </Dialog>
        }

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Staff Added!"
        description="New staff member created successfully."
      />
    </div>
  );
}
