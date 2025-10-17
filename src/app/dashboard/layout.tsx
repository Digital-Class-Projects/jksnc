
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
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[280px_1fr]">
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="border-r border-sidebar-border bg-card hidden md:flex"
          >
            <SidebarHeader className="h-20 p-4 flex items-center justify-start">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                <Logo />
                <span className="group-data-[state=collapsed]:hidden">BranchWise</span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <SidebarNav />
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col">
            <Header />
            <main className="flex-1 bg-background p-4 md:p-8">{children}</main>
          </div>
        </div>
      </SidebarProvider>
  );
}
