"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "../components/Logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/orders", label: "Orders", icon: "list" },
  { href: "/admin/queue", label: "Order Queue", icon: "queue" },
  { href: "/admin/packages", label: "Packages", icon: "box" },
  { href: "/admin/products", label: "Products", icon: "tag" },
  { href: "/admin/settings", label: "Settings", icon: "gear" },
];

function Icon({ name, className }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    queue: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
    box: <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
    tag: <><path d="M20.59 13.41L11 3.83A2 2 0 009.59 3.2L4 3a1 1 0 00-1 1l.2 5.59a2 2 0 00.62 1.41l9.59 9.59a2 2 0 002.82 0l4.36-4.36a2 2 0 000-2.82z" /><circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" /></>,
    gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") return children;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-paper2/40 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-line px-4 py-6">
        <p className="font-display text-lg font-semibold text-ink px-2 mb-8 flex items-center gap-2">
          <LogoMark className="w-6 h-6" />
          Treatsbox <span className="text-ink2 font-body text-xs font-normal">Admin</span>
        </p>
        <nav className="space-y-1 flex-1">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-oxblood text-white" : "text-ink2 hover:bg-paper2"
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-ink2 hover:bg-paper2 transition-colors"
        >
          Sign Out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-line flex items-center justify-between px-4 h-14">
        <p className="font-display font-semibold text-ink flex items-center gap-1.5">
          <LogoMark className="w-5 h-5" />
          Treatsbox Admin
        </p>
        <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2 text-ink2" aria-label="Open menu">
          <Icon name="list" className="w-5 h-5" />
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white h-full p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <p className="font-display font-semibold text-ink">Menu</p>
              <button onClick={() => setMobileOpen(false)} className="text-2xl leading-none text-ink2">×</button>
            </div>
            <nav className="space-y-1 flex-1">
              {NAV.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      active ? "bg-oxblood text-white" : "text-ink2"
                    }`}
                  >
                    <Icon name={item.icon} className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button onClick={handleLogout} className="text-sm font-medium text-ink2 px-3 py-2.5 text-left">
              Sign Out
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
