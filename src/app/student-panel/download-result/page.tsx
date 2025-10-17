
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Download } from "lucide-react";

export default function DownloadResultPage() {
  const handleDownload = () => {
    // In a real application, this would trigger a file download.
    // For this example, we'll just log to the console.
    console.log("Downloading result...");
    alert("Result download initiated (simulated).");
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Download Result</CardTitle>
          <CardDescription>
            Your latest marks card is available for download.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="p-8 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold">
              Diploma Final Year Result - 2024
            </h3>
            <p className="text-muted-foreground text-sm">
              Generated on: {new Date().toLocaleDateString()}
            </p>
          </div>
          <Button onClick={handleDownload} size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download Marksheet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
