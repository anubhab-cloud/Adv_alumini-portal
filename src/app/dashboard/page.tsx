"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockEvent } from "@/lib/mockDb";
import { 
  Calendar, 
  Users, 
  ImageIcon, 
  Edit3, 
  CheckCircle, 
  ExternalLink,
  MapPin,
  Clock,
  Save,
  Plus,
  AtSign
} from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const { user, updateProfile } = useAuth();
  const [nextEvent, setNextEvent] = useState<MockEvent | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile form state
  const [company, setCompany] = useState(user?.company || "");
  const [title, setTitle] = useState(user?.title || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(user?.instagramUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(user?.facebookUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(user?.twitterUrl || "");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Load next upcoming event
  useEffect(() => {
    const events = mockDb.getEvents();
    const futureEvents = events
      .filter(e => new Date(e.date).getTime() > Date.now())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (futureEvents.length > 0) {
      setNextEvent(futureEvents[0]);
    }
  }, []);

  // Countdown timer hook
  useEffect(() => {
    if (!nextEvent) return;

    const timer = setInterval(() => {
      const targetTime = new Date(nextEvent.date).getTime();
      const difference = targetTime - Date.now();

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextEvent]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skills
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      await updateProfile({
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
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const dashboardStats = [
    { label: "Network Members", value: mockDb.getUsers().length, icon: Users, color: "text-blue-400 bg-blue-500/10" },
    { label: "Community Events", value: mockDb.getEvents().length, icon: Calendar, color: "text-violet-400 bg-violet-500/10" },
    { label: "Shared Memories", value: mockDb.getMemories().length, icon: ImageIcon, color: "text-pink-400 bg-pink-500/10" },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 glass-card rounded-2xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-white leading-tight">
            Welcome back, <span className="text-gradient">{user?.name}</span>!
          </h1>
          <p className="text-zinc-400 text-sm font-light mt-1">
            {user?.role === "admin" ? (
              <span className="text-rose-400 font-semibold uppercase tracking-wider text-xs">
                System Administrator
              </span>
            ) : (
              <span>
                Batch {user?.batch || "N/A"} • {user?.branch || "Alumni Portal"}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-violet-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-violet-500/10 w-fit shrink-0"
        >
          <Edit3 className="h-4 w-4" />
          Edit Professional Card
        </button>
      </div>

      {/* Edit Profile Panel */}
      {isEditingProfile && (
        <div className="glass-card rounded-2xl p-6 border border-violet-500/30 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <h3 className="text-lg font-bold font-outfit text-white">Edit Professional Profile</h3>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="text-zinc-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Current Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Tesla, etc."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Engineer, Product Manager, etc."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Professional Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your career focus, experiences, and mentorship preferences..."
                rows={3}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light resize-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Key Skills (comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, AWS, Product Roadmapping, Python"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
              />
            </div>

            {/* ── Social Media (optional) ── */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <AtSign className="h-4 w-4 text-zinc-500" />
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Social Handles</p>
                <span className="text-[9px] font-semibold text-violet-400 border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <p className="text-[10px] text-zinc-600 font-light mb-3">
                Let batchmates connect with you on social — a privacy-safe alternative to sharing phone numbers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="text-pink-500 text-xs">▣</span> Instagram
                  </label>
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="@username or URL"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="text-blue-500 text-xs">▣</span> Facebook
                  </label>
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="@username or URL"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="text-zinc-300 text-xs">𝕏</span> X / Twitter
                  </label>
                  <input
                    type="text"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="@handle or URL"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
              >
                <Save className="h-4 w-4" />
                Save Profile Card
              </button>
            </div>
          </form>
        </div>
      )}

      {profileSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          Profile updated successfully! Check the Alumni Directory to view your updated card.
        </div>
      )}

      {/* Main Grid: Countdown + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Countdown Event Timer */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          {nextEvent ? (
            <>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
                  NEXT UPCOMING EVENT
                </span>
                <h3 className="text-xl font-bold font-outfit text-white mt-3 truncate">
                  {nextEvent.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-zinc-400 text-xs mt-2 font-light">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{nextEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{new Date(nextEvent.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                </div>
              </div>

              {/* Countdown Numbers */}
              <div className="grid grid-cols-4 gap-2 text-center mt-6 py-3 bg-zinc-950/40 rounded-xl border border-zinc-900/60 max-w-md">
                <div className="space-y-0.5">
                  <p className="text-2xl md:text-3xl font-extrabold font-outfit text-white">{String(countdown.days).padStart(2, '0')}</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Days</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl md:text-3xl font-extrabold font-outfit text-white">{String(countdown.hours).padStart(2, '0')}</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Hours</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl md:text-3xl font-extrabold font-outfit text-white">{String(countdown.minutes).padStart(2, '0')}</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Min</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl md:text-3xl font-extrabold font-outfit text-white">{String(countdown.seconds).padStart(2, '0')}</p>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Sec</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full py-8 text-zinc-500">
              <Calendar className="h-10 w-10 text-zinc-600 mb-2" />
              <p className="font-outfit font-semibold text-zinc-400">No Upcoming Events Scheduled</p>
              <p className="text-xs font-light mt-1">Check back later or register interest with administrators.</p>
            </div>
          )}
        </div>

        {/* User Card Profile Completeness */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover border border-zinc-800"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700">
                  <Users className="h-5 w-5" />
                </div>
              )}
              <div className="text-left">
                <h4 className="font-semibold text-white truncate max-w-[150px]">{user?.name}</h4>
                <p className="text-[10px] text-zinc-400 truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs font-light text-zinc-300">
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">Professional Title</span>
                <span className="font-medium text-white truncate max-w-[140px]">{user?.title || "Not Set"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">Company</span>
                <span className="font-medium text-white truncate max-w-[140px]">{user?.company || "Not Set"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Skills Added</span>
                <span className="font-medium text-white truncate max-w-[140px]">
                  {user?.skills && user.skills.length > 0 ? `${user.skills.length} skills` : "None"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(true)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs py-2 rounded-xl mt-4 transition-colors flex items-center justify-center gap-1"
          >
            Update Profile Data
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4 text-left">
            <div className={`${stat.color} p-3.5 rounded-2xl`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold font-outfit text-white">{stat.value}</p>
              <p className="text-xs font-medium text-zinc-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action links */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold font-outfit text-white text-left">Quick Action Grid</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/directory"
            className="glass-card rounded-2xl p-5 text-left hover:border-primary hover:shadow-lg hover:shadow-violet-500/5 group"
          >
            <h4 className="font-bold text-white group-hover:text-primary transition-colors">Search Alumni Directory</h4>
            <p className="text-xs font-light text-zinc-400 mt-1 leading-relaxed">
              Find classmates, view job details, and connect on professional channels.
            </p>
          </Link>
          
          <Link
            href="/dashboard/events"
            className="glass-card rounded-2xl p-5 text-left hover:border-primary hover:shadow-lg hover:shadow-violet-500/5 group"
          >
            <h4 className="font-bold text-white group-hover:text-primary transition-colors">Event Registration</h4>
            <p className="text-xs font-light text-zinc-400 mt-1 leading-relaxed">
              Sign up for mixers, homecoming, or panels and retrieve digital tickets.
            </p>
          </Link>
          
          <Link
            href="/dashboard/memories"
            className="glass-card rounded-2xl p-5 text-left hover:border-primary hover:shadow-lg hover:shadow-violet-500/5 group"
          >
            <h4 className="font-bold text-white group-hover:text-primary transition-colors">Memory Wall Feed</h4>
            <p className="text-xs font-light text-zinc-400 mt-1 leading-relaxed">
              Post your favorite graduation photos, nostalgic lectures, and read stories.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
