
"use client";

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
import { Eye, EyeOff } from "lucide-react";
import { get, query, ref, orderByChild, equalTo } from "firebase/database";
import Link from "next/link";

export default function StudentLoginPage() {
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
      // Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is a student by querying the 'students' collection
      const studentsQuery = query(ref(database, 'students'), orderByChild('uid'), equalTo(user.uid));
      const snapshot = await get(studentsQuery);

      if (snapshot.exists()) {
          // User is a verified student
          toast({
              title: "Login Successful",
              description: "Thank you for logging in. Redirecting to your dashboard...",
          });
          router.push("/student-panel");
      } else {
          // If the user exists in Auth but not in the students DB table, deny access.
          await auth.signOut();
          throw new Error("You are not registered as a student.");
      }

    } catch (error: any) {
        let description = "An error occurred during login.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "Invalid credentials. Please check your email and password.";
        } else {
            description = error.message;
        }

        toast({
            variant: "destructive",
            title: "Login Failed",
            description: description,
        })
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Student Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="relative grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(p => !p)}
                  disabled={isLoading}
              >
                  {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
            <div className="mt-4 text-center text-sm">
                Go back to?{' '}
                <Link href="/" className="underline">
                    Website Home
                </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
