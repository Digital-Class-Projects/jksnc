import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-8">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Reports &amp; Export</CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Check back soon for features to generate and export reports!</p>
        </CardContent>
      </Card>
    </div>
  );
}
