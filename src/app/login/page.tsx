"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/ui/navbar";
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none select-none" />

        <div className="w-full max-w-md z-10">
          {/* Card Wrapper */}
          <div className="glass-card rounded-2xl p-8 border border-zinc-800/80 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex bg-primary/10 border border-primary/20 p-3 rounded-2xl text-primary mb-4">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white font-outfit">Welcome Back</h2>
              <p className="text-zinc-400 text-sm mt-1.5 font-light">
                Sign in to connect with your alumni network
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm mb-6 text-left">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={isSubmitting}
                    className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 font-light"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary hover:text-violet-400 font-semibold hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 font-light"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-violet-700 disabled:bg-zinc-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="mt-6 pt-6 border-t border-zinc-800 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                Quick Testing Credentials
              </span>
              <div className="space-y-1.5 text-xs text-zinc-400 font-light bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <p>
                  🎓 <span className="font-semibold text-zinc-300">Alumni:</span> <code className="text-violet-400">sarah.chen@gmail.com</code>
                </p>
                <p>
                  🛠️ <span className="font-semibold text-zinc-300">Admin:</span> <code className="text-violet-400">admin@alumni.portal</code>
                </p>
                <p className="text-[10px] text-zinc-500 italic mt-1">
                  * Use any password. Alternatively, create a brand new account below!
                </p>
              </div>
            </div>

            {/* Link to Register */}
            <p className="text-zinc-400 text-sm font-light mt-6 text-center">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-violet-400 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
