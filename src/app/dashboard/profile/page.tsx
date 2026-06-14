"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { MockUser } from "@/lib/mockDb";
import {
  Save,
  AtSign,
  Linkedin,
  Github,
  Mail,
  Briefcase,
  GraduationCap,
  Sparkles,
  Link2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

/* ── Inline brand SVG icons for the preview card ── */
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const AVATAR_PRESETS = [
  {
    name: "Tech Portrait (Sarah)",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Executive (Marcus)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Consultant (Priya)",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Developer (Admin)",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Initial Avatar 1",
    url: "https://api.dicebear.com/7.x/initials/svg?seed=Alumni%20User"
  },
  {
    name: "Abstract Art",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=retro"
  }
];

const branches = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Information Technology",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];

const batches = Array.from({ length: 11 }, (_, i) => String(2016 + i));

function toUrl(raw: string, base: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  return `${base}${handle}`;
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  
  /* Form state initialized with user data */
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("2026");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [photoUrl, setPhotoUrl] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync state with user context on load
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBatch(user.batch || "2026");
      setBranch(user.branch || "Computer Science & Engineering");
      setPhotoUrl(user.photoUrl || "");
      setCompany(user.company || "");
      setTitle(user.title || "");
      setBio(user.bio || "");
      setSkills(user.skills?.join(", ") || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setGithubUrl(user.githubUrl || "");
      setInstagramUrl(user.instagramUrl || "");
      setFacebookUrl(user.facebookUrl || "");
      setTwitterUrl(user.twitterUrl || "");
    }
  }, [user]);

  const handlePresetSelect = (url: string) => {
    // Dynamic Dicebear support based on current name
    let finalUrl = url;
    if (url.includes("Dicebear")) {
      finalUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Alumni")}`;
    }
    setPhotoUrl(finalUrl);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: "error", text: "Full Name is required." });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateProfile({
        name,
        batch,
        branch,
        photoUrl,
        company,
        title,
        bio,
        skills: skillsArray,
        linkedinUrl,
        githubUrl,
        instagramUrl,
        facebookUrl,
        twitterUrl,
      });

      setStatusMessage({ type: "success", text: "Profile updated successfully! Your changes are now live." });
      // Scroll to top of status message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to save profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  /* Preview calculations */
  const previewSkills = skills.split(",").map(s => s.trim()).filter(Boolean);
  const previewIgUrl = toUrl(instagramUrl, "https://instagram.com/");
  const previewFbUrl = toUrl(facebookUrl, "https://facebook.com/");
  const previewXUrl = toUrl(twitterUrl, "https://x.com/");
  const previewHasSocial = !!(previewIgUrl || previewFbUrl || previewXUrl || linkedinUrl || githubUrl);

  const inputCls = "w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 font-light focus:border-blue-500 bg-zinc-900/40";
  const labelCls = "text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-1.5";

  return (
    <div className="space-y-8 text-left fade-up">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-white leading-tight">
          My Account Profile
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Manage your personal details, professional profile, and social links visible to the alumni network.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Form Fields (8 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-4 rounded-xl flex items-center gap-3 border ${
              statusMessage.type === "success" 
                ? "bg-green-500/10 border-green-500/20 text-green-300" 
                : "bg-red-500/10 border-red-500/20 text-red-300"
            }`}>
              {statusMessage.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0 text-green-400" /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />}
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* Card 1: Avatar Editor */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800/80">
            <h2 className="text-base font-bold text-white font-outfit mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-violet-400" />
              Profile Avatar
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* Profile Photo Display */}
              <div className="relative shrink-0 group">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name || "Alumni"}
                    className="h-24 w-24 rounded-full object-cover border-2 border-zinc-800 bg-zinc-900 shadow-xl"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-zinc-500 shadow-xl">
                    <GraduationCap className="h-10 w-10 animate-pulse-subtle" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-default">
                  <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">Avatar</span>
                </div>
              </div>

              {/* Avatar Fields */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label htmlFor="photo-url" className={labelCls}>Avatar Image URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <input
                      id="photo-url"
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                {/* Preset Picker */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                    Quick Preset Avatars
                  </span>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => {
                      // Adjust seed based on current name for dicebear initials
                      const url = preset.name.includes("Initial") 
                        ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Alumni User")}`
                        : preset.url;
                      
                      const isSelected = photoUrl === url;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePresetSelect(url)}
                          title={preset.name}
                          className={`h-11 w-full rounded-xl overflow-hidden border bg-zinc-900 transition-all hover:scale-105 ${
                            isSelected ? "border-violet-500 ring-2 ring-violet-500/20" : "border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <img src={url} alt={preset.name} className="h-full w-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Account Details */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800/80 space-y-4">
            <h2 className="text-base font-bold text-white font-outfit mb-2 flex items-center gap-2">
              <GraduationCap className="h-4.5 w-4.5 text-violet-400" />
              Academic & Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="full-name" className={labelCls}>Full Name</label>
                <input
                  id="full-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Chen"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label htmlFor="user-email" className={labelCls}>Email Address (Read-only)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="user-email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className={`${inputCls} pl-10 cursor-not-allowed opacity-60 bg-zinc-950/40`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="grad-batch" className={labelCls}>Graduation Batch (Year)</label>
                <select
                  id="grad-batch"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light bg-zinc-900 border border-zinc-800"
                >
                  {batches.map((yr) => (
                    <option key={yr} value={yr} className="bg-zinc-950">
                      Batch {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="academic-branch" className={labelCls}>Engineering Branch</label>
                <select
                  id="academic-branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light bg-zinc-900 border border-zinc-800"
                >
                  {branches.map((b) => (
                    <option key={b} value={b} className="bg-zinc-950">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Professional Info */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800/80 space-y-4">
            <h2 className="text-base font-bold text-white font-outfit mb-2 flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-violet-400" />
              Professional Experience
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="job-title" className={labelCls}>Job Title</label>
                <input
                  id="job-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Senior Software Engineer"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="current-company" className={labelCls}>Company</label>
                <input
                  id="current-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="professional-bio" className={labelCls}>Short Bio</label>
                <textarea
                  id="professional-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share a short summary about your background, interests, and how you want to connect..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="skills-tags" className={labelCls}>Skills / Core Technologies (Comma Separated)</label>
                <input
                  id="skills-tags"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Next.js, Go, Kubernetes, TypeScript"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Social Handles */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800/80 space-y-4">
            <h2 className="text-base font-bold text-white font-outfit mb-2 flex items-center gap-2">
              <AtSign className="h-4.5 w-4.5 text-violet-400" />
              Social Handles & Links
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="linkedin-link" className={labelCls}>LinkedIn URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Linkedin className="h-4 w-4" />
                  </div>
                  <input
                    id="linkedin-link"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="github-link" className={labelCls}>GitHub URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Github className="h-4 w-4" />
                  </div>
                  <input
                    id="github-link"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="instagram-link" className={labelCls}>Instagram (@username or URL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <span className="text-xs font-bold font-mono">IG</span>
                  </div>
                  <input
                    id="instagram-link"
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="username or full URL"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="facebook-link" className={labelCls}>Facebook (@username or URL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <span className="text-xs font-bold font-mono">FB</span>
                  </div>
                  <input
                    id="facebook-link"
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="username or full URL"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="twitter-link" className={labelCls}>X / Twitter (@username or URL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <span className="text-xs font-bold font-mono">X</span>
                  </div>
                  <input
                    id="twitter-link"
                    type="text"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="username or full URL"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform active:scale-98 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-zinc-400" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile Details
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-sm font-semibold"
            >
              Cancel
            </Link>
          </div>

        </form>

        {/* Right: Live Preview (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold-soft animate-float" />
              Live Directory Card
            </span>
            <span className="text-[9px] font-bold bg-violet-600/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              Sync Active
            </span>
          </div>

          {/* Directory Card Preview */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-800/80 flex flex-col justify-between hover:border-violet-500/30 transition-all shadow-xl bg-zinc-950/40 relative">
            <div>
              <div className="flex gap-4 items-start">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name || "Alumni"}
                    className="h-14 w-14 rounded-full object-cover border border-zinc-850 shrink-0 bg-zinc-900"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate font-outfit leading-snug">
                    {name || "Alumni Name"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-0.5 font-light">
                    <GraduationCap className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">
                      Batch {batch} • {branch ? branch.split(" ")[0] : "Engineering"}
                    </span>
                  </div>
                  {company || title ? (
                    <div className="flex items-center gap-1.5 text-violet-400 text-xs mt-1 font-semibold">
                      <Briefcase className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {title || "Position"} {company ? `at ${company}` : ""}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-block text-[9px] font-bold text-zinc-500 border border-zinc-800 bg-zinc-900/40 px-2 py-0.5 rounded-md mt-1 uppercase tracking-wider">
                      Exploring Opportunities
                    </span>
                  )}
                </div>
              </div>

              {/* Bio Preview */}
              {bio ? (
                <p className="text-zinc-400 text-xs font-light mt-4 leading-relaxed break-words whitespace-pre-wrap">
                  {bio}
                </p>
              ) : (
                <p className="text-zinc-600 text-xs font-light mt-4 italic">
                  No bio description provided yet.
                </p>
              )}

              {/* Skills Tags Preview */}
              {previewSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {previewSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-[9px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-600 font-light mt-3 italic">
                  No skills tags listed.
                </p>
              )}
            </div>

            {/* Bottom connect bar */}
            <div className="pt-4 mt-6 border-t border-zinc-900">
              {previewHasSocial ? (
                <div className="flex items-center justify-between">
                  {/* Email */}
                  <a
                    href={`mailto:${user?.email || "alumni@example.com"}`}
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                    title="Send email (mocked)"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-light">Email</span>
                  </a>

                  {/* Social icon cluster */}
                  <div className="flex items-center gap-1.5">
                    {linkedinUrl && (
                      <span className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg">
                        <Linkedin className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {githubUrl && (
                      <span className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg">
                        <Github className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {previewIgUrl && (
                      <span className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg">
                        <InstagramIcon />
                      </span>
                    )}
                    {previewFbUrl && (
                      <span className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg">
                        <FacebookIcon />
                      </span>
                    )}
                    {previewXUrl && (
                      <span className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg">
                        <XIcon />
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <a
                    href={`mailto:${user?.email || "alumni@example.com"}`}
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-light">Email</span>
                  </a>
                  <span className="text-[9px] text-zinc-700 italic">No social links shared</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info note */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 text-xs text-zinc-500 leading-relaxed font-light">
            💡 <span className="font-semibold text-zinc-400">Pro-tip:</span> Changes you save here are instantly updated in the Alumni Directory. Search for your profile in the directory to verify the live updates!
          </div>

        </div>

      </div>
    </div>
  );
}
