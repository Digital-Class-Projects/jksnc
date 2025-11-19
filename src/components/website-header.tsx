
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import Logo from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/educators", label: "Educators" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/verification", label: "Verification" },
];

export function WebsiteHeader() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Logo />
            <span className="font-bold text-xl text-secondary">Etrain</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "px-4 py-2 rounded-md text-foreground/80 transition-colors hover:text-primary hover:bg-primary/5",
                    pathname === link.href && "text-primary font-semibold"
                )}
              >
                {link.label}
              </Link>
            ))}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-4 py-2 rounded-md text-foreground/80 transition-colors hover:text-primary hover:bg-primary/5">
                    Login <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild><Link href="/login">Super Admin</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/branch-login">Branch Admin</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/staff-login">Staff</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/student-login">Student</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          <div className="flex items-center gap-4">
             <Button asChild className="hidden md:inline-flex rounded-full gradient-button">
                <Link href="#">Get A Quote</Link>
            </Button>

            {/* Mobile Navigation Trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>
                       <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary" onClick={() => setOpen(false)}>
                        <Logo />
                        <span className="font-bold text-xl text-secondary">Etrain</span>
                      </Link>
                    </SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                  <nav className="grid gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary p-2 rounded-md"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <h3 className="mt-4 font-semibold text-primary">Logins</h3>
                    <Link href="/login" className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary p-2 rounded-md" onClick={() => setOpen(false)}>Super Admin</Link>
                    <Link href="/branch-login" className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary p-2 rounded-md" onClick={() => setOpen(false)}>Branch Admin</Link>
                    <Link href="/staff-login" className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary p-2 rounded-md" onClick={() => setOpen(false)}>Staff</Link>
                    <Link href="/student-login" className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary p-2 rounded-md" onClick={() => setOpen(false)}>Student</Link>
                  </nav>
                   <Button className="mt-8 w-full gradient-button rounded-full" size="lg">
                        Get A Quote
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
