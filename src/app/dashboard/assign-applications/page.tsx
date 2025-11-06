
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useDatabase } from "@/firebase";
import { ref, onValue, update, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Application = {
  id: string; // type_studentUid_appId
  studentUid: string;
  appId: string;
  fullName: string;
  submissionDate: string;
  courseName?: string; // For certificates
  nocPurpose?: string; // For NOC
  type: 'certificate' | 'noc';
  branchId?: string;
  branchName?: string;
};

type Branch = {
  id: string;
  name: string;
};

export default function AssignApplicationsPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);

    const certsRef = ref(database, "applications/certificates");
    const nocsRef = ref(database, "applications/noc");
    const branchesRef = ref(database, "branches");

    const combinedApps: Application[] = [];

    const fetchApps = (snapshot: any, type: 'certificate' | 'noc') => {
        snapshot.forEach((studentSnapshot: any) => {
            const studentUid = studentSnapshot.key!;
            studentSnapshot.forEach((appSnapshot: any) => {
            const appData = appSnapshot.val();
            combinedApps.push({
                id: `${type}_${studentUid}_${appSnapshot.key!}`,
                studentUid,
                appId: appSnapshot.key!,
                ...appData,
                type: type,
            });
            });
        });
    };

    const fetchAllData = async () => {
        try {
            const [certsSnapshot, nocsSnapshot, branchesSnapshot] = await Promise.all([
                get(certsRef),
                get(nocsRef),
                get(branchesRef)
            ]);

            fetchApps(certsSnapshot, 'certificate');
            fetchApps(nocsSnapshot, 'noc');

            const branchesData: Branch[] = [];
            const branchMap = new Map<string, string>();
            branchesSnapshot.forEach((child) => {
                const branchVal = child.val();
                branchesData.push({ id: child.key!, name: branchVal.name });
                branchMap.set(child.key!, branchVal.name);
            });
            setBranches(branchesData);
            
            const appsWithBranchNames = combinedApps.map(app => ({
                ...app,
                branchName: app.branchId ? branchMap.get(app.branchId) : undefined
            }));

            setAllApplications(appsWithBranchNames.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    fetchAllData();

  }, [database, toast]);
  
  const handleAssign = async () => {
    if (!database || !selectedBranchId || selectedAppIds.length === 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a branch and at least one application.'});
        return;
    }

    const updates: { [key: string]: any } = {};
    selectedAppIds.forEach(appId => {
        const [type, studentUid, id] = appId.split('_');
        const path = `applications/${type === 'certificate' ? 'certificates' : 'noc'}/${studentUid}/${id}/branchId`;
        updates[path] = selectedBranchId;
    });

    try {
        await update(ref(database), updates);
        toast({ title: 'Success', description: `${selectedAppIds.length} application(s) assigned successfully.`});
        
        const branchName = branches.find(b => b.id === selectedBranchId)?.name;
        setAllApplications(prev => prev.map(app => 
            selectedAppIds.includes(app.id) 
            ? { ...app, branchId: selectedBranchId, branchName: branchName } 
            : app
        ));
        setSelectedAppIds([]);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Assignment Failed', description: error.message });
    }
  };

  const unassignedApps = allApplications.filter(a => !a.branchId);
  const assignedApps = allApplications.filter(a => a.branchId);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Assign Applications to Branch</CardTitle>
          <CardDescription>
            Select unassigned applications and assign them to a branch for processing. You can also re-assign applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Tabs defaultValue="unassigned">
                <TabsList>
                    <TabsTrigger value="unassigned">Unassigned ({unassignedApps.length})</TabsTrigger>
                    <TabsTrigger value="assigned">Assigned ({assignedApps.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="unassigned">
                    <div className="flex flex-col sm:flex-row gap-4 my-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="branch-select">Assign to Branch</Label>
                            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                                <SelectTrigger id="branch-select">
                                    <SelectValue placeholder="Select a branch..." />
                                </SelectTrigger>
                                <SelectContent>
                                {branches.map(branch => (
                                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="self-end">
                            <Button onClick={handleAssign} disabled={!selectedBranchId || selectedAppIds.length === 0}>
                                Assign Selected ({selectedAppIds.length})
                            </Button>
                        </div>
                    </div>
                     <ApplicationTable
                        apps={unassignedApps}
                        selectedAppIds={selectedAppIds}
                        setSelectedAppIds={setSelectedAppIds}
                        isLoading={isLoading}
                        branches={branches}
                    />
                </TabsContent>
                 <TabsContent value="assigned">
                     <ApplicationTable
                        apps={assignedApps}
                        selectedAppIds={selectedAppIds}
                        setSelectedAppIds={setSelectedAppIds}
                        isLoading={isLoading}
                        isAssignedTable={true}
                        branches={branches}
                    />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationTable({
    apps,
    selectedAppIds,
    setSelectedAppIds,
    isLoading,
    isAssignedTable = false,
    branches
}: {
    apps: Application[],
    selectedAppIds: string[],
    setSelectedAppIds: React.Dispatch<React.SetStateAction<string[]>>,
    isLoading: boolean,
    isAssignedTable?: boolean,
    branches: Branch[]
}) {
    const database = useDatabase();
    const { toast } = useToast();

    const handleSelect = (appId: string, checked: boolean) => {
        setSelectedAppIds(prev => 
            checked ? [...prev, appId] : prev.filter(id => id !== appId)
        );
    };

    const handleSelectAll = (appsToSelect: Application[], checked: boolean) => {
        if (checked) {
            setSelectedAppIds(prev => [...new Set([...prev, ...appsToSelect.map(a => a.id)])]);
        } else {
            const appIdsToRemove = new Set(appsToSelect.map(a => a.id));
            setSelectedAppIds(prev => prev.filter(id => !appIdsToRemove.has(id)));
        }
    };
    
    const handleReassign = async (appId: string, newBranchId: string) => {
        if (!database) return;
        const [type, studentUid, id] = appId.split('_');
        const path = `applications/${type === 'certificate' ? 'certificates' : 'noc'}/${studentUid}/${id}/branchId`;
        try {
            await update(ref(database), { [path]: newBranchId });
            toast({ title: 'Success', description: 'Application re-assigned.' });
            // The parent component's onValue listener will handle the UI update automatically
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Re-assignment Failed', description: error.message });
        }
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {!isAssignedTable && <TableHead className="w-12"><Checkbox
                        checked={apps.length > 0 && apps.every(app => selectedAppIds.includes(app.id))}
                        onCheckedChange={(checked) => handleSelectAll(apps, !!checked)}
                    /></TableHead>}
                    <TableHead>Student Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Applied On</TableHead>
                    {isAssignedTable && <TableHead>Assigned Branch</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow><TableCell colSpan={isAssignedTable ? 6 : 5} className="h-24 text-center">Loading applications...</TableCell></TableRow>
                ) : apps.length > 0 ? (
                    apps.map(app => (
                        <TableRow key={app.id}>
                            {!isAssignedTable && <TableCell><Checkbox checked={selectedAppIds.includes(app.id)} onCheckedChange={(checked) => handleSelect(app.id, !!checked)}/></TableCell>}
                            <TableCell className="font-medium">{app.fullName}</TableCell>
                            <TableCell><Badge variant={app.type === 'certificate' ? 'default' : 'secondary'}>{app.type.toUpperCase()}</Badge></TableCell>
                            <TableCell>{app.type === 'certificate' ? app.courseName : app.nocPurpose}</TableCell>
                            <TableCell>{new Date(app.submissionDate).toLocaleDateString()}</TableCell>
                             {isAssignedTable && (
                                <TableCell>
                                    <Select 
                                        defaultValue={app.branchId} 
                                        onValueChange={(newBranchId) => handleReassign(app.id, newBranchId)}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Re-assign..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map(branch => (
                                                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                             )}
                        </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={isAssignedTable ? 5 : 4} className="h-24 text-center">No {isAssignedTable ? 'assigned' : 'unassigned'} applications.</TableCell></TableRow>
                )}
            </TableBody>
        </Table>
    );
}


    