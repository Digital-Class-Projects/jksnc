
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WebsiteFooter } from "@/components/website-footer";

export default function CoursesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <WebsiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-secondary">Courses</CardTitle>
            <CardDescription>This page is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our course catalog will be available here soon.
            </p>
          </CardContent>
        </Card>
      </main>
      <WebsiteFooter />
    </div>
  );
}
