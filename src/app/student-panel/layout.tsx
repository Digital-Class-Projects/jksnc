
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import Logo from "@/components/logo";
import {
  LayoutDashboard,
  LogOut,
  LucideIcon,
  FileText,
  Upload,
  Award,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";

type StudentNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
}

const studentNavItems: StudentNavItem[] = [
    { title: "Dashboard", href: "/student-panel", icon: LayoutDashboard },
    { title: "My Certificates", href: "/student-panel/my-certificates", icon: Award },
    { title: "Apply for Certificate", href: "/student-panel/apply-for-certificate", icon: Award },
    { title: "Pay Fees", href: "/student-panel/pay-fees", icon: CreditCard },
    { title: "Upload Fee Receipt", href: "/student-panel/upload-fee-receipt", icon: Upload },
    { title: "Download Result", href: "/student-panel/download-result", icon: FileText },
    { title: "NOC Apply", href: "/student-panel/noc-apply", icon: FileText },
];

function StudentSidebarNav() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/student-login');
    }
  };

  return (
    <SidebarMenu>
      {studentNavItems.map((item) =>
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              variant="default"
              isActive={pathname === item.href}
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                <span className="text-base">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
      )}
       <SidebarMenuItem>
          <SidebarMenuButton
            variant="default"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                <span className="text-base">Log Out</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
    </SidebarMenu>
  );
}


export default function StudentPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[auto_1fr]">
          <Sidebar
            variant="sidebar"
            collapsible="none"
            className="border-r border-sidebar-border bg-card hidden md:flex"
          >
            <SidebarHeader className="h-20 p-4 flex items-center justify-center">
              <Logo />
            </SidebarHeader>
            <SidebarContent className="p-2 sm:p-4">
              <StudentSidebarNav />
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col">
            <Header />
            <main className="flex-1 bg-background p-4 sm:p-6 md:p-8">{children}</main>
          </div>
        </div>
      </SidebarProvider>
  );
}
