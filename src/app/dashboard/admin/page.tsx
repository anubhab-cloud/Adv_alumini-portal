"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockEvent, MockGalleryImage, MockUser, MockContribution, MockRegistration, AuditEntry, TrashEntry } from "@/lib/mockDb";
import { mockRedis } from "@/lib/mockRedis";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  BarChart3, 
  CalendarPlus, 
  Image as ImageIcon, 
  Users, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Upload, 
  Loader2, 
  CheckCircle,
  Clock,
  MapPin,
  ListPlus,
  X,
  UserCheck,
  UserX,
  Receipt,
  ScanLine,
  Coins,
  QrCode,
  Play,
  RotateCcw,
  ClipboardList,
  AlertTriangle,
  Undo2
} from "lucide-react";

export default function AdminControlCenter() {
  const { user, role } = useAuth();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<'analytics' | 'events' | 'gallery' | 'users' | 'contributions' | 'attendance' | 'audit' | 'trash'>('analytics');

  // Stats state
  const [stats, setStats] = useState({
    alumni: 0,
    events: 0,
    memories: 0,
    registrations: 0
  });

  // Event builder state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [currentActivity, setCurrentActivity] = useState("");
  const [eventSuccess, setEventSuccess] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventCapacity, setEventCapacity] = useState("300");

  // Gallery builder state
  const [galleryImages, setGalleryImages] = useState<MockGalleryImage[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryFilePreview, setGalleryFilePreview] = useState<string | null>(null);
  const [gallerySuccess, setGallerySuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryType, setGalleryType] = useState<'photo' | 'video'>('photo');
  const [galleryCategory, setGalleryCategory] = useState<'2026 Reunion' | 'Sports' | 'Cultural' | 'Batch Photos'>('2026 Reunion');
  const [galleryBatch, setGalleryBatch] = useState<string>('All');
  const [useSampleVideo, setUseSampleVideo] = useState(false);

  // New states for approvals, contributions, scanning
  const [usersList, setUsersList] = useState<MockUser[]>([]);
  const [contributionsList, setContributionsList] = useState<MockContribution[]>([]);
  const [registrationsList, setRegistrationsList] = useState<MockRegistration[]>([]);
  const [ticketCodeInput, setTicketCodeInput] = useState("");
  const [scanResultMsg, setScanResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Audit log + trash state
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [trashedUsers, setTrashedUsers] = useState<TrashEntry<MockUser>[]>([]);
  const [trashedEvents, setTrashedEvents] = useState<TrashEntry<MockEvent>[]>([]);
  const [trashedGallery, setTrashedGallery] = useState<TrashEntry<MockGalleryImage>[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Extended Analytics State for event checks and catering logs
  const [analytics, setAnalytics] = useState({
    checkedIn: 0,
    attendanceRate: 0,
    vegCount: 0,
    vegCheckedIn: 0,
    nonVegCount: 0,
    nonVegCheckedIn: 0,
    activityDemands: {} as Record<string, number>
  });

  // Batch-wise analytics
  const [batchAnalytics, setBatchAnalytics] = useState<Array<{
    batch: string;
    alumniCount: number;
    totalFunds: number;
    avgFunds: number;
    eventRegistrations: number;
    memoriesPosted: number;
    jobsPosted: number;
    engagementScore: number;
  }>>([]);

  useEffect(() => {
    if (role === "admin") {
      loadStats();
      loadGallery();
      loadUsers();
      loadContributions();
      loadRegistrations();
      loadAuditAndTrash();
    }
  }, [role]);

  const loadStats = () => {
    const allUsers = mockDb.getUsers().filter(u => u.role !== 'admin');
    const allEvents = mockDb.getEvents();
    const allMemories = mockDb.getMemories();
    const allRegs = mockDb.getRegistrations();
    const allContributions = mockDb.getContributions();
    const allJobs = mockDb.getJobs();

    setStats({
      alumni: allUsers.length,
      events: allEvents.length,
      memories: allMemories.length,
      registrations: allRegs.length
    });

    // Detailed check-in / catering / activity calculations
    const checkedInList = allRegs.filter(r => r.isCheckedIn);
    const checkedInCount = checkedInList.length;
    const rate = allRegs.length > 0 ? Math.round((checkedInCount / allRegs.length) * 100) : 0;

    const veg = allRegs.filter(r => r.foodPreference === 'Veg');
    const vegChecked = veg.filter(r => r.isCheckedIn).length;
    
    const nonVeg = allRegs.filter(r => r.foodPreference === 'Non-Veg');
    const nonVegChecked = nonVeg.filter(r => r.isCheckedIn).length;

    // Calculate demands per unique session activity name
    const activityMap: Record<string, number> = {};
    allRegs.forEach(r => {
      r.activitiesSelected.forEach(act => {
        activityMap[act] = (activityMap[act] || 0) + 1;
      });
    });

    setAnalytics({
      checkedIn: checkedInCount,
      attendanceRate: rate,
      vegCount: veg.length,
      vegCheckedIn: vegChecked,
      nonVegCount: nonVeg.length,
      nonVegCheckedIn: nonVegChecked,
      activityDemands: activityMap
    });

    // ─── Batch-wise analytics computation ───
    // Collect all unique batches from alumni
    const batchSet = new Set<string>();
    allUsers.forEach(u => { if (u.batch) batchSet.add(u.batch); });
    const batches = Array.from(batchSet).sort((a, b) => Number(b) - Number(a)); // newest first

    const batchData = batches.map(batch => {
      // Alumni in this batch
      const batchUsers = allUsers.filter(u => u.batch === batch);
      const batchUids = new Set(batchUsers.map(u => u.uid));

      // Funds raised by alumni of this batch
      const batchContribs = allContributions.filter(c => batchUids.has(c.userId));
      const totalFunds = batchContribs.reduce((sum, c) => sum + c.amount, 0);
      const avgFunds = batchContribs.length > 0 ? Math.round(totalFunds / batchContribs.length) : 0;

      // Event registrations by alumni of this batch
      const batchRegs = allRegs.filter(r => batchUids.has(r.userId));

      // Memories posted by this batch
      const batchMemories = allMemories.filter(m => batchUids.has(m.userId));

      // Jobs posted by this batch
      const batchJobs = allJobs.filter(j => batchUids.has(j.postedById));

      // Engagement score: weighted composite (0-100)
      // alumni count (40%) + event participation (30%) + contributions (20%) + memories (10%)
      const maxAlumni = allUsers.length || 1;
      const maxRegs = allRegs.length || 1;
      const maxFunds = allContributions.reduce((s, c) => s + c.amount, 0) || 1;
      const maxMemories = allMemories.length || 1;
      const engagementScore = Math.round(
        (batchUsers.length / maxAlumni) * 40 +
        (batchRegs.length / maxRegs) * 30 +
        (totalFunds / maxFunds) * 20 +
        (batchMemories.length / maxMemories) * 10
      );

      return {
        batch,
        alumniCount: batchUsers.length,
        totalFunds,
        avgFunds,
        eventRegistrations: batchRegs.length,
        memoriesPosted: batchMemories.length,
        jobsPosted: batchJobs.length,
        engagementScore
      };
    });

    setBatchAnalytics(batchData);
  };

  const loadGallery = () => {
    setGalleryImages(mockDb.getGalleryImages());
  };

  const loadUsers = () => {
    setUsersList(mockDb.getUsers());
  };

  const loadContributions = () => {
    setContributionsList(mockDb.getContributions());
  };

  const loadRegistrations = () => {
    setRegistrationsList(mockDb.getRegistrations());
  };

  const loadAuditAndTrash = () => {
    setAuditLog(mockDb.getAuditLog());
    setTrashedUsers(mockDb.getTrashedUsers());
    setTrashedEvents(mockDb.getTrashedEvents());
    setTrashedGallery(mockDb.getTrashedGallery());
  };

  const audit = (action: AuditEntry['action'], target: string, targetId: string, meta?: Record<string, string | number | boolean>) => {
    mockDb.addAuditEntry({
      action,
      adminName: user?.name ?? 'Admin',
      adminUid: user?.uid ?? '',
      target,
      targetId,
      meta,
    });
    setAuditLog(mockDb.getAuditLog());
  };

  // User Actions
  const handleApproveUser = (uid: string) => {
    mockDb.approveUser(uid);
    const u = mockDb.getUserById(uid);
    audit('approve_user', u?.name ?? uid, uid);
    loadUsers();
    loadStats();
  };

  const handleDeleteUser = (uid: string) => {
    const u = mockDb.getUserById(uid);
    mockDb.softDeleteUser(uid, user?.name ?? 'Admin');
    audit('delete_user', u?.name ?? uid, uid);
    setConfirmDeleteId(null);
    loadUsers();
    loadAuditAndTrash();
    loadStats();
  };

  const handleRestoreUser = (uid: string) => {
    const restored = mockDb.restoreUser(uid);
    if (restored) audit('restore_user', restored.name, uid);
    loadUsers();
    loadAuditAndTrash();
    loadStats();
  };

  const handleToggleRole = (uid: string, currentRole: 'admin' | 'alumni') => {
    const nextRole = currentRole === 'admin' ? 'alumni' : 'admin';
    mockDb.updateUser(uid, { role: nextRole });
    const u = mockDb.getUserById(uid);
    audit('toggle_role', u?.name ?? uid, uid, { from: currentRole, to: nextRole });
    loadUsers();
  };

  // Scan Code Action
  const handleScanCode = (codeToScan?: string) => {
    setScanResultMsg(null);
    const code = codeToScan || ticketCodeInput.trim();
    if (!code) return;

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const result = mockDb.checkInRegistration(code);
      if (result) {
        audit('checkin', result.userName, result.id, { eventId: result.eventId });
        setScanResultMsg({
          type: 'success',
          text: `Checked in successfully: ${result.userName} for event! Certificate unlocked.`
        });
        setTicketCodeInput("");
        loadRegistrations();
        loadStats();
      } else {
        setScanResultMsg({
          type: 'error',
          text: 'Invalid registration stub or code token. Ticket not found.'
        });
      }
    }, 700);
  };

  const handleUndoCheckIn = (regId: string, userName: string) => {
    mockDb.undoCheckIn(regId);
    audit('undo_checkin', userName, regId);
    loadRegistrations();
    loadStats();
    loadAuditAndTrash();
  };

  // STRICT ROLE GUARD RENDERING
  if (role !== "admin") {
    return (
      <div className="py-12 max-w-md mx-auto text-center space-y-6">
        <div className="glass-card rounded-2xl p-8 border border-red-500/20 shadow-2xl flex flex-col items-center">
          <div className="bg-red-500/10 p-3 rounded-full text-red-400 mb-4 animate-bounce">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold font-outfit text-white">Access Denied</h2>
          <p className="text-zinc-400 text-sm font-light mt-2 leading-relaxed">
            Strict Role Check Failed. This control center is restricted to authorized System Administrative Coordinators.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full mt-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Event builder functions
  const addActivity = () => {
    if (currentActivity.trim()) {
      setActivities([...activities, currentActivity.trim()]);
      setCurrentActivity("");
    }
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !location) {
      setEventError("Please fill in all event details.");
      return;
    }

    setEventError(null);
    try {
      const capVal = parseInt(eventCapacity, 10) || 300;
      const newEvent = mockDb.createEvent({
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        coordinator: user?.name || "Admin Coordinator",
        activities,
        capacity: capVal
      });

      // Save initial counter in simulated Redis
      if (typeof window !== "undefined") {
        localStorage.setItem(`redis:counter:event-capacity:${newEvent.id}`, capVal.toString());
      }

      audit('create_event', title, newEvent.id, { capacity: capVal });

      // Clear Form
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setActivities([]);
      setEventCapacity("300");
      setEventSuccess(true);
      setTimeout(() => setEventSuccess(false), 4000);
      loadStats();
    } catch (err) {
      console.error(err);
      setEventError("Failed to save event.");
    }
  };

  // Gallery image handling
  const handleGalleryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalUrl = galleryFilePreview;
    if (galleryType === 'video' && useSampleVideo) {
      finalUrl = "https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-raising-toast-at-dinner-party-40243-large.mp4";
    }

    if (!finalUrl || !galleryTitle) {
      alert("Please select a media file or choose the sample video option.");
      return;
    }

    setIsUploading(true);
    try {
      const newImg = mockDb.uploadGalleryImage(
        finalUrl, 
        galleryTitle,
        galleryType,
        galleryCategory,
        galleryBatch,
        undefined,
        user?.name,
        user?.uid
      );
      audit('upload_gallery', galleryTitle, newImg.id, { type: galleryType, category: galleryCategory });
      
      setGalleryTitle("");
      setGalleryFilePreview(null);
      setGalleryType('photo');
      setGalleryCategory('2026 Reunion');
      setGalleryBatch('All');
      setUseSampleVideo(false);
      setGallerySuccess(true);
      setTimeout(() => setGallerySuccess(false), 4000);
      loadGallery();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteGalleryItem = (id: string, title: string) => {
    mockDb.softDeleteGalleryImage(id, user?.name ?? 'Admin');
    audit('delete_gallery', title, id);
    loadGallery();
    loadAuditAndTrash();
  };

  const handleRestoreGalleryItem = (id: string) => {
    const restored = mockDb.restoreGalleryImage(id);
    if (restored) audit('restore_gallery', restored.title, id);
    loadGallery();
    loadAuditAndTrash();
  };

  const handleDeleteEvent = (id: string, title: string) => {
    mockDb.softDeleteEvent(id, user?.name ?? 'Admin');
    audit('delete_event', title, id);
    loadStats();
    loadAuditAndTrash();
  };

  const handleRestoreEvent = (id: string) => {
    const restored = mockDb.restoreEvent(id);
    if (restored) audit('restore_event', restored.title, id);
    loadStats();
    loadAuditAndTrash();
  };

  // Audit action labels
  const auditLabel: Record<string, string> = {
    approve_user: 'Approved user',
    delete_user: 'Deleted user',
    restore_user: 'Restored user',
    toggle_role: 'Changed role',
    create_event: 'Created event',
    delete_event: 'Deleted event',
    restore_event: 'Restored event',
    upload_gallery: 'Uploaded to gallery',
    delete_gallery: 'Deleted gallery item',
    restore_gallery: 'Restored gallery item',
    checkin: 'Checked in attendee',
    undo_checkin: 'Undid check-in',
  };

  const auditColor: Record<string, string> = {
    approve_user: '#4ade80',
    delete_user: '#f87171',
    restore_user: '#34d399',
    toggle_role: '#fbbf24',
    create_event: '#60a5fa',
    delete_event: '#f87171',
    restore_event: '#34d399',
    upload_gallery: '#a78bfa',
    delete_gallery: '#f87171',
    restore_gallery: '#34d399',
    checkin: '#4ade80',
    undo_checkin: '#fbbf24',
  };

  return (
    <div className="space-y-6 text-left">

      {/* ── ADMIN IDENTITY BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(220,38,38,0.08), rgba(234,88,12,0.05))",
        border: "1px solid rgba(220,38,38,0.2)",
        borderRadius: 14,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: "rgba(220,38,38,0.12)",
          border: "1px solid rgba(220,38,38,0.25)",
          display: "grid", placeItems: "center",
        }}>
          <ShieldAlert className="h-5 w-5" style={{ color: "#f87171" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fca5a5", fontFamily: "var(--font-outfit, 'Outfit')" }}>
              Admin Control Center
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              background: "rgba(220,38,38,0.15)", color: "#f87171",
              padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(220,38,38,0.3)",
            }}>
              Restricted
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
            Logged in as <strong style={{ color: "#fca5a5" }}>{user?.name}</strong> — all actions are audited and reversible.
          </p>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0, textAlign: "right" }}>
          <div style={{ color: "#f87171", fontWeight: 600 }}>{auditLog.length} actions</div>
          <div>in audit log</div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-800 gap-1">
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'analytics' ? "bg-rose-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}>
          <BarChart3 className="h-4 w-4" /> Analytics
        </button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'users' ? "bg-rose-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}>
          <UserCheck className="h-4 w-4" /> Manage Users
        </button>
        <button onClick={() => setActiveTab('events')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'events' ? "bg-rose-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}>
          <CalendarPlus className="h-4 w-4" /> Event Manager
        </button>
        <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'attendance' ? "bg-rose-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}>
          <ScanLine className="h-4 w-4" /> Attendance Scanner
        </button>
        <button onClick={() => setActiveTab('contributions')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'contributions' ? "bg-rose-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}>
          <Receipt className="h-4 w-4" /> Contributions Ledger
        </button>
        <button onClick={() => setActiveTab('gallery')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'gallery' ? "bg-rose-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}>
          <ImageIcon className="h-4 w-4" /> Gallery Uploader
        </button>
        <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'audit' ? "bg-amber-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}>
          <ClipboardList className="h-4 w-4" /> Audit Log
          {auditLog.length > 0 && <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">{auditLog.length}</span>}
        </button>
        <button onClick={() => setActiveTab('trash')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'trash' ? "bg-zinc-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}>
          <Trash2 className="h-4 w-4" /> Trash
          {(trashedUsers.length + trashedEvents.length + trashedGallery.length) > 0 && (
            <span className="bg-zinc-700 text-zinc-300 border border-zinc-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
              {trashedUsers.length + trashedEvents.length + trashedGallery.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-300">

          {/* ── TOP KPI ROW ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-rose-500/10 p-3.5 rounded-2xl text-rose-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-outfit text-white">{stats.alumni}</p>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">Alumni Members</p>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-orange-500/10 p-3.5 rounded-2xl text-orange-400">
                <CalendarPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-outfit text-white">{stats.events}</p>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">Total Events</p>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3.5 rounded-2xl text-emerald-400">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-outfit text-white">{stats.registrations}</p>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">Event Bookings</p>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-violet-500/10 p-3.5 rounded-2xl text-violet-400">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-outfit text-white">{stats.memories}</p>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">Memories Shared</p>
              </div>
            </div>
          </div>

          {/* Live Check-in & Catering Logistics Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Check-in Progression */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Check-in Progression</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Real-time attendee check-in completion ratio</p>
              </div>
              
              <div className="flex flex-col justify-center items-center py-4 space-y-3">
                {/* Visual Ratio Indicator */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className="stroke-zinc-855 fill-none" 
                      strokeWidth="8"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className="stroke-amber-500 fill-none transition-all duration-500" 
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (analytics.attendanceRate / 100))}`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-extrabold font-outfit text-white">
                      {analytics.attendanceRate}%
                    </span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest block mt-0.5">Arrived</span>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-400 font-light">
                  <strong className="font-semibold text-white">{analytics.checkedIn}</strong> out of <strong className="font-semibold text-white">{stats.registrations}</strong> verified attendees.
                </p>
              </div>
            </div>

            {/* Diet & Catering Logs */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Catering & Diet Demands</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Meal preparations requested vs actual check-ins</p>
              </div>

              <div className="space-y-4 py-2">
                {/* Vegetarian demand */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
                      Vegetarian Meals
                    </span>
                    <span className="text-zinc-400 font-light">
                      <strong className="text-white">{analytics.vegCheckedIn}</strong> / {analytics.vegCount} served
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all" 
                      style={{ width: `${analytics.vegCount > 0 ? (analytics.vegCheckedIn / analytics.vegCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Non-Vegetarian demand */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0" />
                      Non-Vegetarian Meals
                    </span>
                    <span className="text-zinc-400 font-light">
                      <strong className="text-white">{analytics.nonVegCheckedIn}</strong> / {analytics.nonVegCount} served
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all" 
                      style={{ width: `${analytics.nonVegCount > 0 ? (analytics.nonVegCheckedIn / analytics.nonVegCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Session Schedule Demands */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Session Schedule Demands</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Active member seat allocations by track activity</p>
              </div>

              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                {Object.keys(analytics.activityDemands).length > 0 ? (
                  Object.entries(analytics.activityDemands)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => {
                      const totalRegs = stats.registrations || 1;
                      const pct = Math.round((count / totalRegs) * 100);
                      return (
                        <div key={name} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-zinc-300 truncate font-light max-w-[170px] block">{name}</span>
                            <span className="text-zinc-400 font-semibold shrink-0">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-900">
                            <div 
                              className="bg-violet-500 h-full rounded-full transition-all" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-zinc-650 text-xs italic text-center py-6">No session allocations tracked.</p>
                )}
              </div>
            </div>

          </div>

          {/* ── SECTION DIVIDER ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-900" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Batch-wise Breakdown</span>
            <div className="h-px flex-1 bg-zinc-900" />
          </div>

          {/* ── ALUMNI COUNT BY BATCH ── */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Alumni Registered — By Batch Year</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Total alumni accounts registered, grouped by graduation class</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white font-outfit">{batchAnalytics.reduce((s, b) => s + b.alumniCount, 0)}</span>
                <span className="text-[10px] text-zinc-500 block">Total Alumni</span>
              </div>
            </div>
            <div className="space-y-3">
              {batchAnalytics.length > 0 ? batchAnalytics.map((b, i) => {
                const maxCount = Math.max(...batchAnalytics.map(x => x.alumniCount), 1);
                const pct = Math.round((b.alumniCount / maxCount) * 100);
                const colors = ['bg-violet-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'];
                return (
                  <div key={b.batch} className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-zinc-300 w-24 shrink-0">Class of {b.batch}</span>
                    <div className="flex-1 bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-900">
                      <div
                        className={`${colors[i % colors.length]} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white w-6 text-right shrink-0">{b.alumniCount}</span>
                  </div>
                );
              }) : (
                <p className="text-zinc-600 text-xs italic text-center py-4">No batch data available yet.</p>
              )}
            </div>
          </div>

          {/* ── FUNDS RAISED BY BATCH ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Funds Raised — By Batch</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Total crowdfunding contributions per graduation class</p>
              </div>
              <div className="space-y-3">
                {batchAnalytics.length > 0 ? batchAnalytics.map((b) => {
                  const maxFunds = Math.max(...batchAnalytics.map(x => x.totalFunds), 1);
                  const pct = Math.round((b.totalFunds / maxFunds) * 100);
                  return (
                    <div key={b.batch} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-medium">Class of {b.batch}</span>
                        <span className="text-emerald-400 font-bold">₹{b.totalFunds.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                          style={{ width: b.totalFunds > 0 ? `${pct}%` : '2%' }}
                        />
                      </div>
                      {b.totalFunds > 0 && (
                        <p className="text-[10px] text-zinc-600 font-light">Avg contribution: ₹{b.avgFunds.toLocaleString()} per donor</p>
                      )}
                    </div>
                  );
                }) : (
                  <p className="text-zinc-600 text-xs italic text-center py-4">No contribution data yet.</p>
                )}
              </div>
            </div>

            {/* ── EVENT REGISTRATIONS BY BATCH ── */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Event Participation — By Batch</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Total event ticket bookings made per class</p>
              </div>
              <div className="space-y-3">
                {batchAnalytics.length > 0 ? batchAnalytics.map((b, i) => {
                  const maxRegs = Math.max(...batchAnalytics.map(x => x.eventRegistrations), 1);
                  const pct = Math.round((b.eventRegistrations / maxRegs) * 100);
                  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-sky-500', 'bg-indigo-500', 'bg-cyan-500'];
                  return (
                    <div key={b.batch} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-medium">Class of {b.batch}</span>
                        <span className="text-white font-bold">{b.eventRegistrations} registrations</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                        <div
                          className={`${colors[i % colors.length]} h-full rounded-full transition-all duration-700`}
                          style={{ width: b.eventRegistrations > 0 ? `${pct}%` : '2%' }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-zinc-600 text-xs italic text-center py-4">No event data yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── FULL ENGAGEMENT TABLE ── */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Comprehensive Batch Engagement Report</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">All metrics across every graduation batch on one table</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Batch</th>
                    <th className="pb-3 pr-4">Alumni</th>
                    <th className="pb-3 pr-4">Total Funds</th>
                    <th className="pb-3 pr-4">Event Bookings</th>
                    <th className="pb-3 pr-4">Memories</th>
                    <th className="pb-3 pr-4">Jobs Posted</th>
                    <th className="pb-3">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-zinc-300 font-light">
                  {batchAnalytics.length > 0 ? batchAnalytics.map((b) => (
                    <tr key={b.batch} className="hover:bg-zinc-900/10 group">
                      <td className="py-4 pr-4">
                        <span className="font-bold text-white text-sm">Class of {b.batch}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-semibold text-white">{b.alumniCount}</span>
                        <span className="text-zinc-600 ml-1">members</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-semibold text-emerald-400">₹{b.totalFunds.toLocaleString()}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-semibold text-white">{b.eventRegistrations}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-semibold text-white">{b.memoriesPosted}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-semibold text-white">{b.jobsPosted}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-900">
                            <div
                              className="bg-gradient-to-r from-violet-500 to-amber-500 h-full rounded-full"
                              style={{ width: `${Math.min(b.engagementScore, 100)}%` }}
                            />
                          </div>
                          <span className={`font-bold text-xs ${
                            b.engagementScore >= 30 ? 'text-emerald-400' :
                            b.engagementScore >= 15 ? 'text-amber-400' : 'text-zinc-500'
                          }`}>{b.engagementScore}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center italic text-zinc-600">Register alumni accounts to see batch analytics.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── SECTION DIVIDER ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-900" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Event Metrics</span>
            <div className="h-px flex-1 bg-zinc-900" />
          </div>

          {/* Live Check-in & Catering Logistics Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Check-in Progression */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Check-in Progression</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Real-time attendee check-in completion ratio</p>
              </div>
              <div className="flex flex-col justify-center items-center py-4 space-y-3">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-zinc-855 fill-none" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40"
                      className="stroke-amber-500 fill-none transition-all duration-500"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (analytics.attendanceRate / 100))}`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-extrabold font-outfit text-white">{analytics.attendanceRate}%</span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest block mt-0.5">Arrived</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 font-light">
                  <strong className="font-semibold text-white">{analytics.checkedIn}</strong> out of <strong className="font-semibold text-white">{stats.registrations}</strong> verified attendees.
                </p>
              </div>
            </div>

            {/* Diet & Catering Logs */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Catering &amp; Diet Demands</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Meal preparations requested vs actual check-ins</p>
              </div>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
                      Vegetarian Meals
                    </span>
                    <span className="text-zinc-400 font-light">
                      <strong className="text-white">{analytics.vegCheckedIn}</strong> / {analytics.vegCount} served
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                    <div className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${analytics.vegCount > 0 ? (analytics.vegCheckedIn / analytics.vegCount) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0" />
                      Non-Vegetarian Meals
                    </span>
                    <span className="text-zinc-400 font-light">
                      <strong className="text-white">{analytics.nonVegCheckedIn}</strong> / {analytics.nonVegCount} served
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                    <div className="bg-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${analytics.nonVegCount > 0 ? (analytics.nonVegCheckedIn / analytics.nonVegCount) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Session Schedule Demands */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">Session Schedule Demands</h3>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Active member seat allocations by track activity</p>
              </div>
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                {Object.keys(analytics.activityDemands).length > 0 ? (
                  Object.entries(analytics.activityDemands)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => {
                      const totalRegs = stats.registrations || 1;
                      const pct = Math.round((count / totalRegs) * 100);
                      return (
                        <div key={name} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-zinc-300 truncate font-light max-w-[170px] block">{name}</span>
                            <span className="text-zinc-400 font-semibold shrink-0">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-900">
                            <div className="bg-violet-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-zinc-650 text-xs italic text-center py-6">No session allocations tracked.</p>
                )}
              </div>
            </div>

          </div>

          {/* Latest Ticket Registrations */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-base font-bold font-outfit text-white mb-4">Latest Ticket Registrations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-light text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-950 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-left">
                    <th className="pb-3">Attendee Name</th>
                    <th className="pb-3">Event Reference</th>
                    <th className="pb-3">Catering Preference</th>
                    <th className="pb-3">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {mockDb.getRegistrations().length > 0 ? (
                    mockDb.getRegistrations().slice(-5).reverse().map((reg) => (
                      <tr key={reg.id}>
                        <td className="py-3.5 font-semibold text-white">{reg.userName}</td>
                        <td className="py-3.5">{reg.eventId}</td>
                        <td className="py-3.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            reg.foodPreference === 'Veg' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          }`}>
                            {reg.foodPreference}
                          </span>
                        </td>
                        <td className="py-3.5">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center italic text-zinc-600">No registrations recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EVENT MANAGER */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Create Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCreateEvent} className="glass-card rounded-2xl p-6 md:p-8 space-y-4">
              <h3 className="text-base font-bold font-outfit text-white pb-3 border-b border-zinc-900">Compile New Event</h3>
              
              {eventSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-1.5 font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                  Event compiled and launched successfully!
                </div>
              )}

              {eventError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-xs">
                  {eventError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Alumni Homecoming 2026"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Description / Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe details, guest speakers, target batches..."
                  rows={4}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Venue Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Campus Auditorium, Zoom Link, etc."
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={eventCapacity}
                    onChange={(e) => setEventCapacity(e.target.value)}
                    placeholder="e.g. 300"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
                    required
                  />
                </div>
              </div>

              {/* Activity Checklist Builder */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Add Schedule Activities Checklist
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentActivity}
                    onChange={(e) => setCurrentActivity(e.target.value)}
                    placeholder="e.g. Campus Tour, Gala Dinner"
                    className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-white font-light"
                  />
                  <button
                    type="button"
                    onClick={addActivity}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 rounded-xl flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {activities.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {activities.map((act, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-900 text-xs font-light text-zinc-300">
                        <span className="truncate">{act}</span>
                        <button
                          type="button"
                          onClick={() => removeActivity(idx)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
              >
                Compile and Launch Event
              </button>
            </form>
          </div>

          {/* Quick List preview */}
          <div className="glass-card rounded-2xl p-6 h-fit space-y-4">
            <h4 className="text-sm font-bold font-outfit text-white">Current Launches ({mockDb.getEvents().length})</h4>
            <div className="space-y-3">
              {mockDb.getEvents().map((e) => {
                const initialCap = e.capacity ?? 300;
                const remaining = mockRedis.getCounter(`event-capacity:${e.id}`, initialCap);
                const waitlistedUids = mockRedis.zrange(`event-waitlist:${e.id}`);

                return (
                  <div key={e.id} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs text-left space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h5 className="font-semibold text-white truncate">{e.title}</h5>
                        <div className="flex items-center gap-1 text-zinc-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(e.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{e.location}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(e.id, e.title)}
                        title="Move to Trash"
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-zinc-900/60 flex justify-between text-[10px] text-zinc-400">
                      <span>
                        Seats: <strong className={remaining > 0 ? "text-emerald-400" : "text-amber-500"}>{remaining}</strong> / {initialCap}
                      </span>
                      <span>
                        Waitlist: <strong className="text-amber-400">{waitlistedUids.length}</strong>
                      </span>
                    </div>

                    {waitlistedUids.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-zinc-900/40 space-y-1 bg-zinc-950/20 p-2 rounded-lg">
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">Waitlist Queue:</span>
                        <ol className="list-decimal list-inside space-y-0.5 text-[9px] text-zinc-400">
                          {waitlistedUids.map((uid, idx) => {
                            const name = mockDb.getUserById(uid)?.name || "Unknown";
                            return (
                              <li key={uid} className="truncate">
                                <span className="text-zinc-300 font-medium">{name}</span>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GALLERY UPLOADER */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Upload card */}
          <div className="lg:col-span-1">
            <form onSubmit={handleUploadGallery} className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold font-outfit text-white pb-3 border-b border-zinc-900">Upload to Gallery</h3>

              {gallerySuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                  Media uploaded to 'gallery/' storage path!
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Media Title
                </label>
                <input
                  type="text"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  placeholder="e.g. Graduation Ceremony 2025"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white font-light"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Media Type
                  </label>
                  <select
                    value={galleryType}
                    onChange={(e) => setGalleryType(e.target.value as any)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Target Batch
                  </label>
                  <select
                    value={galleryBatch}
                    onChange={(e) => setGalleryBatch(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="All">All Batches</option>
                    <option value="2020">Class of 2020</option>
                    <option value="2021">Class of 2021</option>
                    <option value="2022">Class of 2022</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Album Category
                </label>
                <select
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value as any)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="2026 Reunion">2026 Reunion</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Batch Photos">Batch Photos</option>
                </select>
              </div>

              {/* Special options for Video */}
              {galleryType === "video" && (
                <div className="flex items-center gap-2 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                  <input
                    type="checkbox"
                    id="sampleVideo"
                    checked={useSampleVideo}
                    onChange={(e) => setUseSampleVideo(e.target.checked)}
                    className="rounded text-primary focus:ring-primary border-zinc-800"
                  />
                  <label htmlFor="sampleVideo" className="text-[10px] text-zinc-400 cursor-pointer">
                    Use Mixkit Stream Placeholder Video
                  </label>
                </div>
              )}

              {/* Drag and drop input */}
              {!(galleryType === "video" && useSampleVideo) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Choose Media File
                  </label>
                  <div className="relative border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-950/20 cursor-pointer">
                    {galleryFilePreview ? (
                      <div className="w-full relative">
                        {galleryType === "photo" ? (
                          <img
                            src={galleryFilePreview}
                            alt="Preview"
                            className="h-32 w-full object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={galleryFilePreview}
                            controls
                            className="h-32 w-full object-cover rounded-lg"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => { setGalleryFilePreview(null); }}
                          className="absolute top-2 right-2 bg-zinc-950/85 p-1 rounded-full text-zinc-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-zinc-600 mb-2" />
                        <span className="text-[10px] text-zinc-400 font-light">Drag & drop or Click to select</span>
                        <input
                          type="file"
                          accept={galleryType === "photo" ? "image/*" : "video/*"}
                          onChange={handleGalleryFile}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          required
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || (!galleryFilePreview && !(galleryType === 'video' && useSampleVideo)) || !galleryTitle}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Publish to Gallery</span>
                )}
              </button>
            </form>
          </div>

          {/* Gallery View */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <h4 className="text-sm font-bold font-outfit text-white mb-4">Official Gallery Preview</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {galleryImages.map((img) => (
                <div key={img.id} className="relative rounded-xl overflow-hidden group border border-zinc-900 aspect-square bg-zinc-900 flex items-center justify-center">
                  {img.type === "video" ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                      <video src={img.url} muted className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-left z-20">
                    <p className="text-[10px] font-bold text-white leading-normal truncate">{img.title}</p>
                    <span className="text-[8px] text-zinc-400 font-light mt-0.5 block">
                      {img.category} ({img.type})
                    </span>
                    <button
                      onClick={() => handleDeleteGalleryItem(img.id, img.title)}
                      className="mt-1.5 self-start flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-bold hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 className="h-2.5 w-2.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-base font-bold font-outfit text-white mb-4">User Registrations Manager</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-light text-zinc-400 text-left">
                <thead>
                  <tr className="border-b border-zinc-950 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3">User Profile</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Requested Role</th>
                    <th className="pb-3">Approval Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-zinc-300">
                  {usersList.length > 0 ? (
                    usersList.map((usr) => (
                      <tr key={usr.uid} className="hover:bg-zinc-900/10">
                        <td className="py-3.5 pr-4 flex items-center gap-3">
                          {usr.photoUrl ? (
                            <img src={usr.photoUrl} alt={usr.name} className="w-8 h-8 rounded-full object-cover border border-zinc-800" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                              {usr.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-white block">{usr.name}</span>
                            <span className="text-[10px] text-zinc-500 font-light">
                              {usr.batch ? `${usr.branch} (Batch of ${usr.batch})` : "General Member"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-zinc-450">{usr.email}</td>
                        <td className="py-3.5 pr-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            usr.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-primary/10 text-violet-400 border border-primary/20'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          {usr.isActive ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle className="h-3.5 w-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="text-amber-500 flex items-center gap-1 font-semibold">
                              <Clock className="h-3.5 w-3.5 animate-pulse" /> Pending Approval
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          {!usr.isActive && (
                            <button
                              onClick={() => handleApproveUser(usr.uid)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {usr.uid !== "mock-admin" && (
                            <>
                              <button
                                onClick={() => handleToggleRole(usr.uid, usr.role)}
                                className="px-2.5 py-1 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-350 border border-zinc-800 text-[10px] font-semibold transition-colors"
                              >
                                Toggle Role
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usr.uid)}
                                className="p-1 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-rose-500 transition-colors inline-flex items-center justify-center align-middle"
                                title="Delete User"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center italic text-zinc-650">
                        No registrations recorded in DB.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ATTENDANCE SCANNER */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Scanner Simulation Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-4 relative overflow-hidden">
              
              {/* Local Scan Animation Style Tag */}
              <style>{`
                @keyframes scannerLaser {
                  0%, 100% { top: 4%; }
                  50% { top: 96%; }
                }
                .scanner-hud-line {
                  animation: scannerLaser 3s ease-in-out infinite;
                }
              `}</style>

              <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                <QrCode className="h-5 w-5 text-rose-500" />
                <h3 className="text-base font-bold font-outfit text-white">QR Ticket Stub Scanner</h3>
              </div>

              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Scan attendee tickets using their Unique Ticket ID to log attendance and unlock their printable certificates.
              </p>

              {/* Viewfinder Lens Simulator HUD */}
              <div className="relative aspect-[4/3] rounded-xl bg-zinc-950 border border-zinc-850/80 overflow-hidden flex flex-col items-center justify-center">
                
                {/* Crop corners */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-zinc-650 rounded-tl" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-zinc-650 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-zinc-650 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-zinc-650 rounded-br" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-[0.03] pointer-events-none">
                  <div className="border border-white" /><div className="border border-white" /><div className="border border-white" />
                  <div className="border border-white" /><div className="border border-white" /><div className="border border-white" />
                  <div className="border border-white" /><div className="border border-white" /><div className="border border-white" />
                </div>

                {/* Animating Laser Scan Bar */}
                <div className={`absolute left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.85)] scanner-hud-line z-10 ${isScanning ? "bg-emerald-400 shadow-[0_0_15px_4px_rgba(52,211,153,0.95)]" : ""}`} />

                {/* Inner target frame */}
                <div className={`w-32 h-32 border border-dashed rounded-lg flex items-center justify-center transition-all ${isScanning ? "border-emerald-400 bg-emerald-500/5" : "border-zinc-700 bg-zinc-900/10"}`}>
                  <QrCode className={`h-16 w-16 transition-all ${isScanning ? "text-emerald-400 scale-110 animate-pulse" : "text-zinc-600"}`} />
                </div>

                {/* Scan Status Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 animate-in fade-in duration-100">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-500 mb-2" />
                    <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">Reading QR Token...</span>
                  </div>
                )}
              </div>

              {/* Scan Message Results */}
              {scanResultMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-light border flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-300 ${
                  scanResultMsg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                    : 'bg-rose-500/10 border-rose-500/25 text-rose-450 shadow-lg shadow-rose-500/5'
                }`}>
                  <div className="mt-0.5 shrink-0">
                    {scanResultMsg.type === 'success' ? (
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold leading-normal">{scanResultMsg.type === 'success' ? 'Scan Completed' : 'Validation Failed'}</p>
                    <p className="text-[11px] text-zinc-300 leading-normal">{scanResultMsg.text}</p>
                  </div>
                </div>
              )}

              {/* Quick Select Dropdown */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Quick Select Awaiting Member
                  </label>
                  <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                    {registrationsList.filter(r => !r.isCheckedIn).length} left
                  </span>
                </div>
                <select
                  value={ticketCodeInput}
                  onChange={(e) => setTicketCodeInput(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="" className="bg-zinc-955 text-zinc-400 font-light">-- Select Member Awaiting Check-in --</option>
                  {registrationsList.filter(r => !r.isCheckedIn).map((reg) => (
                    <option key={reg.id} value={reg.qrCodeData} className="bg-zinc-950 text-zinc-200">
                      {reg.userName} ({reg.qrCodeData.slice(-8)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Input manual code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Manual Ticket Token Code
                </label>
                <div className="relative">
                  <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-4.5 w-4.5" />
                  <input
                    type="text"
                    placeholder="e.g. ALUMNI-PASS-..."
                    value={ticketCodeInput}
                    onChange={(e) => setTicketCodeInput(e.target.value)}
                    className="w-full glass-input rounded-xl pl-10.5 pr-4 py-2.5 text-xs text-white font-mono placeholder-zinc-700 outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              <button
                onClick={() => handleScanCode()}
                disabled={!ticketCodeInput.trim() || isScanning}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-rose-600/10"
              >
                <QrCode className="h-4.5 w-4.5" />
                <span>Simulate Scan Pass</span>
              </button>
            </div>
          </div>

          {/* Registrations List check-in controls */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
              <h4 className="text-sm font-bold font-outfit text-white">Event Bookings Check-In List</h4>
              <span className="text-[10px] text-zinc-500 font-mono">
                {registrationsList.filter(r => r.isCheckedIn).length} / {registrationsList.length} Checked In
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-light text-zinc-400 text-left">
                <thead>
                  <tr className="border-b border-zinc-950 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3">Attendee</th>
                    <th className="pb-3">Ticket ID</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-zinc-350">
                  {registrationsList.length > 0 ? (
                    [...registrationsList].reverse().map((reg) => (
                      <tr key={reg.id} className="hover:bg-zinc-900/10">
                        <td className="py-3.5 pr-4 font-semibold text-white">
                          <div>
                            <span className="block">{reg.userName}</span>
                            <span className="text-[9px] text-zinc-500 font-mono block truncate max-w-48">{reg.userEmail}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-[10px] text-zinc-500">{reg.qrCodeData}</td>
                        <td className="py-3.5 pr-4">
                          {reg.isCheckedIn ? (
                            <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Checked In
                            </span>
                          ) : (
                            <span className="text-amber-500 font-semibold inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> Awaiting
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          {!reg.isCheckedIn ? (
                            <button
                              onClick={() => handleScanCode(reg.qrCodeData)}
                              className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white font-semibold text-[10px] py-1.5 px-3 rounded-lg transition-colors"
                            >
                              Scan Stub
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[10px] text-emerald-500/80 font-mono">
                                {new Date(reg.checkedInAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                onClick={() => handleUndoCheckIn(reg.id, reg.userName)}
                                title="Undo check-in"
                                className="p-1 rounded-lg text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                              >
                                <Undo2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center italic text-zinc-650">
                        No registrations booked yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONTRIBUTIONS AUDIT LEDGER */}
      {activeTab === 'contributions' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3.5 rounded-2xl text-emerald-400">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-outfit text-white">
                  ₹{contributionsList.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                </p>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">Total Campaign Funds</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-primary/10 p-3.5 rounded-2xl text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-outfit text-white">{contributionsList.length}</p>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">Total Patrons</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-amber-500/10 p-3.5 rounded-2xl text-amber-400">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-outfit text-white">
                  ₹{(contributionsList.length > 0 
                    ? Math.round(contributionsList.reduce((sum, c) => sum + c.amount, 0) / contributionsList.length) 
                    : 0).toLocaleString()}
                </p>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">Average Contribution</p>
              </div>
            </div>
          </div>

          {/* Full Transaction list */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-base font-bold font-outfit text-white mb-4">Official Contributions Audit Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-light text-zinc-400 text-left">
                <thead>
                  <tr className="border-b border-zinc-950 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3">Contributor</th>
                    <th className="pb-3">Transaction Token ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-zinc-350">
                  {contributionsList.length > 0 ? (
                    contributionsList.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/10">
                        <td className="py-3.5 pr-4 font-semibold text-white">{item.userName}</td>
                        <td className="py-3.5 pr-4 font-mono text-zinc-500">{item.txToken}</td>
                        <td className="py-3.5 pr-4">{new Date(item.date).toLocaleString()}</td>
                        <td className="py-3.5 text-right font-semibold text-emerald-400">
                          ₹{item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center italic text-zinc-650">
                        No financial contributions recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-outfit, 'Outfit')" }}>Admin Audit Log</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Every admin action recorded with timestamp — most recent first.</p>
            </div>
            <span className="text-xs text-zinc-500">{auditLog.length} entries</span>
          </div>

          {auditLog.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <ClipboardList className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-600 text-sm">No actions recorded yet. Actions appear here as you manage the portal.</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Target</th>
                    <th className="px-5 py-3">Admin</th>
                    <th className="px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-900/20">
                      <td className="px-5 py-3">
                        <span style={{
                          color: auditColor[entry.action] ?? '#a1a1aa',
                          fontWeight: 600,
                        }}>
                          {auditLabel[entry.action] ?? entry.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-300">{entry.target}</td>
                      <td className="px-5 py-3 text-zinc-400">{entry.adminName}</td>
                      <td className="px-5 py-3 text-zinc-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: TRASH / RESTORE */}
      {activeTab === 'trash' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-outfit, 'Outfit')" }}>Trash — Restore Deleted Items</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Soft-deleted items are held here. Restore them at any time.</p>
          </div>

          {/* Deleted Users */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-rose-400" /> Deleted Users ({trashedUsers.length})
            </h4>
            {trashedUsers.length === 0 ? (
              <p className="text-zinc-600 text-xs italic">No deleted users.</p>
            ) : (
              <div className="space-y-2">
                {trashedUsers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-white truncate block">{t.data.name}</span>
                      <span className="text-[11px] text-zinc-500">{t.data.email} · Deleted {new Date(t.deletedAt).toLocaleDateString()} by {t.deletedBy}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreUser(t.data.uid)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all shrink-0"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deleted Events */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <CalendarPlus className="h-3.5 w-3.5 text-orange-400" /> Deleted Events ({trashedEvents.length})
            </h4>
            {trashedEvents.length === 0 ? (
              <p className="text-zinc-600 text-xs italic">No deleted events.</p>
            ) : (
              <div className="space-y-2">
                {trashedEvents.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-white truncate block">{t.data.title}</span>
                      <span className="text-[11px] text-zinc-500">{t.data.location} · Deleted {new Date(t.deletedAt).toLocaleDateString()} by {t.deletedBy}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreEvent(t.data.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all shrink-0"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deleted Gallery */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5 text-violet-400" /> Deleted Gallery Items ({trashedGallery.length})
            </h4>
            {trashedGallery.length === 0 ? (
              <p className="text-zinc-600 text-xs italic">No deleted gallery items.</p>
            ) : (
              <div className="space-y-2">
                {trashedGallery.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-white truncate block">{t.data.title}</span>
                      <span className="text-[11px] text-zinc-500">{t.data.category} · {t.data.type} · Deleted {new Date(t.deletedAt).toLocaleDateString()} by {t.deletedBy}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreGalleryItem(t.data.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all shrink-0"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
