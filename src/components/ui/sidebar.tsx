"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNavClick?: () => void;
}

/* Nav item SVGs — inline for zero-dep matching the mockup */
const navItems = [
  {
    label: "Dashboard", href: "/dashboard", section: "Main",
    icon: <svg className="nav-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    label: "Alumni Directory", href: "/dashboard/directory", section: null,
    icon: <svg className="nav-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    label: "Event Hub", href: "/dashboard/events", section: null, badge: 3,
    icon: <svg className="nav-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: "Photo Gallery", href: "/dashboard/gallery", section: null,
    icon: <svg className="nav-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  },
  {
    label: "Job Board", href: "/dashboard/jobs", section: "Career",
    icon: <svg className="nav-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  },
  {
    label: "Contributions", href: "/dashboard/contributions", section: null,
    icon: <svg className="nav-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  },
  {
    label: "Memory Wall", href: "/dashboard/memories", section: "Community",
    icon: <svg className="nav-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
];

const adminItem = {
  label: "Admin Control", href: "/dashboard/admin",
  icon: <svg className="nav-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

export default function Sidebar({ isOpen, setIsOpen, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, role } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  /* group nav items by section */
  let currentSection: string | null = "__start__";

  return (
    <>
      <style>{`
        .nav-svg { width: 17px; height: 17px; flex-shrink: 0; }
        .ap-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          color: var(--muted); font-size: 13.5px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          margin-bottom: 2px; text-decoration: none;
          border: 1px solid transparent;
          font-family: var(--font-dm-sans, 'DM Sans');
        }
        .ap-nav-item:hover {
          background: var(--surface2); color: var(--grey2);
          border-color: var(--border);
        }
        .ap-nav-item.active {
          background: rgba(212, 168, 67, 0.08);
          color: var(--gold);
          border: 1px solid rgba(212, 168, 67, 0.2);
        }
        .ap-nav-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--muted);
          padding: 10px 12px 4px; margin-top: 6px;
          font-family: var(--font-dm-sans, 'DM Sans');
        }
        .ap-nav-badge {
          margin-left: auto; background: var(--blue); color: #fff;
          font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px;
        }
      `}</style>

      <aside
        style={{
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          width: isOpen ? 260 : 72,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: isOpen ? "28px 24px 26px" : "28px 18px 26px", borderBottom: "1px solid var(--border)", marginBottom: 16, justifyContent: isOpen ? "flex-start" : "center" }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--gold2), var(--gold))", borderRadius: 10, display: "grid", placeItems: "center", fontFamily: "var(--font-dm-serif, 'DM Serif Display')", fontSize: 17, color: "#0d1117", fontWeight: "bold", flexShrink: 0, boxShadow: "0 4px 12px rgba(212,168,67,0.25)" }}>
            A
          </div>
          {isOpen && (
            <div style={{ fontFamily: "var(--font-dm-sans, 'DM Sans')", fontSize: 14, fontWeight: 600, letterSpacing: "0.03em", color: "var(--grey2)", whiteSpace: "nowrap", overflow: "hidden" }}>
              <span style={{ color: "var(--gold2)" }}>Alumni</span>Portal
            </div>
          )}

          {/* Collapse toggle — desktop */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex"
            style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, flexShrink: 0 }}
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }} className="scroll-smooth-touch">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const showSection = item.section && item.section !== currentSection;
            if (item.section) currentSection = item.section;

            return (
              <React.Fragment key={item.href}>
                {showSection && isOpen && (
                  <div className="ap-nav-label">{item.section}</div>
                )}
                {showSection && !isOpen && (
                  <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
                )}
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={`ap-nav-item ${isActive ? "active" : ""}`}
                  style={{ justifyContent: isOpen ? "flex-start" : "center" }}
                  aria-current={isActive ? "page" : undefined}
                  title={!isOpen ? item.label : undefined}
                >
                  {item.icon}
                  {isOpen && <span style={{ flex: 1 }}>{item.label}</span>}
                  {isOpen && item.badge && (
                    <span className="ap-nav-badge">{item.badge}</span>
                  )}
                </Link>
              </React.Fragment>
            );
          })}

          {/* Admin */}
          {role === "admin" && (
            <>
              {isOpen && <div className="ap-nav-label">Admin</div>}
              {!isOpen && <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />}
              <Link
                href={adminItem.href}
                onClick={onNavClick}
                className={`ap-nav-item ${pathname === adminItem.href ? "active" : ""}`}
                style={{
                  justifyContent: isOpen ? "flex-start" : "center",
                  color: pathname === adminItem.href ? "var(--gold2)" : "var(--gold)",
                }}
                aria-current={pathname === adminItem.href ? "page" : undefined}
                title={!isOpen ? adminItem.label : undefined}
              >
                {adminItem.icon}
                {isOpen && <span>{adminItem.label}</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User section */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              justifyContent: isOpen ? "flex-start" : "center",
            }}
          >
            {/* Avatar */}
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border2)", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--gold2), var(--gold))", display: "grid", placeItems: "center", fontWeight: "bold", fontFamily: "var(--font-dm-serif, 'DM Serif Display')", fontSize: 15, color: "#0d1117", flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
            )}

            {isOpen && (
              <>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-dm-sans, 'DM Sans')" }}>{user?.name ?? "Guest"}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {role ?? "Alumni"} · {user?.batch ?? "–"}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", color: "var(--muted)", flexShrink: 0 }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: isOpen ? "flex-start" : "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              background: "none",
              border: "none",
              color: "var(--muted)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-dm-sans, 'DM Sans')",
              transition: "color 0.2s",
            }}
            title={!isOpen ? "Sign Out" : undefined}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {isOpen && "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
