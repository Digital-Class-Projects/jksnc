
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import Logo from "@/components/logo";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Book,
  Settings,
  LogOut,
  LucideIcon,
  Video,
  InfoIcon,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth, useDatabase } from "@/firebase";
import { useEffect, useState } from "react";
import { onValue, ref, query, orderByChild, equalTo } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type BranchNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    moduleName: string;
}

const allBranchNavItems: BranchNavItem[] = [
    { title: "Dashboard", href: "/branch-panel", icon: LayoutDashboard, moduleName: "Dashboard" },
    { title: "My Students", href: "/branch-panel/students", icon: GraduationCap, moduleName: "My Students" },
    { title: "My Staff", href: "/branch-panel/staff", icon: Users, moduleName: "My Staff" },
    { title: "My Courses", href: "/branch-panel/courses", icon: Book, moduleName: "My Courses" },
    { title: "Settings", href: "/branch-panel/settings", icon: Settings, moduleName: "Settings" },
    { title: "Live Classes", href: "/branch-panel/live-classes", icon: Video, moduleName: "Live Classes" },
    { title: "Student Information", href: "/branch-panel/student-information", icon: InfoIcon, moduleName: "Student Information" },
    { title: "Communicate", href: "/branch-panel/communicate", icon: MessageSquare, moduleName: "Communicate" },
];

type BranchPermission = {
    name: string;
    access: boolean;
}

function BranchSidebarNav() {
  const pathname = usePathname();
  const auth = useAuth();
  const database = useDatabase();
  const router = useRouter();
  const { toast } = useToast();
  const [navItems, setNavItems] = useState<BranchNavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth?.currentUser || !database) {
      setIsLoading(false);
      return;
    };
    
    const currentUserUid = auth.currentUser.uid;

    const branchesRef = query(ref(database, 'branches'), orderByChild('branchAdminUid'), equalTo(currentUserUid));

    const unsubscribeBranches = onValue(branchesRef, (snapshot) => {
        if (snapshot.exists()) {
            const branchId = Object.keys(snapshot.val())[0];
            const permissionsRef = ref(database, `branchPermissions/${branchId}`);

            const unsubscribePerms = onValue(permissionsRef, (permSnapshot) => {
                if (permSnapshot.exists()) {
                    const permissions = permSnapshot.val() as BranchPermission[];
                    const accessibleModules = permissions.filter(p => p.access).map(p => p.name);
                    
                    const filteredNavItems = allBranchNavItems.filter(item => 
                        item.moduleName === "Dashboard" || accessibleModules.includes(item.moduleName)
                    );
                    setNavItems(filteredNavItems);
                } else {
                     // Default to dashboard and students if no permissions are set
                    setNavItems(allBranchNavItems.filter(item => item.moduleName === "Dashboard" || item.moduleName === "My Students"));
                }
                setIsLoading(false);
            }, () => {
              // Error callback for permissions
              setIsLoading(false);
              setNavItems(allBranchNavItems.filter(item => item.moduleName === "Dashboard" || item.moduleName === "My Students"));
            });
            
            return () => unsubscribePerms();
        } else {
            setIsLoading(false);
            // Handle case where user is not a branch admin of any branch
            setNavItems([]);
             // Optional: redirect if not a valid admin
            toast({
                variant: "destructive",
                title: "Access Denied",
                description: "You are not registered as a branch administrator.",
            });
            auth.signOut();
            router.push('/branch-login');
        }
    }, () => {
        // Error callback for branches query
        setIsLoading(false);
    });

    return () => unsubscribeBranches();

  }, [auth, database, router, toast]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
    )
  }

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={`${item.href}-${item.title}`}>
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
      ))}
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


export default function BranchPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-[280px_1fr]">
          <Sidebar
            variant="sidebar"
            collapsible="none"
            className="border-r border-sidebar-border bg-card hidden md:flex"
          >
            <SidebarHeader className="h-20 p-4 flex items-center justify-center">
              <Logo />
            </SidebarHeader>
            <SidebarContent className="p-4">
              <BranchSidebarNav />
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
