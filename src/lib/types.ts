import type { LucideIcon } from "lucide-react";

export type UserRole = 'Super Admin' | 'Branch Admin' | 'Staff';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  role: UserRole[];
  children?: NavItem[];
}
