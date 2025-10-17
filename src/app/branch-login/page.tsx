
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { useAuth, useDatabase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { get, query, ref, orderByChild, equalTo } from "firebase/database";
import { Eye, EyeOff } from "lucide-react";

export default function BranchLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const database = useDatabase();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !database) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service not available.'});
        return;
    };
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const branchesRef = query(ref(database, 'branches'), orderByChild('branchAdminUid'), equalTo(user.uid));
      const snapshot = await get(branchesRef);

      if (snapshot.exists()) {
        router.push("/branch-panel");
      } else {
        await auth.signOut();
        throw new Error("You do not have permission to access this panel.");
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "Invalid credentials or insufficient permissions.",
        })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Branch Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access your branch panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@yourbranch.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'}
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(p => !p)}
                  disabled={isLoading}
              >
                  {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
             <div className="mt-4 text-center text-sm">
                Not a branch admin?{' '}
                <Link href="/login" className="underline">
                    Super Admin Login
                </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
