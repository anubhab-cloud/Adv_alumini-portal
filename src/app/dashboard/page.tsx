"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockEvent } from "@/lib/mockDb";
import {
  MapPin,
  Calendar,
  Users,
  ImageIcon,
  Save,
  AtSign,
  X,
  ChevronRight,
  Ticket,
  Search,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

/* ── Countdown unit ── */
function CdUnit({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: 13,
        padding: "13px 16px",
        textAlign: "center",
        minWidth: 70,
        transition: "border-color 0.2s",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-dm-serif, 'DM Serif Display')",
          fontSize: 30,
          color: "var(--gold2)",
          lineHeight: 1,
          display: "block",
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        style={{
          fontSize: 10,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginTop: 3,
          display: "block",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({
  icon,
  value,
  label,
  delta,
  accent,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  delta: string;
  accent: "gold" | "blue" | "grey";
}) {
  const iconBg = {
    gold: "rgba(212,168,67,0.12)",
    blue: "rgba(74,127,193,0.12)",
    grey: "rgba(138,154,181,0.12)",
  }[accent];
  const deltaColor = accent === "blue" ? "var(--blue2)" : "var(--gold2)";
  const deltaBg =
    accent === "blue" ? "rgba(74,127,193,0.1)" : "rgba(212,168,67,0.1)";

  return (
    <div
      className="glass-card"
      style={{ borderRadius: 16, padding: 20, textAlign: "center", cursor: "default" }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          margin: "0 auto 12px",
          display: "grid",
          placeItems: "center",
          background: iconBg,
          color: accent === "gold" ? "var(--gold2)" : accent === "blue" ? "var(--blue2)" : "var(--grey)",
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontFamily: "var(--font-dm-serif, 'DM Serif Display')",
          fontSize: 38,
          lineHeight: 1,
          color: "var(--grey2)",
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{label}</p>
      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 600,
          marginTop: 8,
          padding: "2px 8px",
          borderRadius: 6,
          color: deltaColor,
          background: deltaBg,
        }}
      >
        {delta}
      </span>
    </div>
  );
}

/* ── Quick action card ── */
function ActionCard({
  icon,
  title,
  desc,
  href,
  accent,
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
  accent: "gold" | "blue" | "grey";
}) {
  const iconBg = {
    gold: "rgba(212,168,67,0.12)",
    blue: "rgba(74,127,193,0.12)",
    grey: "rgba(138,154,181,0.1)",
  }[accent];

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="glass-card"
        style={{ borderRadius: 16, padding: 22, cursor: "pointer", position: "relative", overflow: "hidden" }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            fontSize: 20,
            marginBottom: 14,
            background: iconBg,
          }}
        >
          {icon}
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.55 }}>{desc}</p>
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 22,
            color: "var(--gold2)",
          }}
        >
          <ChevronRight size={15} />
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function DashboardHome() {
  const { user, updateProfile } = useAuth();
  const [nextEvent, setNextEvent] = useState<MockEvent | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  /* Profile form state */
  const [company,      setCompany]      = useState(user?.company      || "");
  const [title,        setTitle]        = useState(user?.title        || "");
  const [bio,          setBio]          = useState(user?.bio          || "");
  const [skills,       setSkills]       = useState(user?.skills?.join(", ") || "");
  const [linkedinUrl,  setLinkedinUrl]  = useState(user?.linkedinUrl  || "");
  const [githubUrl,    setGithubUrl]    = useState(user?.githubUrl    || "");
  const [instagramUrl, setInstagramUrl] = useState(user?.instagramUrl || "");
  const [facebookUrl,  setFacebookUrl]  = useState(user?.facebookUrl  || "");
  const [twitterUrl,   setTwitterUrl]   = useState(user?.twitterUrl   || "");

  /* Next event */
  useEffect(() => {
    const future = mockDb
      .getEvents()
      .filter((e) => new Date(e.date).getTime() > Date.now())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (future.length > 0) setNextEvent(future[0]);
  }, []);

  /* Live countdown */
  useEffect(() => {
    if (!nextEvent) return;
    const tick = () => {
      const diff = new Date(nextEvent.date).getTime() - Date.now();
      if (diff <= 0) return setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setCountdown({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextEvent]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      await updateProfile({ company, title, bio, skills: skillsArray, linkedinUrl, githubUrl, instagramUrl, facebookUrl, twitterUrl });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning ☀️";
    if (h < 17) return "Good afternoon 👋";
    return "Good evening 🌙";
  })();

  const memberCount = mockDb.getUsers().length;
  const eventCount  = mockDb.getEvents().length;
  const memoryCount = mockDb.getMemories().length;

  const inputCls: React.CSSProperties = {
    width: "100%",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 11,
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 13,
    outline: "none",
    fontFamily: "var(--font-dm-sans, 'DM Sans')",
  };

  const labelCls: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--muted)",
    display: "block",
    marginBottom: 5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Top bar: welcome + CTA ── */}
      <div
        className="fade-up"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: "var(--muted)", letterSpacing: "0.04em", marginBottom: 4 }}>
            {greeting}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-dm-serif, 'DM Serif Display')",
              fontSize: "clamp(28px, 4.5vw, 42px)",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            Welcome back, <span className="text-gradient-gold" style={{ display: "inline-block" }}>{user?.name}</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            {user?.role === "admin"
              ? "System Administrator"
              : `Batch ${user?.batch || "N/A"} · ${user?.branch || "Alumni Portal"}`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          {/* Notification bell */}
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "var(--muted)",
              position: "relative",
            }}
            aria-label="Notifications"
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--gold2)",
                position: "absolute",
                top: 8,
                right: 8,
                border: "2px solid var(--surface)",
              }}
              className="animate-pulse-dot"
            />
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>

          {/* Edit profile CTA */}
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            style={{
              background: "linear-gradient(135deg, var(--gold2), var(--gold))",
              color: "#0d1117",
              fontSize: 13,
              fontWeight: 700,
              padding: "10px 20px",
              borderRadius: 11,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(212,168,67,0.25)",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-dm-sans, 'DM Sans')",
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile Card
          </button>
        </div>
      </div>

      {/* ── Profile editor panel ── */}
      {isEditingProfile && (
        <div
          className="glass-card fade-up"
          style={{ borderRadius: 18, padding: 24, border: "1px solid rgba(212,168,67,0.25)" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h3 style={{ fontFamily: "var(--font-dm-serif, 'DM Serif Display')", fontSize: 18, color: "var(--text)" }}>
              Edit Professional Profile
            </h3>
            <button
              onClick={() => setIsEditingProfile(false)}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleProfileSave}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <div><label style={labelCls}>Company</label><input style={inputCls} value={company} onChange={e => setCompany(e.target.value)} placeholder="Google, Infosys, etc." /></div>
              <div><label style={labelCls}>Job Title</label><input style={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="Software Engineer, etc." /></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelCls}>Professional Bio</label>
                <textarea style={{ ...inputCls, resize: "none" } as React.CSSProperties} rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Brief career summary..." />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelCls}>Skills (comma-separated)</label>
                <input style={inputCls} value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Go, Kubernetes" />
              </div>
              <div><label style={labelCls}>LinkedIn</label><input style={inputCls} value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
              <div><label style={labelCls}>GitHub</label><input style={inputCls} value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." /></div>

              {/* Social handles */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <AtSign size={14} color="var(--muted)" />
                  <span style={{ ...labelCls, margin: 0 }}>Social Handles</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "var(--blue2)", background: "rgba(74,127,193,0.1)", border: "1px solid rgba(74,127,193,0.2)", padding: "2px 7px", borderRadius: 20 }}>Optional</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <div><label style={{ ...labelCls, color: "var(--gold2)" }}>◆ Instagram</label><input style={inputCls} value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="@username or URL" /></div>
                  <div><label style={{ ...labelCls, color: "var(--blue2)" }}>◆ Facebook</label><input style={inputCls} value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} placeholder="@username or URL" /></div>
                  <div><label style={{ ...labelCls, color: "var(--grey2)" }}>◆ X / Twitter</label><input style={inputCls} value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} placeholder="@handle or URL" /></div>
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <button
                  type="submit"
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg, var(--gold2), var(--gold))",
                    color: "#0d1117", fontWeight: 700, fontSize: 13,
                    padding: "11px 24px", borderRadius: 11, border: "none", cursor: "pointer",
                    fontFamily: "var(--font-dm-sans, 'DM Sans')",
                  }}
                >
                  <Save size={14} /> Save Profile Card
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {profileSuccess && (
        <div style={{ background: "rgba(74,193,107,0.1)", border: "1px solid rgba(74,193,107,0.25)", color: "#4ade80", padding: "12px 16px", borderRadius: 11, fontSize: 13, fontWeight: 600 }}>
          ✓ Profile updated! Your Alumni Directory card is now live.
        </div>
      )}

      {/* ── Hero row: Event card + Profile card ── */}
      <div
        className="fade-up"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
          gap: 20,
        }}
      >
        {/* Event countdown card */}
        <div
          className="glass-card"
          style={{ borderRadius: 18, padding: 30, position: "relative", overflow: "hidden" }}
        >
          {/* ambient glow */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

          {nextEvent ? (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold2)", background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.22)", padding: "5px 13px", borderRadius: 20, marginBottom: 14 }}>
                <div className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold2)" }} />
                Next Upcoming Event
              </div>

              <h2 style={{ fontFamily: "var(--font-dm-serif, 'DM Serif Display')", fontSize: "clamp(20px, 2.5vw, 28px)", lineHeight: 1.25, marginBottom: 14, color: "var(--text)" }}>
                {nextEvent.title.includes("&") ? (
                  <>
                    {nextEvent.title.split("&")[0].trim()}
                    <br />
                    <span style={{ color: "var(--gold2)", fontStyle: "italic", fontFamily: "var(--font-dm-serif, 'DM Serif Display')" }}>
                      &amp; {nextEvent.title.split("&")[1].trim()}
                    </span>
                  </>
                ) : (
                  nextEvent.title
                )}
              </h2>

              <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--grey)" }}>
                  <MapPin size={13} color="var(--blue2)" />
                  {nextEvent.location}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--grey)" }}>
                  <Calendar size={13} color="var(--blue2)" />
                  {new Date(nextEvent.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <CdUnit value={countdown.days}    label="DAYS" />
                <CdUnit value={countdown.hours}   label="HOURS" />
                <CdUnit value={countdown.minutes} label="MIN" />
                <CdUnit value={countdown.seconds} label="SEC" />
              </div>

              <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/dashboard/events">
                  <button style={{ background: "linear-gradient(135deg, var(--gold2), var(--gold))", color: "#0d1117", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 11, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 16px rgba(212,168,67,0.25)", fontFamily: "var(--font-dm-sans, 'DM Sans')" }}>
                    <Ticket size={14} /> Register Now →
                  </button>
                </Link>
                <Link href="/dashboard/events">
                  <button style={{ padding: "10px 20px", borderRadius: 11, fontSize: 13, fontWeight: 600, border: "1px solid var(--border2)", background: "transparent", color: "var(--grey2)", cursor: "pointer", fontFamily: "var(--font-dm-sans, 'DM Sans')" }}>
                    View Details
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
              <Calendar size={40} color="var(--muted)" style={{ marginBottom: 8 }} />
              <p style={{ fontFamily: "var(--font-dm-serif, 'DM Serif Display')", color: "var(--grey2)", fontSize: 16 }}>No Upcoming Events</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Check back later or contact administrators.</p>
            </div>
          )}
        </div>

        {/* Profile summary card */}
        <div className="glass-card" style={{ borderRadius: 18, padding: 26, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "radial-gradient(circle, rgba(74,127,193,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Header */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
            {user?.photoUrl ? (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img src={user.photoUrl} alt={user.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border2)" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#4ade80", border: "2px solid var(--surface)", position: "absolute", bottom: 1, right: 1 }} />
              </div>
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--gold2), var(--gold))", display: "grid", placeItems: "center", fontFamily: "var(--font-dm-serif, 'DM Serif Display')", fontSize: 22, color: "#0d1117", fontWeight: "bold", flexShrink: 0, boxShadow: "0 4px 14px rgba(212,168,67,0.3)", position: "relative" }}>
                {user?.name?.[0]?.toUpperCase() ?? "A"}
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#4ade80", border: "2px solid var(--surface)", position: "absolute", bottom: 1, right: 1 }} />
              </div>
            )}
            <div>
              <p style={{ fontSize: 17, fontWeight: 600, color: "var(--text)" }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{user?.email}</p>
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border)", margin: "0 0 14px" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Title</span>
              <span className="badge-gold">{user?.title || "Not set"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Company</span>
              <span className="badge-blue">{user?.company || "Not set"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Skills</span>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "62%" }}>
                {(user?.skills?.slice(0, 3) ?? []).map((s, i) => (
                  <span key={i} className="badge-grey">{s}</span>
                ))}
                {(user?.skills?.length ?? 0) > 3 && (
                  <span className="badge-grey">+{(user?.skills?.length ?? 0) - 3}</span>
                )}
                {(!user?.skills || user.skills.length === 0) && <span className="badge-grey">None</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(true)}
            style={{
              width: "100%",
              marginTop: 18,
              padding: 11,
              borderRadius: 11,
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid rgba(74,127,193,0.3)",
              background: "rgba(74,127,193,0.07)",
              color: "var(--blue2)",
              cursor: "pointer",
              fontFamily: "var(--font-dm-sans, 'DM Sans')",
              transition: "all 0.2s",
            }}
          >
            ↗ Update Profile Data
          </button>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div
        className="fade-up"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
      >
        <StatCard icon={<HeartHandshake size={20} />} value={memberCount} label="Network Members"   delta="+2 this month" accent="gold" />
        <StatCard icon={<Calendar size={20} />} value={eventCount}  label="Community Events"  delta="Upcoming"       accent="blue" />
        <StatCard icon={<Sparkles size={20} />} value={memoryCount} label="Shared Memories"   delta="+1 new"         accent="grey" />
      </div>

      {/* ── Quick actions ── */}
      <div className="fade-up">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
            Quick Actions
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <ActionCard
            icon="🔍" accent="gold"
            title="Alumni Directory"
            desc="Find classmates, view job details, and connect on professional channels across all batches."
            href="/dashboard/directory"
          />
          <ActionCard
            icon="🎟" accent="blue"
            title="Event Registration"
            desc="Sign up for mixers, homecoming, or panels and retrieve your digital tickets instantly."
            href="/dashboard/events"
          />
          <ActionCard
            icon="🖼" accent="grey"
            title="Memory Wall Feed"
            desc="Post graduation photos, nostalgic memories, and share stories with your batchmates."
            href="/dashboard/memories"
          />
        </div>
      </div>
    </div>
  );
}
