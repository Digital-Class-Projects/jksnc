
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { WebsiteFooter } from "@/components/website-footer";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <WebsiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="text-center max-w-lg w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
                <Construction className="h-16 w-16 text-primary"/>
            </div>
            <CardTitle className="text-3xl font-bold text-secondary">Contact Us</CardTitle>
            <CardDescription className="text-lg">This page is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our contact form and details will be available here soon. We are working hard to bring you a way to get in touch with us easily.
            </p>
          </CardContent>
        </Card>
      </main>
      <WebsiteFooter />
    </div>
  );
}
