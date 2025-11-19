
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { WebsiteFooter } from "@/components/website-footer";

export default function VerificationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <WebsiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="text-center max-w-lg w-full">
           <CardHeader>
            <div className="flex justify-center mb-4">
                <Construction className="h-16 w-16 text-primary"/>
            </div>
            <CardTitle className="text-3xl font-bold text-secondary">Certificate Verification</CardTitle>
            <CardDescription className="text-lg">This page is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our tool to verify certificate authenticity will be available here soon. We are building a secure and reliable verification system.
            </p>
          </CardContent>
        </Card>
      </main>
      <WebsiteFooter />
    </div>
  );
}
