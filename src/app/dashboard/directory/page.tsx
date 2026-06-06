"use client";

import React, { useState, useEffect } from "react";
import { mockDb, MockUser } from "@/lib/mockDb";
import {
  Search,
  Linkedin,
  Github,
  Mail,
  Briefcase,
  GraduationCap,
} from "lucide-react";

/* ── Inline brand SVG icons ── */
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

/** Normalise a raw social input into a full URL */
function toUrl(raw: string, base: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  return `${base}${handle}`;
}

export default function AlumniDirectory() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");

  useEffect(() => {
    setUsers(mockDb.getUsers());
  }, []);

  const branches = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ];
  const batches = Array.from({ length: 11 }, (_, i) => String(2016 + i));

  const filteredAlumni = users.filter((alumni) => {
    if (alumni.role === "admin") return false;
    const matchesSearch =
      alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alumni.company && alumni.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alumni.title && alumni.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alumni.skills && alumni.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesBatch = selectedBatch === "all" || alumni.batch === selectedBatch;
    const matchesBranch = selectedBranch === "all" || alumni.branch === selectedBranch;
    return matchesSearch && matchesBatch && matchesBranch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-white leading-tight">
          Alumni Directory
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Search and connect with graduates across engineering batches and global companies.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, company, job title, or skill..."
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 font-light"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light bg-zinc-900"
            >
              <option value="all" className="bg-zinc-950">All Batches</option>
              {batches.map((year) => (
                <option key={year} value={year} className="bg-zinc-950">Batch {year}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light bg-zinc-900"
            >
              <option value="all" className="bg-zinc-950">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b} className="bg-zinc-950">{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of cards */}
      {filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumni) => {
            const igUrl  = toUrl(alumni.instagramUrl || "", "https://instagram.com/");
            const fbUrl  = toUrl(alumni.facebookUrl  || "", "https://facebook.com/");
            const xUrl   = toUrl(alumni.twitterUrl   || "", "https://x.com/");
            const hasSocial = !!(igUrl || fbUrl || xUrl || alumni.linkedinUrl || alumni.githubUrl);

            return (
              <div
                key={alumni.uid}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/30 transition-all group"
              >
                {/* Header */}
                <div>
                  <div className="flex gap-4 items-start">
                    {alumni.photoUrl ? (
                      <img
                        src={alumni.photoUrl}
                        alt={alumni.name}
                        className="h-14 w-14 rounded-full object-cover border border-zinc-800 shrink-0 bg-zinc-900"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                        <GraduationCap className="h-7 w-7" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base truncate font-outfit leading-snug">
                        {alumni.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-0.5 font-light">
                        <GraduationCap className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">
                          Batch {alumni.batch} • {alumni.branch?.split(" ")[0]}
                        </span>
                      </div>
                      {alumni.company ? (
                        <div className="flex items-center gap-1.5 text-violet-400 text-xs mt-1 font-semibold">
                          <Briefcase className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{alumni.title} at {alumni.company}</span>
                        </div>
                      ) : (
                        <span className="inline-block text-[9px] font-bold text-zinc-500 border border-zinc-800 bg-zinc-900/40 px-2 py-0.5 rounded-md mt-1 uppercase tracking-wider">
                          Exploring Opportunities
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {alumni.bio ? (
                    <p className="text-zinc-400 text-xs font-light mt-4 line-clamp-3 leading-relaxed">
                      {alumni.bio}
                    </p>
                  ) : (
                    <p className="text-zinc-600 text-xs font-light mt-4 italic">
                      No bio description provided yet.
                    </p>
                  )}

                  {/* Skills */}
                  {alumni.skills && alumni.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {alumni.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="text-[9px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom connect bar */}
                <div className="pt-4 mt-6 border-t border-zinc-900">
                  {hasSocial ? (
                    <div className="flex items-center justify-between">
                      {/* Email */}
                      <a
                        href={`mailto:${alumni.email}`}
                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                        title="Send email"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-light">Email</span>
                      </a>

                      {/* Social icon cluster */}
                      <div className="flex items-center gap-1.5">
                        {alumni.linkedinUrl && (
                          <a
                            href={alumni.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn"
                            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-[#0A66C2] text-zinc-400 hover:text-[#0A66C2] rounded-lg transition-all"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {alumni.githubUrl && (
                          <a
                            href={alumni.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub"
                            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-400 text-zinc-400 hover:text-white rounded-lg transition-all"
                          >
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {igUrl && (
                          <a
                            href={igUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Instagram"
                            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-pink-500 text-zinc-400 hover:text-pink-400 rounded-lg transition-all"
                          >
                            <InstagramIcon />
                          </a>
                        )}
                        {fbUrl && (
                          <a
                            href={fbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Facebook"
                            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-blue-400 rounded-lg transition-all"
                          >
                            <FacebookIcon />
                          </a>
                        )}
                        {xUrl && (
                          <a
                            href={xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="X / Twitter"
                            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-300 text-zinc-400 hover:text-white rounded-lg transition-all"
                          >
                            <XIcon />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* No socials yet — nudge to add */
                    <div className="flex items-center justify-between">
                      <a
                        href={`mailto:${alumni.email}`}
                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                        title="Send email"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-light">Email</span>
                      </a>
                      <span className="text-[9px] text-zinc-700 italic">No social links shared</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center text-zinc-500">
          <Search className="h-10 w-10 text-zinc-700 mb-2" />
          <p className="font-outfit font-semibold text-zinc-400">No Alumni Profiles Found</p>
          <p className="text-xs font-light mt-1 max-w-sm">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}
