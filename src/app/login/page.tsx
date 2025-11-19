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
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("admin@branchwise.com");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service not available.'});
        return;
    };
    setIsLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "Please check your credentials.",
        })
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-white/30 bg-white/80 backdrop-blur-lg">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Super Admin Login</CardTitle>
          <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm text-gray-600">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-white/50 rounded-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid gap-2 relative">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm text-gray-600">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/50 rounded-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary"
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
            <Button type="submit" className="w-full bg-[#1A56DB] hover:bg-[#1542A0] text-white rounded-lg py-3 text-base transition-all duration-200 ease-in-out" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </Button>
             <div className="mt-4 text-center text-sm text-gray-600">
                Are you a branch admin?{' '}
                <Link href="/branch-login" className="font-semibold text-primary hover:underline">
                    Branch Login
                </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
