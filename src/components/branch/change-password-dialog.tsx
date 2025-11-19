"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleClose = () => {
    onClose();
    // Reset state after a short delay to allow animation to finish
    setTimeout(() => {
      setStep(1);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setIsLoading(false);
    }, 300);
  };

  const handleVerify = async () => {
    if (!auth?.currentUser || !currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      setStep(2);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
        toast({ variant: 'destructive', title: 'Verification Failed', description: "The password you entered is incorrect."});
      } else {
        setError("An unexpected error occurred. Please try again later.");
         toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!auth?.currentUser) return;

    setIsLoading(true);
    setError("");

    try {
      await updatePassword(auth.currentUser, newPassword);
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully. Please log in again.' });
      handleClose();
      await auth.signOut();
      router.push('/branch-login');
    } catch (err: any) {
      setError("Failed to update password. Please try again.");
      toast({ variant: 'destructive', title: 'Update Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <DialogHeader>
        <DialogTitle>Verify Branch Credentials</DialogTitle>
        <DialogDescription>
          For your security, please confirm your current password to proceed.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="space-y-2">
            <Label htmlFor="branch-email">Branch Email</Label>
            <Input id="branch-email" value={auth?.currentUser?.email || ""} readOnly disabled />
        </div>
        <div className="space-y-2 relative">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
            />
             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowCurrentPassword(p => !p)}>
                {showCurrentPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
            </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleVerify} disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Credentials"}
        </Button>
      </DialogFooter>
    </>
  );

  const renderStep2 = () => (
    <>
      <DialogHeader>
        <DialogTitle>Set New Password</DialogTitle>
        <DialogDescription>
          Enter a new, strong password for your account.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="space-y-2 relative">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowNewPassword(p => !p)}>
                {showNewPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
            </Button>
        </div>
        <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleUpdate} disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl">
        {step === 1 ? renderStep1() : renderStep2()}
      </DialogContent>
    </Dialog>
  );
}
