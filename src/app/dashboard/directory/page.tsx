"use client";

import React, { useState, useEffect } from "react";
import { mockDb, MockUser } from "@/lib/mockDb";
import { Search, SlidersHorizontal, Linkedin, Github, Mail, UserPlus, Briefcase, GraduationCap } from "lucide-react";

export default function AlumniDirectory() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");

  useEffect(() => {
    // Load all registered users
    setUsers(mockDb.getUsers());
  }, []);

  const branches = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering"
  ];

  const batches = Array.from({ length: 11 }, (_, i) => String(2016 + i));

  // Filter users based on search term, batch, and branch
  const filteredAlumni = users.filter((alumni) => {
    // Exclude admins from the public alumni directory
    if (alumni.role === "admin") return false;

    const matchesSearch = 
      alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alumni.company && alumni.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alumni.title && alumni.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alumni.skills && alumni.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

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

      {/* Filter and Search Box */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, company, job title, or skill..."
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 font-light"
            />
          </div>

          {/* Batch Selector */}
          <div className="w-full md:w-48">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light bg-zinc-900"
            >
              <option value="all" className="bg-zinc-950">All Batches</option>
              {batches.map((year) => (
                <option key={year} value={year} className="bg-zinc-950">
                  Batch {year}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Selector */}
          <div className="w-full md:w-64">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light bg-zinc-900"
            >
              <option value="all" className="bg-zinc-950">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b} className="bg-zinc-950">
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of cards */}
      {filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumni) => (
            <div key={alumni.uid} className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/30 transition-all">
              {/* Header profile info */}
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
                      <span className="truncate">Batch {alumni.batch} • {alumni.branch?.split(" ")[0]}</span>
                    </div>
                    {alumni.company ? (
                      <div className="flex items-center gap-1.5 text-violet-400 text-xs mt-1 font-semibold">
                        <Briefcase className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {alumni.title} at {alumni.company}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block text-[9px] font-bold text-zinc-500 border border-zinc-800 bg-zinc-900/40 px-2 py-0.5 rounded-md mt-1 uppercase tracking-wider">
                        Exploring Opportunities
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio paragraph */}
                {alumni.bio ? (
                  <p className="text-zinc-400 text-xs font-light mt-4 line-clamp-3 leading-relaxed">
                    {alumni.bio}
                  </p>
                ) : (
                  <p className="text-zinc-600 text-xs font-light mt-4 italic">
                    No bio description provided yet.
                  </p>
                )}

                {/* Skills section */}
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

              {/* Bottom social bar */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-zinc-900">
                <a
                  href={`mailto:${alumni.email}`}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-light">Email</span>
                </a>

                <div className="flex gap-2">
                  {alumni.linkedinUrl && (
                    <a
                      href={alumni.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {alumni.githubUrl && (
                    <a
                      href={alumni.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                      title="GitHub"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center text-zinc-500">
          <Search className="h-10 w-10 text-zinc-700 mb-2" />
          <p className="font-outfit font-semibold text-zinc-400">No Alumni Profiles Found</p>
          <p className="text-xs font-light mt-1 max-w-sm">
            Try adjusting your filters or search terms (e.g. typing a different company name or clearing the filters).
          </p>
        </div>
      )}
    </div>
  );
}
