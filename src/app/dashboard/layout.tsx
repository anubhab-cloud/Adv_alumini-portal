"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/ui/sidebar";
import { Loader2, Menu, GraduationCap, X, ShieldAlert, RefreshCw, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auth Protection Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  // Loading Screen
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-violet-600/5 rounded-full blur-[90px] pointer-events-none select-none" />
        
        <div className="flex items-center gap-2 mb-2 z-10 animate-pulse">
          <div className="bg-primary p-2 rounded-xl text-white">
            <GraduationCap className="h-8 w-8" />
          </div>
          <span className="text-2xl font-bold font-outfit text-white">
            Alumni<span className="text-gradient">Portal</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-light z-10">
          <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
          Securing session state...
        </div>
      </div>
    );
  }

  // Quarantine Screen
  if (user && !user.isActive) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-outfit">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none select-none" />
        
        <div className="max-w-md w-full bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center text-center">
          {/* Pulsing Alert Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md animate-pulse" />
            <div className="relative bg-zinc-900 border border-zinc-800 p-4 rounded-full text-amber-500">
              <ShieldAlert className="h-10 w-10 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Verification Pending
          </h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed mb-6">
            Your registration is currently under review by our administrative team. Once approved, you will get access to the alumni portal features.
          </p>

          {/* User Details Card */}
          <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 mb-8 text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Name</span>
              <span className="text-zinc-300 font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Email</span>
              <span className="text-zinc-300 font-mono">{user.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Requested Role</span>
              <span className="text-amber-500 font-medium capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Status</span>
              <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium">Quarantined</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium py-3 px-4 rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Checking status...' : 'Refresh Status'}
            </button>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 py-3 px-4 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Small branding footer */}
        <div className="mt-8 text-zinc-600 text-xs font-light tracking-wide z-10 flex items-center gap-1">
          <GraduationCap className="h-4 w-4" />
          <span>Advanced Alumni Portal</span>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-violet-600/5 rounded-full blur-[90px] pointer-events-none select-none" />
        
        <div className="flex items-center gap-2 mb-2 z-10 animate-pulse">
          <div className="bg-primary p-2 rounded-xl text-white">
            <GraduationCap className="h-8 w-8" />
          </div>
          <span className="text-2xl font-bold font-outfit text-white">
            Alumni<span className="text-gradient">Portal</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-light z-10">
          <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
          Securing session state...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row relative dashboard-theme dashboard-theme-root">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block shrink-0">
        <Sidebar isOpen={sidebarExpanded} setIsOpen={setSidebarExpanded} />
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-zinc-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Sidebar Slide Drawer */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 md:hidden transition-transform duration-300 transform bg-zinc-950 border-r border-zinc-800 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800 bg-zinc-950">
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
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          {/* We render sidebar inner menu */}
          <Sidebar isOpen={true} setIsOpen={() => {}} />
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {/* Mobile Header Toolbar */}
        <header className="flex items-center justify-between h-16 px-4 border-b border-zinc-900 md:hidden bg-zinc-950 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-1">
            <span className="font-bold text-white tracking-tight text-sm font-outfit">
              Alumni<span className="text-gradient">Portal</span>
            </span>
          </div>

          <div className="w-10 h-10" /> {/* Spacer to center title */}
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
