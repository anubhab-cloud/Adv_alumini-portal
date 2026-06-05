"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, GraduationCap, LayoutDashboard, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Gallery Preview", href: "/#gallery" },
    { label: "Upcoming Events", href: "/#events" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-2 rounded-lg text-white group-hover:scale-110 transition-transform duration-200">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold font-outfit tracking-tight text-white group-hover:text-primary transition-colors">
                Alumni<span className="text-gradient">Portal</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-zinc-300 hover:text-white hover:underline decoration-primary decoration-2 underline-offset-4 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {mounted && user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 bg-primary hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-violet-500/20 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Link>
            ) : (
              mounted ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-zinc-300 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Link>
                </>
              ) : (
                <div className="h-9 w-20" /> // Placeholder to prevent shifting
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-zinc-800 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-zinc-300 hover:text-white hover:bg-zinc-800 px-3 py-2 rounded-md text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-zinc-800 px-3 flex flex-col gap-3">
              {mounted && user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                mounted ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 text-zinc-300 hover:text-white px-3 py-2.5 rounded-lg text-sm font-semibold border border-zinc-800 bg-zinc-900"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 bg-primary hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
                    >
                      <UserPlus className="h-4 w-4" />
                      Register
                    </Link>
                  </>
                ) : (
                  <div className="h-20" />
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
