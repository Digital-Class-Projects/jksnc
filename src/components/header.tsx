
import { UserNav } from "@/components/user-nav";
import { Button } from "./ui/button";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "./ui/input";
import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[200px] lg:w-[300px] bg-white/50 rounded-lg focus:ring-primary transition-all"
            />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
         <Button variant="ghost" size="icon" className="rounded-full text-gray-600 hover:bg-gray-100">
            <HelpCircle className="h-5 w-5" />
         </Button>
        <UserNav />
      </div>
    </header>
  );
}
