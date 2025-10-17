
"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function StaffPanelPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
      <Card className="shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              <span role="img" aria-label="waving hand" className="mr-2">
                👋
              </span>
              Welcome, Staff
            </h2>
            <p className="text-muted-foreground">
              Here you can manage student information, verify documents, and generate certificates.
            </p>
          </div>
          <div className="hidden md:block">
            <Image
              src="https://picsum.photos/seed/staff-dashboard/180/120"
              alt="Welcome Illustration"
              width={180}
              height={120}
              className="rounded-lg"
              data-ai-hint="office desk"
            />
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Your dashboard overview will appear here.</p>
        </CardContent>
       </Card>
    </div>
  );
}
