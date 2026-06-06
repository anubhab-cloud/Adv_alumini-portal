"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockJob } from "@/lib/mockDb";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Plus, 
  X, 
  Building2, 
  Calendar, 
  User, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from "lucide-react";

export default function JobBoardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Job Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Internship' | 'Contract'>('Full-time');
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Load jobs
    setJobs(mockDb.getJobs());
  }, []);

  const refreshJobs = () => {
    setJobs(mockDb.getJobs());
  };

  const handleApply = (jobId: string) => {
    if (!user) return;
    mockDb.applyToJob(jobId, user.uid);
    refreshJobs();
    
    // Quick success toast simulation
    const alertBox = document.createElement("div");
    alertBox.className = "fixed bottom-5 right-5 bg-zinc-900 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300";
    alertBox.innerHTML = `
      <svg class="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Application submitted successfully!</span>
    `;
    document.body.appendChild(alertBox);
    setTimeout(() => {
      alertBox.className = "fixed bottom-5 right-5 bg-zinc-900 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 z-50 animate-out fade-out slide-out-to-bottom-5 duration-300";
      setTimeout(() => alertBox.remove(), 300);
    }, 3000);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!title || !company || !location || !description) {
      setError("Please fill out all fields.");
      return;
    }

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    try {
      mockDb.createJob({
        title,
        company,
        location,
        type,
        description,
        postedBy: user.name,
        postedById: user.uid,
      });

      setSuccessMsg("Job referral posted successfully!");
      refreshJobs();
      
      // Reset form
      setTitle("");
      setCompany("");
      setLocation("");
      setType("Full-time");
      setDescription("");

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg("");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create job.");
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "All" || job.type === selectedType;

    return matchesSearch && matchesType;
  });

  const getTypeBadgeStyles = (jobType: string) => {
    switch (jobType) {
      case "Full-time":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Internship":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      case "Part-time":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      case "Contract":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  return (
    <div className="space-y-8 pb-12 font-outfit">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Careers & <span className="text-gradient">Referrals</span>
          </h1>
          <p className="text-zinc-400 text-sm font-light mt-1">
            Discover opportunities shared directly by your alumni network, or refer new talent.
          </p>
        </div>

        {/* Post Job button for Alumni only */}
        {user?.role === "alumni" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600 text-white font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-violet-500/10 self-start md:self-auto"
          >
            <Plus className="h-5 w-5" />
            Share a Referral
          </button>
        )}
      </div>

      {/* Analytics Mini-Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-violet-500/10 text-violet-400 p-3 rounded-xl border border-violet-500/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Total Active Positions</p>
            <p className="text-2xl font-bold text-white mt-0.5">{jobs.length}</p>
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Alumni Referrals Available</p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {jobs.filter(j => j.postedById !== "mock-admin").length}
            </p>
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl border border-amber-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Total Applications Received</p>
            <p className="text-2xl font-bold text-white mt-0.5 font-mono">
              {jobs.reduce((acc, curr) => acc + curr.applicants.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/20 border border-zinc-850 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-4.5 w-4.5" />
          <input
            type="text"
            placeholder="Search by job title, company, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10.5 pr-4 py-2.5 text-white text-sm placeholder-zinc-500 outline-none transition-all"
          />
        </div>

        {/* Job Type Tabs */}
        <div className="flex gap-1.5 overflow-x-auto self-start md:self-auto w-full md:w-auto pb-1 md:pb-0">
          {["All", "Full-time", "Internship", "Part-time", "Contract"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedType(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all duration-200 ${
                selectedType === tab
                  ? "bg-white text-zinc-950 border-white font-medium"
                  : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-855"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Job Postings Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const hasApplied = user ? job.applicants.includes(user.uid) : false;
            return (
              <div 
                key={job.id}
                className="group relative bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/5 flex flex-col justify-between"
              >
                {/* Accent glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative space-y-4">
                  {/* Title & Badge */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-zinc-400 text-xs font-light">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company}
                        </span>
                        <span className="text-zinc-650">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getTypeBadgeStyles(job.type)}`}>
                      {job.type}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-zinc-400 text-xs font-light leading-relaxed line-clamp-3">
                    {job.description}
                  </p>

                  {/* Posted By Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-850/60 text-[11px] text-zinc-500 font-light">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-zinc-550" />
                      Referral by <strong className="text-zinc-350 font-medium">{job.postedBy}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(job.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Apply Panel */}
                <div className="relative flex items-center justify-between mt-6 pt-4 border-t border-zinc-850/40">
                  <span className="text-zinc-500 text-xs font-light">
                    <strong className="text-white font-semibold">{job.applicants.length}</strong> applicants
                  </span>

                  {hasApplied ? (
                    <button
                      disabled
                      className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold py-2 px-4 rounded-xl cursor-default"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="flex items-center gap-1 text-white bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                    >
                      Apply Now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/10 border border-zinc-900 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-zinc-900 p-4 rounded-full text-zinc-650 mb-4">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="text-white font-semibold text-base">No listings found</h3>
          <p className="text-zinc-500 text-xs font-light mt-1 max-w-sm">
            Try adjusting your search criteria or select another job type filter tab.
          </p>
        </div>
      )}

      {/* Share a Referral Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Share Referral Opportunity</h2>
            <p className="text-zinc-400 text-xs font-light mb-6">
              Create a job listing on the board. Students and alumni will be able to apply.
            </p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl mb-4 font-light">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl mb-4 font-light">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Software Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-white text-xs placeholder-zinc-650 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Microsoft"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-white text-xs placeholder-zinc-650 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-medium mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Seattle, WA / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-white text-xs placeholder-zinc-650 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Employment Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-white text-xs outline-none transition-all"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Job Description & Referral Details</label>
                <textarea
                  placeholder="Summarize the role, requirements, and if you offer internal referral or resume reviews..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-white text-xs placeholder-zinc-650 outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-350 border border-zinc-800 py-3.5 rounded-xl text-xs font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-violet-600 hover:opacity-95 text-white py-3.5 rounded-xl text-xs font-semibold transition-all duration-200 shadow-lg shadow-violet-500/10"
                >
                  Submit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
