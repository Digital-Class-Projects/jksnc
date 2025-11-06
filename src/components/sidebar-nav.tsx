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
                className={cn(
                  "w-full justify-between text-gray-600 hover:bg-blue-100 hover:text-primary",
                  pathname.startsWith(item.href) && "bg-blue-100 text-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  <span className="text-base font-medium">{item.title}</span>
                </div>
                <ChevronRight className="h-4 w-4 transform transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 mt-1 space-y-1">
              <SidebarMenu>
                {item.children.map((child) => (
                  <SidebarMenuItem key={`${child.href}-${child.title}`}>
                    <SidebarMenuButton
                      asChild
                      variant="default"
                      size="sm"
                      className={cn(
                        "h-9 text-gray-600 hover:text-primary justify-start",
                        pathname === child.href && "text-primary font-semibold"
                      )}
                    >
                      <Link href={child.href} className="flex items-center gap-3">
                         <div className={cn(
                           "h-1.5 w-1.5 rounded-full bg-gray-400 ring-1 ring-gray-300",
                           pathname === child.href && "bg-primary ring-primary-foreground"
                         )}></div>
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
              className={cn(
                "w-full justify-start text-gray-600 hover:bg-blue-100 hover:text-primary",
                pathname === item.href &&
                  "bg-blue-100 text-primary border-l-4 border-primary font-semibold"
              )}
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                <span className="text-base font-medium">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      )}
    </SidebarMenu>
  );
}
