"use client";

import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { navItems } from "@/lib/placeholder-data";
import type { UserRole } from "@/lib/types";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock current user role
const currentUserRole: UserRole = "Super Admin";

export function SidebarNav() {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) =>
    item.role.includes(currentUserRole)
  );

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) =>
        item.children && item.children.length > 0 ? (
          <Collapsible
            key={`${item.href}-${item.title}`}
            className="w-full"
            defaultOpen={pathname.startsWith(item.href)}
          >
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
                <ChevronRight className="h-4 w-4 transform transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6">
              <SidebarMenu>
                {item.children.map((child) => (
                  <SidebarMenuItem key={`${child.href}-${child.title}`}>
                    <SidebarMenuButton
                      asChild
                      variant="default"
                      size="sm"
                      isActive={pathname === child.href}
                      className="h-9"
                    >
                      <Link href={child.href} className="flex items-center gap-3">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary ring-1 ring-primary-foreground"></div>
                        <span className="text-sm">{child.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SidebarMenuItem key={`${item.href}-${item.title}`}>
            <SidebarMenuButton
              asChild
              variant="default"
              isActive={pathname === item.href}
              className={cn(
                "w-full justify-start",
                pathname === item.href &&
                  "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-sidebar-primary"
              )}
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                <span className="text-base">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      )}
    </SidebarMenu>
  );
}
