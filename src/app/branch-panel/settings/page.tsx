"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { ChangePasswordDialog } from "@/components/branch/change-password-dialog";

export default function BranchSettingsPage() {
    const auth = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!auth?.currentUser) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Loading user data...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="p-4 md:p-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your branch account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="font-medium">Email</h4>
                        <p className="text-muted-foreground">{auth.currentUser.email}</p>
                    </div>
                     <div className="space-y-1">
                        <h4 className="font-medium">Password</h4>
                        <p className="text-muted-foreground">••••••••</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => setIsDialogOpen(true)}>Change Password</Button>
                </CardFooter>
            </Card>

            <ChangePasswordDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />
        </div>
    )
}
