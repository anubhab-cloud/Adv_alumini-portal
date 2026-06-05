"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockEvent, MockGalleryImage } from "@/lib/mockDb";
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
  X
} from "lucide-react";

export default function AdminControlCenter() {
  const { user, role } = useAuth();
  const router = useRouter();

  // Tab state: 'analytics' | 'events' | 'gallery'
  const [activeTab, setActiveTab] = useState<'analytics' | 'events' | 'gallery'>('analytics');

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

  // Gallery builder state
  const [galleryImages, setGalleryImages] = useState<MockGalleryImage[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryFilePreview, setGalleryFilePreview] = useState<string | null>(null);
  const [gallerySuccess, setGallerySuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (role === "admin") {
      loadStats();
      loadGallery();
    }
  }, [role]);

  const loadStats = () => {
    const allUsers = mockDb.getUsers().filter(u => u.role !== 'admin');
    const allEvents = mockDb.getEvents();
    const allMemories = mockDb.getMemories();
    const allRegs = mockDb.getRegistrations();

    setStats({
      alumni: allUsers.length,
      events: allEvents.length,
      memories: allMemories.length,
      registrations: allRegs.length
    });
  };

  const loadGallery = () => {
    setGalleryImages(mockDb.getGalleryImages());
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
      mockDb.createEvent({
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        coordinator: user?.name || "Admin Coordinator",
        activities
      });

      // Clear Form
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setActivities([]);
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
    if (!galleryFilePreview || !galleryTitle) return;

    setIsUploading(true);
    try {
      // Direct mock upload to gallery/ folder logic
      mockDb.uploadGalleryImage(galleryFilePreview, galleryTitle);
      
      setGalleryTitle("");
      setGalleryFilePreview(null);
      setGallerySuccess(true);
      setTimeout(() => setGallerySuccess(false), 4000);
      loadGallery();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-white leading-tight">
          Admin Control Center
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Monitor directory analytics, compile new events, and edit the official gallery files.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/40 p-1.5 rounded-xl border max-w-md">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? "bg-rose-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'events'
              ? "bg-rose-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <CalendarPlus className="h-4 w-4" />
          Event Manager
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'gallery'
              ? "bg-rose-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Gallery Uploader
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
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

          {/* Quick List view of bookings */}
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
                      <td colSpan={4} className="py-6 text-center italic text-zinc-600">
                        No registrations recorded yet.
                      </td>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {mockDb.getEvents().map((e) => (
                <div key={e.id} className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs text-left">
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
              ))}
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
                  Image uploaded to 'gallery/' storage path!
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Image Title
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

              {/* Drag and drop input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Choose Photo File
                </label>
                <div className="relative border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-950/20 cursor-pointer">
                  {galleryFilePreview ? (
                    <div className="w-full relative">
                      <img
                        src={galleryFilePreview}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg"
                      />
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
                        accept="image/*"
                        onChange={handleGalleryFile}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                      />
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading || !galleryFilePreview || !galleryTitle}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-800 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
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
                <div key={img.id} className="relative rounded-xl overflow-hidden group border border-zinc-900 aspect-square bg-zinc-900">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-left">
                    <p className="text-[10px] font-bold text-white leading-normal truncate">{img.title}</p>
                    <span className="text-[8px] text-zinc-400 font-light mt-0.5">
                      {new Date(img.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
