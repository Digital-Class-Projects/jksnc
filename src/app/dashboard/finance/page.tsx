import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FinancePage() {
  return (
    <div className="p-4 md:p-8">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Fee &amp; Finance Management</CardTitle>
          <CardDescription>This page is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Check back soon for financial tracking and reporting features!</p>
        </CardContent>
      </Card>
    </div>
  );
}
