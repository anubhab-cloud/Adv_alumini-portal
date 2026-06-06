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
  Camera
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, role } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Alumni Directory", href: "/dashboard/directory", icon: Users },
    { label: "Event Hub", href: "/dashboard/events", icon: Calendar },
    { label: "Photo Gallery", href: "/dashboard/gallery", icon: Camera },
    { label: "Job Board", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Contributions", href: "/dashboard/contributions", icon: HeartHandshake },
    { label: "Memory Wall", href: "/dashboard/memories", icon: ImageIcon },
  ];

  const adminItem = { label: "Admin Control", href: "/dashboard/admin", icon: ShieldAlert };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col glass-panel border-r border-zinc-800 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } md:sticky`}
    >
      {/* Header / Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="bg-primary p-1.5 rounded-lg text-white shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          {isOpen && (
            <span className="font-bold text-white tracking-tight text-sm font-outfit whitespace-nowrap animate-in fade-in duration-200">
              Alumni<span className="text-gradient">Portal</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-violet-500/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
              {isOpen && <span className="animate-in fade-in duration-200">{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin Section (Strict Role Check) */}
        {role === "admin" && (
          <div className="pt-4 mt-4 border-t border-zinc-800">
            {isOpen && (
              <span className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                Administrator
              </span>
            )}
            <Link
              href={adminItem.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                pathname === adminItem.href
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/10"
                  : "text-rose-400 hover:text-white hover:bg-rose-950/20 hover:border-rose-900/30 border border-transparent"
              }`}
            >
              <adminItem.icon className="h-5 w-5 shrink-0" />
              {isOpen && <span className="animate-in fade-in duration-200">{adminItem.label}</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* User Section / Bottom */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
        <div className="flex items-center gap-3">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover border border-zinc-700 shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700 shrink-0">
              <User className="h-5 w-5" />
            </div>
          )}
          
          {isOpen && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-200">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {user?.name || "Guest Alumni"}
              </p>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 uppercase ${
                role === "admin" 
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                  : "bg-primary/20 text-violet-300 border border-primary/30"
              }`}>
                {role || "Alumni"}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full mt-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors border border-transparent ${
            isOpen ? "justify-start" : "justify-center"
          }`}
          title="Sign Out"
        >
          <LogOut className="h-5 w-5 text-zinc-400 group-hover:text-white" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
