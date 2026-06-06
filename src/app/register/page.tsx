"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/ui/navbar";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  AtSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ── Inline brand SVG icons — no extra package needed ── */
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();

  /* — Core fields — */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"alumni" | "admin">("alumni");
  const [batch, setBatch] = useState("2024");
  const [branch, setBranch] = useState("Computer Science & Engineering");

  /* — Optional social handles — */
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [showSocial, setShowSocial] = useState(false);

  /* — UI state — */
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ];
  const batches = Array.from({ length: 11 }, (_, i) => String(2016 + i));

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
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

      /* Patch optional social handles immediately after account creation */
      if (role === "alumni" && (instagramUrl || facebookUrl || twitterUrl)) {
        const stored = localStorage.getItem("mock_current_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          const { mockDb } = await import("@/lib/mockDb");
          const updated = mockDb.updateUser(parsed.uid, {
            instagramUrl: instagramUrl.trim() || "",
            facebookUrl: facebookUrl.trim() || "",
            twitterUrl: twitterUrl.trim() || "",
          });
          localStorage.setItem("mock_current_user", JSON.stringify(updated));
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed. Email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Shared input wrapper styles ── */
  const inputCls =
    "w-full glass-input rounded-xl pr-4 py-2.5 text-sm text-white placeholder-zinc-500 font-light";

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[110px] pointer-events-none select-none" />

        <div className="w-full max-w-md z-10">
          <div className="glass-card rounded-2xl p-8 border border-zinc-800/80 shadow-2xl">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex bg-primary/10 border border-primary/20 p-3 rounded-2xl text-primary mb-4">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white font-outfit">Create Account</h2>
              <p className="text-zinc-400 text-sm mt-1.5 font-light">
                Join the alumni portal — reconnect with your batch
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                    className={`${inputCls} pl-11`}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={isSubmitting}
                    className={`${inputCls} pl-11`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    disabled={isSubmitting}
                    className={`${inputCls} pl-11`}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {/* Role toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Portal Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="role-alumni"
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
                    id="role-admin"
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

              {/* Alumni-only expanded section */}
              {role === "alumni" && (
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden animate-in slide-in-from-top-3 duration-200">

                  {/* Batch + Branch */}
                  <div className="p-4 space-y-3">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Academic Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="reg-batch" className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                          Graduation Batch
                        </label>
                        <select
                          id="reg-batch"
                          value={batch}
                          onChange={(e) => setBatch(e.target.value)}
                          className="w-full glass-input rounded-lg px-3 py-2 text-xs text-white"
                        >
                          {batches.map((y) => (
                            <option key={y} value={y} className="bg-zinc-950 text-white">
                              Batch {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label htmlFor="reg-branch" className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                          Academic Branch
                        </label>
                        <select
                          id="reg-branch"
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

                  {/* Social handles accordion */}
                  <div className="border-t border-zinc-800">
                    <button
                      type="button"
                      id="toggle-social"
                      onClick={() => setShowSocial((v) => !v)}
                      className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-zinc-800/30 transition-colors"
                    >
                      <div>
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                          Social Handles
                          <span className="text-[9px] font-semibold text-violet-400 border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                            Optional
                          </span>
                        </p>
                        <p className="text-[10px] text-zinc-600 font-light mt-0.5 normal-case tracking-normal">
                          Let batchmates find you — no phone numbers needed
                        </p>
                      </div>
                      {showSocial
                        ? <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />}
                    </button>

                    {showSocial && (
                      <div className="px-4 pb-4 pt-1 space-y-3 animate-in slide-in-from-top-2 duration-200">

                        {/* Instagram */}
                        <div className="space-y-1">
                          <label htmlFor="reg-instagram" className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-pink-500"><InstagramIcon /></span>
                            Instagram
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
                              <AtSign className="h-3.5 w-3.5" />
                            </div>
                            <input
                              id="reg-instagram"
                              type="text"
                              value={instagramUrl}
                              onChange={(e) => setInstagramUrl(e.target.value)}
                              placeholder="username or https://instagram.com/you"
                              className="w-full glass-input rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 font-light"
                            />
                          </div>
                        </div>

                        {/* Facebook */}
                        <div className="space-y-1">
                          <label htmlFor="reg-facebook" className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-blue-500"><FacebookIcon /></span>
                            Facebook
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
                              <AtSign className="h-3.5 w-3.5" />
                            </div>
                            <input
                              id="reg-facebook"
                              type="text"
                              value={facebookUrl}
                              onChange={(e) => setFacebookUrl(e.target.value)}
                              placeholder="username or https://facebook.com/you"
                              className="w-full glass-input rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 font-light"
                            />
                          </div>
                        </div>

                        {/* X / Twitter */}
                        <div className="space-y-1">
                          <label htmlFor="reg-twitter" className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-zinc-200"><XIcon /></span>
                            X / Twitter
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
                              <AtSign className="h-3.5 w-3.5" />
                            </div>
                            <input
                              id="reg-twitter"
                              type="text"
                              value={twitterUrl}
                              onChange={(e) => setTwitterUrl(e.target.value)}
                              placeholder="@handle or https://x.com/you"
                              className="w-full glass-input rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 font-light"
                            />
                          </div>
                        </div>

                        <p className="text-[9px] text-zinc-600 font-light leading-relaxed pt-1">
                          🔒 Visible only to verified alumni on the directory. Update or remove anytime from your profile.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                id="reg-submit"
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
