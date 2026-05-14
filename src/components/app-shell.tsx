"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bike,
  Boxes,
  FileText,
  Home,
  LogOut,
  Menu,
  Receipt,
  Settings,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const nav = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: Home },
  { href: "/customers", label: "গ্রাহক", icon: Users },
  { href: "/vehicles", label: "যানবাহন", icon: Bike },
  { href: "/parts", label: "পার্টস/স্টক", icon: Boxes },
  { href: "/job-cards", label: "জব কার্ড", icon: Wrench },
  { href: "/invoices", label: "ইনভয়েস", icon: FileText },
  { href: "/expenses", label: "খরচ", icon: Receipt },
  { href: "/reports", label: "রিপোর্ট", icon: BarChart3 },
  { href: "/settings", label: "সেটিংস", icon: Settings },
];

const bottomNav = nav.slice(0, 5);

function NavList({
  pathname,
  onItemClick,
}: {
  pathname: string;
  onItemClick?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white",
              active && "bg-primary text-white shadow"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="border-b border-white/10 p-5">
          <p className="text-2xl font-bold">ই-হিসেব</p>
          <p className="text-sm text-white/60">ওয়ার্কশপ ম্যানেজমেন্ট</p>
        </div>
        <NavList pathname={pathname} />
        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-semibold">{user?.name ?? "ব্যবহারকারী"}</p>
          <p className="truncate text-xs text-white/55">{user?.email}</p>
          <Button
            className="mt-3 w-full justify-start"
            variant="secondary"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            লগআউট
          </Button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="মেনু">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
                  <div className="border-b border-white/10 p-5">
                    <SheetTitle className="text-xl font-bold text-white">ই-হিসেব</SheetTitle>
                    <SheetDescription className="text-xs text-white/60">
                      ওয়ার্কশপ ম্যানেজমেন্ট মেনু
                    </SheetDescription>
                  </div>
                  <NavList pathname={pathname} onItemClick={() => setMobileOpen(false)} />
                  <div className="border-t border-white/10 p-4">
                    <Button
                      className="w-full justify-start"
                      variant="secondary"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      লগআউট
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="lg:hidden">
                <p className="text-base font-bold leading-tight">ই-হিসেব</p>
                <p className="text-[10px] text-muted-foreground">ওয়ার্কশপ ম্যানেজমেন্ট</p>
              </div>
              <div className="hidden lg:block">
                <p className="font-semibold">বাংলাদেশি ওয়ার্কশপের পূর্ণ হিসাব</p>
                <p className="text-sm text-muted-foreground">
                  গ্রাহক, স্টক, সার্ভিস, বিলিং ও রিপোর্ট
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm transition hover:bg-slate-50"
                  aria-label="ইউজার মেনু"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {(user?.name ?? "?").slice(0, 1)}
                  </div>
                  <span className="hidden text-sm font-semibold sm:inline">
                    {user?.name ?? "ব্যবহারকারী"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/settings")}>
                  <User className="h-4 w-4" />
                  প্রোফাইল ও সেটিংস
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  লগআউট
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="px-4 pb-24 pt-4 lg:px-8 lg:pb-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium text-muted-foreground transition",
                  active && "text-primary"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
