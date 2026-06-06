"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  Home,
  Users,
  Calendar,
  Image as ImageIcon,
  ShieldAlert,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  HeartHandshake,
  Camera,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /** Called when a nav link is tapped — used by mobile drawer to close itself */
  onNavClick?: () => void;
}

export default function Sidebar({ isOpen, setIsOpen, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, role } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard",       href: "/dashboard",               icon: Home },
    { label: "Alumni Directory", href: "/dashboard/directory",    icon: Users },
    { label: "Event Hub",       href: "/dashboard/events",        icon: Calendar },
    { label: "Photo Gallery",   href: "/dashboard/gallery",       icon: Camera },
    { label: "Job Board",       href: "/dashboard/jobs",          icon: Briefcase },
    { label: "Contributions",   href: "/dashboard/contributions", icon: HeartHandshake },
    { label: "Memory Wall",     href: "/dashboard/memories",      icon: ImageIcon },
  ];

  const adminItem = { label: "Admin Control", href: "/dashboard/admin", icon: ShieldAlert };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col glass-panel border-r border-zinc-800 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } md:sticky`}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800 shrink-0">
        <Link href="/" className="flex items-center gap-2 overflow-hidden min-w-0">
          <div className="bg-primary p-1.5 rounded-lg text-white shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          {isOpen && (
            <span className="font-bold text-white tracking-tight text-sm font-outfit whitespace-nowrap animate-in fade-in duration-200">
              Alumni<span className="text-gradient">Portal</span>
            </span>
          )}
        </Link>
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-smooth-touch" aria-label="Sidebar navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group touch-target ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-blue-500/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/80 active:bg-zinc-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 transition-transform ${
                  isActive ? "" : "group-hover:scale-110"
                }`}
              />
              {isOpen && (
                <span className="animate-in fade-in duration-200 truncate">{item.label}</span>
              )}
            </Link>
          );
        })}

        {/* Admin section */}
        {role === "admin" && (
          <div className="pt-4 mt-2 border-t border-zinc-800">
            {isOpen && (
              <span className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                Administrator
              </span>
            )}
            <Link
              href={adminItem.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group touch-target ${
                pathname === adminItem.href
                  ? "bg-amber-600/90 text-white shadow-lg shadow-amber-600/10"
                  : "text-amber-400 hover:text-white hover:bg-amber-950/20 active:bg-amber-950/30 border border-transparent hover:border-amber-900/30"
              }`}
              aria-current={pathname === adminItem.href ? "page" : undefined}
            >
              <adminItem.icon className="h-5 w-5 shrink-0" />
              {isOpen && (
                <span className="animate-in fade-in duration-200">{adminItem.label}</span>
              )}
            </Link>
          </div>
        )}
      </nav>

      {/* User section — bottom */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-zinc-700 shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700 shrink-0 text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
            </div>
          )}

          {isOpen && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-200">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {user?.name ?? "Guest Alumni"}
              </p>
              <span
                className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 uppercase ${
                  role === "admin"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-primary/20 text-blue-300 border border-primary/30"
                }`}
              >
                {role ?? "Alumni"}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 active:bg-zinc-800 transition-colors touch-target ${
            isOpen ? "justify-start" : "justify-center"
          }`}
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
