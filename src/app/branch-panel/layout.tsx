
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
  Receipt,
  FileSignature,
  Award,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth, useDatabase } from "@/firebase";
import { useEffect, useState } from "react";
import { onValue, ref, query, orderByChild, equalTo, get } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged, type User } from 'firebase/auth';

type BranchNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    moduleName: string;
}

const allBranchNavItems: BranchNavItem[] = [
    { title: "Dashboard", href: "/branch-panel", icon: LayoutDashboard, moduleName: "Dashboard" },
    { title: "My Students", href: "/branch-panel/students", icon: GraduationCap, moduleName: "My Students" },
    { title: "Fee Receipts", href: "/branch-panel/fee-receipts", icon: Receipt, moduleName: "Fee Collection" },
    { title: "Certificate Apps", href: "/branch-panel/certificate-applications", icon: Award, moduleName: "Certificate Applications" },
    { title: "NOC Applications", href: "/branch-panel/noc-applications", icon: FileSignature, moduleName: "NOC Applications" },
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
  const [user, setUser] = useState<User | null | undefined>(undefined); // Start with undefined

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
    }
  }, [auth]);

  useEffect(() => {
    // Wait until user state is resolved (not undefined)
    if (user === undefined || !database) {
      return; 
    }
    
    // If user is null, redirect to login
    if (user === null) {
      router.push('/branch-login');
      return;
    }

    // User is authenticated, proceed to fetch data
    setIsLoading(true);
    let unsubscribePerms: (() => void) | null = null;
    
    const branchesRef = query(ref(database, 'branches'), orderByChild('branchAdminUid'), equalTo(user.uid));

    get(branchesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const branchId = Object.keys(snapshot.val())[0];
        const permissionsRef = ref(database, `branchPermissions/${branchId}`);

        unsubscribePerms = onValue(permissionsRef, (permSnapshot) => {
          const baseItems = allBranchNavItems.filter(item => 
            ["Dashboard", "My Students", "Certificate Applications", "NOC Applications"].includes(item.moduleName)
          );

          if (permSnapshot.exists()) {
            const permissions = permSnapshot.val() as BranchPermission[];
            const accessibleModules = permissions.filter(p => p.access).map(p => p.name);
            const filteredNavItems = allBranchNavItems.filter(item => 
                accessibleModules.includes(item.moduleName)
            );
            
            const combined = [...baseItems, ...filteredNavItems];
            const uniqueNavItems = Array.from(new Map(combined.map(item => [item.href, item])).values());
            setNavItems(uniqueNavItems);

          } else {
            setNavItems(baseItems);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Permission fetch error:", error);
          setIsLoading(false);
          setNavItems(allBranchNavItems.filter(item => ["Dashboard", "My Students"].includes(item.moduleName)));
        });

      } else {
        setIsLoading(false);
        setNavItems([]);
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You are not registered as a branch administrator.",
        });
        if (auth) auth.signOut();
        router.push('/branch-login');
      }
    }).catch((error) => {
      console.error("Branch fetch error:", error);
      setIsLoading(false);
       toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify branch admin status.",
      });
      if (auth) auth.signOut();
      router.push('/branch-login');
    });

    return () => {
      if (unsubscribePerms) {
        unsubscribePerms();
      }
    };

  }, [user, database, router, toast, auth]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  // Show skeleton loader while auth state is resolving or data is fetching
  if (isLoading || user === undefined) {
    return (
        <div className="space-y-2 p-2 sm:p-4">
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
              <BranchSidebarNav />
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
