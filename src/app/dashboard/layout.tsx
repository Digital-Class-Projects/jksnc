
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import Logo from "@/components/logo";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[auto_1fr]">
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="border-r border-gray-200 bg-[#F9FAFB] hidden md:flex"
          >
            <SidebarHeader className="h-20 p-4 flex items-center justify-center">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                <Logo />
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-2 sm:p-4">
              <SidebarNav />
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col">
            <Header />
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
  );
}
