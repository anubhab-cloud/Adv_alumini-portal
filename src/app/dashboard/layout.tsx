"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Loader2,
  Menu,
  GraduationCap,
  X,
  ShieldAlert,
  RefreshCw,
  LogOut,
  Home,
  Users,
  Calendar,
  Camera,
  Briefcase,
  HeartHandshake,
  Image as ImageIcon,
} from "lucide-react";

/* ── Bottom nav items shown on mobile ── */
const bottomNavItems = [
  { label: "Home",          href: "/dashboard",               icon: Home },
  { label: "Directory",     href: "/dashboard/directory",     icon: Users },
  { label: "Events",        href: "/dashboard/events",        icon: Calendar },
  { label: "Gallery",       href: "/dashboard/gallery",       icon: Camera },
  { label: "Jobs",          href: "/dashboard/jobs",          icon: Briefcase },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, refreshUser, role } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);

  /* Close mobile drawer on route change */
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  /* Auth guard */
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  /* ── Loading screen ── */
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-violet-600/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="flex items-center gap-2 mb-2 z-10 animate-pulse">
          <div className="bg-primary p-2 rounded-xl text-white">
            <GraduationCap className="h-8 w-8" />
          </div>
          <span className="text-2xl font-bold font-outfit text-white">
            Alumni<span className="text-gradient">Portal</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-light z-10">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Securing session state...
        </div>
      </div>
    );
  }

  /* ── Quarantine screen ── */
  if (user && !user.isActive) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-outfit">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-md w-full bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md animate-pulse" />
            <div className="relative bg-zinc-900 border border-zinc-800 p-4 rounded-full text-amber-500">
              <ShieldAlert className="h-10 w-10 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">Verification Pending</h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed mb-6">
            Your registration is under review. Once approved you will get full access.
          </p>
          <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 mb-8 text-left space-y-3">
            {[
              { label: "Name",           value: user.name },
              { label: "Email",          value: user.email, mono: true },
              { label: "Requested Role", value: user.role },
              { label: "Status",         value: "Quarantined", badge: true },
            ].map(({ label, value, mono, badge }) => (
              <div key={label} className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">{label}</span>
                {badge ? (
                  <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium">{value}</span>
                ) : (
                  <span className={`text-zinc-300 font-medium capitalize ${mono ? "font-mono" : ""} truncate max-w-[180px]`}>{value}</span>
                )}
              </div>
            ))}
          </div>
          <div className="w-full space-y-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium py-3 px-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/10 touch-target"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Checking status..." : "Refresh Status"}
            </button>
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 py-3 px-4 rounded-xl transition-all touch-target"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
        <div className="mt-8 text-zinc-600 text-xs font-light tracking-wide z-10 flex items-center gap-1">
          <GraduationCap className="h-4 w-4" />
          <span>Advanced Alumni Portal</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-zinc-950 flex flex-col md:flex-row relative dashboard-theme dashboard-theme-root" style={{ height: '100dvh' }}>

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <div className="hidden md:block shrink-0" style={{ width: sidebarExpanded ? 260 : 72, transition: "width 0.3s cubic-bezier(.4,0,.2,1)" }}>
        <Sidebar isOpen={sidebarExpanded} setIsOpen={setSidebarExpanded} onNavClick={() => {}} />
      </div>

      {/* ── Mobile Drawer Backdrop ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-zinc-950/70 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Sidebar Drawer ───────────────────────────────── */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 md:hidden transition-transform duration-300 ease-in-out bg-zinc-950 border-r border-zinc-800 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800 safe-top">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-bold text-white text-sm font-outfit">
              Alumni<span className="text-gradient">Portal</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 touch-target"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable nav content */}
        <div className="h-[calc(100dvh-64px)] overflow-y-auto scroll-smooth-touch">
          <Sidebar isOpen={true} setIsOpen={() => {}} onNavClick={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* ── Main Content Area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Mobile top header */}
        <header className="flex items-center justify-between h-14 px-3 border-b border-zinc-900 md:hidden bg-zinc-950/90 backdrop-blur-md shrink-0 z-20 safe-top">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors touch-target"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-1.5">
            <div className="bg-primary p-1 rounded-md text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold text-white tracking-tight text-sm font-outfit">
              Alumni<span className="text-gradient">Portal</span>
            </span>
          </Link>

          {/* Profile avatar — right side */}
          <Link href="/dashboard/profile" className="flex items-center">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover border border-zinc-700 hover:border-blue-400 transition-colors"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold hover:border-blue-400 transition-colors">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
            )}
          </Link>
        </header>

        {/* Page content */}
        <main
          className="flex-1 min-h-0 px-3 py-4 md:px-8 md:py-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full"
          style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ───────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 bottom-nav-safe"
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around px-1 pt-2">
          {bottomNavItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] touch-target ${
                  isActive
                    ? "text-blue-400"
                    : "text-zinc-500 active:text-zinc-200"
                }`}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <div className={`p-1 rounded-lg transition-all ${isActive ? "bg-blue-500/15" : ""}`}>
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                </div>
                <span className={`text-[9px] font-semibold tracking-wide ${isActive ? "text-blue-400" : "text-zinc-600"}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Admin shortcut — only for admins */}
          {role === "admin" && (
            <Link
              href="/dashboard/admin"
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] touch-target ${
                pathname === "/dashboard/admin" ? "text-amber-400" : "text-zinc-500 active:text-zinc-200"
              }`}
              aria-label="Admin"
            >
              <div className={`p-1 rounded-lg transition-all ${pathname === "/dashboard/admin" ? "bg-amber-500/15" : ""}`}>
                <ShieldAlert className={`h-5 w-5 ${pathname === "/dashboard/admin" ? "scale-110" : ""}`} />
              </div>
              <span className={`text-[9px] font-semibold tracking-wide ${pathname === "/dashboard/admin" ? "text-amber-400" : "text-zinc-600"}`}>
                Admin
              </span>
            </Link>
          )}

          {/* More — opens full sidebar drawer */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-zinc-500 active:text-zinc-200 transition-all min-w-[52px] touch-target"
            aria-label="More options"
          >
            <div className="p-1 rounded-lg">
              <Menu className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-semibold tracking-wide text-zinc-600">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
