
import {
  LayoutDashboard,
  Globe,
  Video,
  Infinity,
  Users,
  Building,
  GraduationCap,
  MessageSquare,
  Settings,
  CreditCard,
  LogOut,
  LucideIcon,
  Home,
  Book,
  Info,
  UserSquare,
  HelpCircle,
  FileText,
  GalleryVertical,
  MailQuestion,
  Palette,
  Monitor,
  Presentation,
  LogIn,
  ShieldCheck,
  Building2,
  UserCog,
  ClipboardList,
  Receipt,
  Award,
  FileSignature,
  Send,
  Zap,
} from "lucide-react";
import { NavItem } from "./types";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    role: ["Super Admin", "Branch Admin"],
  },
  {
    title: "Website Manage",
    href: "/dashboard/website-manage",
    icon: Globe,
    role: ["Super Admin"],
    children: [
      {
        title: "Home Page",
        href: "/dashboard/website-manage/home-page",
        icon: Home,
        role: ["Super Admin"],
      },
      {
        title: "About Us Page",
        href: "/dashboard/website-manage/about-us-page",
        icon: Info,
        role: ["Super Admin"],
      },
      {
        title: "Educators Page",
        href: "/dashboard/website-manage/educators-page",
        icon: UserSquare,
        role: ["Super Admin"],
      },
      {
        title: "Faq Page",
        href: "/dashboard/website-manage/faq-page",
        icon: HelpCircle,
        role: ["Super Admin"],
      },
      {
        title: "Blogs",
        href: "/dashboard/website-manage/blogs",
        icon: FileText,
        role: ["Super Admin"],
      },
      {
        title: "Gallery",
        href: "/dashboard/website-manage/gallery",
        icon: GalleryVertical,
        role: ["Super Admin"],
      },
      {
        title: "Website Inquiry",
        href: "/dashboard/website-manage/website-inquiry",
        icon: MailQuestion,
        role: ["Super Admin"],
      },
      {
        title: "Colors",
        href: "/dashboard/website-manage/colors",
        icon: Palette,
        role: ["Super Admin"],
      },
      {
        title: "My Website",
        href: "/dashboard/website-manage/my-website",
        icon: Monitor,
        role: ["Super Admin"],
      },
      {
        title: "Adv. Banner",
        href: "/dashboard/website-manage/adv-banner",
        icon: Presentation,
        role: ["Super Admin"],
      },
    ],
  },
  {
    title: "Certificates",
    href: "/dashboard/certificates",
    icon: Award,
    role: ["Super Admin", "Staff"],
  },
  {
    title: "Assign Applications",
    href: "/dashboard/assign-applications",
    icon: Send,
    role: ["Super Admin"],
  },
  {
    title: "Certificate Applications",
    href: "/dashboard/certificate-applications",
    icon: FileText,
    role: ["Super Admin"],
  },
  {
    title: "NOC Applications",
    href: "/dashboard/noc-applications",
    icon: FileSignature,
    role: ["Super Admin"],
  },
  {
    title: "Live Classes",
    href: "/dashboard/classes",
    icon: Video,
    role: ["Branch Admin", "Staff"],
  },
  {
    title: "Meta Management",
    href: "/dashboard/meta-management",
    icon: Infinity,
    role: ["Super Admin"],
  },
  {
    title: "Staff Management",
    href: "/dashboard/staff",
    icon: Users,
    role: ["Super Admin", "Branch Admin"],
    children: [
       {
        title: "Manage Staff",
        href: "/dashboard/staff",
        icon: UserCog,
        role: ["Super Admin", "Branch Admin"],
      },
      {
        title: "Staff Login",
        href: "/staff-login",
        icon: LogIn,
        role: ["Super Admin", "Branch Admin"],
      }
    ],
  },
  {
    title: "Branches",
    href: "/dashboard/branches",
    icon: Building,
    role: ["Super Admin"],
    children: [
        {
            title: "Manage Branches",
            href: "/dashboard/branches",
            icon: Building2,
            role: ["Super Admin"],
        },
        {
            title: "Branch Login",
            href: "/branch-login",
            icon: LogIn,
            role: ["Super Admin"],
        }
    ],
  },
  {
    title: "Fee Receipts",
    href: "/dashboard/fee-receipts",
    icon: Receipt,
    role: ["Super Admin"],
  },
  {
    title: "Student Information",
    href: "/dashboard/students",
    icon: GraduationCap,
    role: ["Branch Admin", "Staff"],
    children: [],
  },
    {
    title: "My Students",
    href: "/branch-panel/students",
    icon: GraduationCap,
    role: ["Branch Admin"],
  },
  {
    title: "Communicate",
    href: "/dashboard/communicate",
    icon: MessageSquare,
    role: ["Super Admin", "Branch Admin"],
    children: [
      {
        title: "Notice Board",
        href: "/dashboard/communicate/notice-board",
        icon: ClipboardList,
        role: ["Super Admin", "Branch Admin"],
      }
    ],
  },
  {
    title: "System Settings",
    href: "/dashboard/settings",
    icon: Settings,
    role: ["Super Admin", "Branch Admin"],
    children: [],
  },
  {
    title: "Payment Settings",
    href: "/dashboard/payment-settings",
    icon: CreditCard,
    role: ["Super Admin"],
  },
];


export const branches = [
    { id: 'BR001', name: 'Main Campus', city: 'New York', status: 'Active', students: 1250 },
    { id: 'BR002', name: 'Downtown Branch', city: 'Los Angeles', status: 'Active', students: 850 },
    { id: 'BR003', name: 'Westside Annex', city: 'Chicago', status: 'Inactive', students: 300 },
    { id: 'BR004', name: 'North County', city: 'Houston', status: 'Active', students: 620 },
    { id: 'BR005', name: 'East Bay Center', city: 'San Francisco', status: 'Active', students: 980 },
    { id: 'BR006', name: 'South Point', city: 'Miami', status: 'Inactive', students: 150 },
];

export const recentStudents = [
    { name: 'Olivia Martin', email: 'olivia.martin@email.com', branch: 'Main Campus', amount: 1999.00 },
    { name: 'Jackson Lee', email: 'jackson.lee@email.com', branch: 'Downtown Branch', amount: 39.00 },
    { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', branch: 'Main Campus', amount: 299.00 },
    { name: 'William Kim', email: 'will@email.com', branch: 'North County', amount: 99.00 },
    { name: 'Sofia Davis', email: 'sofia.davis@email.com', branch: 'East Bay Center', amount: 39.00 },
];

export const financeChartData = [
  { month: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Aug", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Dec", total: Math.floor(Math.random() * 5000) + 1000 },
]
