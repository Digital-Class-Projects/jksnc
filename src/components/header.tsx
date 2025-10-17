
import { UserNav } from "@/components/user-nav";
import { Button } from "./ui/button";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "./ui/input";
import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
        </div>
      </div>
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="h-5 w-5" />
         </Button>
        <UserNav />
      </div>
    </header>
  );
}
