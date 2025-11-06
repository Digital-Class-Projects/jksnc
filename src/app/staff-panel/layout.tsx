
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
  Video,
  LogOut,
  LucideIcon,
  ChevronDown,
  GraduationCap,
  Megaphone,
  LogIn,
  Trash2,
  Info,
  Award,
  FileSignature,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type StaffNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    target?: string;
    children?: { title: string; href: string, icon?: LucideIcon, target?:string }[];
}

const staffNavItems: StaffNavItem[] = [
    { title: "Dashboard", href: "/staff-panel", icon: LayoutDashboard },
    { title: "Certificates", href: "/dashboard/certificates", icon: Award },
    { title: "Certificate Applications", href: "/staff-panel/certificate-applications", icon: Award },
    { title: "NOC Applications", href: "/staff-panel/noc-applications", icon: FileSignature },
    { title: "Live Classes", href: "/staff-panel/live-classes", icon: Video },
    { 
        title: "Front Office", 
        href: "/staff-panel/front-office", 
        icon: Megaphone,
        children: [
            { title: "Admission Enquiry", href: "/staff-panel/front-office/admission-enquiry" },
            { title: "Visitor Books", href: "/staff-panel/front-office/visitor-books" },
            { title: "Phone Calls Logs", href: "/staff-panel/front-office/phone-call-logs" },
            { title: "Complains", href: "/staff-panel/front-office/complains" },
            { title: "Postal Service", href: "#" },
            { title: "Front Office Setup", href: "/staff-panel/front-office/front-office-setup" },
        ]
    },
    { 
        title: "Student Information", 
        href: "/staff-panel/student-information", 
        icon: GraduationCap,
        children: [
            { title: "Student Admission", href: "/staff-panel/student-information/student-admission" },
            { title: "Student Id Cards", href: "/staff-panel/student-information/student-id-cards" },
            { title: "Setup Info.", href: "/staff-panel/front-office/front-office-setup", icon: Info },
            { title: "Student Login", href: "/student-login", icon: LogIn},
            { title: "Trash", href: "/staff-panel/student-information/trash", icon: Trash2 },
        ]
    },
];

function StaffSidebarNav() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  return (
    <SidebarMenu>
      {staffNavItems.map((item) =>
        item.children ? (
            <Collapsible key={item.title} defaultOpen={pathname.startsWith(item.href)}>
                <CollapsibleTrigger asChild>
                     <SidebarMenuButton
                        variant="default"
                        className="w-full justify-between"
                        isActive={pathname.startsWith(item.href)}
                    >
                        <div className="flex items-center gap-2">
                            <item.icon className="h-5 w-5" />
                            <span className="text-base">{item.title}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 transform transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1">
                    <ul className="space-y-1">
                        {item.children.map(child => (
                            <li key={child.title}>
                                <Link 
                                    href={child.href} 
                                    target={child.target}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent",
                                        pathname === child.href && "bg-sidebar-accent font-semibold"
                                )}>
                                   {child.icon ? <child.icon className="h-4 w-4" /> : <span className="w-4 h-4" />}
                                   {child.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CollapsibleContent>
            </Collapsible>
        ) : (
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
        )
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


export default function StaffPanelLayout({
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
              <StaffSidebarNav />
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
