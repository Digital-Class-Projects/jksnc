
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BranchPanelPage() {
  return (
    <div className="p-4 md:p-8">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Branch Admin Dashboard</CardTitle>
          <CardDescription>Welcome to your branch management panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This page is under construction. You will soon see stats and overview for your branch here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
