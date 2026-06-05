"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/ui/navbar";
import { GraduationCap, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"alumni" | "admin">("alumni");
  const [batch, setBatch] = useState("2024");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering"
  ];

  const batches = Array.from({ length: 11 }, (_, i) => String(2016 + i));

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all basic fields.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register(
        name,
        email,
        password,
        role,
        role === "alumni" ? batch : undefined,
        role === "alumni" ? branch : undefined
      );
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed. Email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[110px] pointer-events-none select-none" />

        <div className="w-full max-w-md z-10">
          {/* Card Wrapper */}
          <div className="glass-card rounded-2xl p-8 border border-zinc-800/80 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex bg-primary/10 border border-primary/20 p-3 rounded-2xl text-primary mb-4">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white font-outfit">Create Account</h2>
              <p className="text-zinc-400 text-sm mt-1.5 font-light">
                Join the alumni portal and share college moments
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                    className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 font-light"
                    required
                  />
                </div>
              </div>

              {/* Email */}
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
                    className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 font-light"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    disabled={isSubmitting}
                    className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 font-light"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {/* Role Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Portal Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("alumni")}
                    className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                      role === "alumni"
                        ? "bg-primary/10 border-primary text-violet-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Alumni
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                      role === "admin"
                        ? "bg-rose-500/10 border-rose-500 text-rose-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Alumni Details Conditional Fields */}
              {role === "alumni" && (
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4 animate-in slide-in-from-top-3 duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Batch Year */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Graduation Batch
                      </label>
                      <select
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white"
                      >
                        {batches.map((year) => (
                          <option key={year} value={year} className="bg-zinc-950 text-white">
                            Batch {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch */}
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Academic Branch
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white"
                      >
                        {branches.map((b) => (
                          <option key={b} value={b} className="bg-zinc-950 text-white">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-violet-700 disabled:bg-zinc-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group mt-4"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Link to Login */}
            <p className="text-zinc-400 text-sm font-light mt-6 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-violet-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
