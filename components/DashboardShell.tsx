"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export type NavItem = { href: string; label: string; icon: ReactNode };

export function DashboardShell({
  navItems,
  userName,
  roleLabel,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  roleLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
        <SidebarContent
          navItems={navItems}
          pathname={pathname}
          userName={userName}
          roleLabel={roleLabel}
        />
      </aside>

      <div className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-3 lg:hidden">
        <Brand />
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-50"
          aria-label="เปิดเมนู"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-ink-500 hover:bg-ink-50"
                aria-label="ปิดเมนู"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              navItems={navItems}
              pathname={pathname}
              userName={userName}
              roleLabel={roleLabel}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <main className="flex-1 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl animate-[fade-up_0.35s_ease-out]">
          {children}
        </div>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <Image
        src="/logo.svg"
        alt="Digital Exam Centre"
        width={132}
        height={109}
        className="h-8 w-auto shrink-0"
      />
    </Link>
  );
}

function SidebarContent({
  navItems,
  pathname,
  userName,
  roleLabel,
  onNavigate,
}: {
  navItems: NavItem[];
  pathname: string;
  userName: string;
  roleLabel: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="hidden px-5 py-5 lg:block">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink-100 px-4 py-4">
        <p className="truncate text-sm font-medium text-ink-900">{userName}</p>
        <p className="mb-3 text-xs text-ink-400">{roleLabel}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-xs font-medium text-ink-500 transition-colors hover:border-red-200 hover:text-red-600"
        >
          <LogOut className="h-3.5 w-3.5" />
          ออกจากระบบ
        </button>
      </div>
    </>
  );
}
