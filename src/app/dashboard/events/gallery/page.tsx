"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockEvent, MockGalleryImage } from "@/lib/mockDb";
import { 
  ArrowLeft, 
  Loader2, 
  Camera, 
  Film, 
  Image as ImageIcon, 
  Play, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  User, 
  Upload, 
  CheckCircle,
  Plus
} from "lucide-react";
import Link from "next/link";

function EventGalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [media, setMedia] = useState<MockGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter tab: "view" vs "upload"
  const [activeSubTab, setActiveSubTab] = useState<'view' | 'upload'>('view');

  // Upload state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [category, setCategory] = useState<'2026 Reunion' | 'Sports' | 'Cultural' | 'Batch Photos'>('2026 Reunion');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [useSampleVideo, setUseSampleVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Progressive paging limits to avoid memory/rendering chokes
  const [visibleCount, setVisibleCount] = useState(8);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const events = mockDb.getEvents();
    const foundEvent = events.find((e) => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
      loadMedia(eventId);
    }
    setLoading(false);
  }, [eventId]);

  const loadMedia = (id: string) => {
    const allMedia = mockDb.getGalleryImages();
    // Filter media specifically uploaded for this event
    const eventMedia = allMedia.filter((img) => img.eventId === id);
    setMedia(eventMedia);
  };

  // Reset page pagination on subtab changes
  useEffect(() => {
    setVisibleCount(8);
  }, [activeSubTab]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit crowdsourced media
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !user) return;

    let finalUrl = filePreview;
    if (type === 'video' && useSampleVideo) {
      finalUrl = "https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-raising-toast-at-dinner-party-40243-large.mp4";
    }

    if (!finalUrl || !title) {
      alert("Please choose a file or select the sample video option.");
      return;
    }

    setIsUploading(true);

    try {
      mockDb.uploadGalleryImage(
        finalUrl,
        title,
        type,
        category,
        user.batch || "All",
        eventId,
        user.name,
        user.uid
      );

      // Reset Form
      setTitle("");
      setFilePreview(null);
      setUseSampleVideo(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
      
      // Reload Media & Switch Tab
      loadMedia(eventId);
      setActiveSubTab('view');
    } catch (err) {
      console.error("Failed to share event photo", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Lightbox navigation
  const handlePrevMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null || media.length === 0) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNextMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null || media.length === 0) return;
    setLightboxIndex((prev) => (prev !== null && prev < media.length - 1 ? prev + 1 : 0));
  };

  // Keyboard events hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") handlePrevMedia();
      if (e.key === "ArrowRight") handleNextMedia();
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, media]);

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2 text-zinc-400 text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Bootstrapping event photo album...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center text-zinc-500 max-w-md mx-auto">
        <X className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="font-outfit font-bold text-white text-lg">Album Not Found</h3>
        <p className="text-xs font-light mt-1 mb-6">
          The event ID specified does not exist or has been removed.
        </p>
        <Link
          href="/dashboard/events"
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
        >
          Return to Event Hub
        </Link>
      </div>
    );
  }

  const visibleMedia = media.slice(0, visibleCount);
  const hasMore = media.length > visibleCount;

  return (
    <div className="space-y-6 text-left pb-12 font-outfit">
      {/* Return Navigation */}
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event Hub
      </Link>

      {/* Header Context Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border-violet-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-450 border border-amber-500/25">
            Event Photo Album
          </span>
          <h1 className="text-xl md:text-2xl font-bold font-outfit text-white leading-tight">
            {event.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-xs font-light text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-zinc-550 shrink-0" />
              <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-zinc-550 shrink-0" />
              <span className="truncate max-w-[200px]">{event.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-zinc-550 shrink-0" />
              <span>Coordinated by: <strong>{event.coordinator}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Actions */}
        <div className="flex gap-2 bg-zinc-950/40 p-1 border border-zinc-900 rounded-2xl shrink-0 self-stretch md:self-auto">
          <button
            onClick={() => setActiveSubTab('view')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'view'
                ? "bg-white text-zinc-950"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Browse Media ({media.length})
          </button>
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'upload'
                ? "bg-white text-zinc-950"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Plus className="h-4 w-4" />
            Share Photos
          </button>
        </div>
      </div>

      {/* Subtab 1: VIEW MEDIA FEED */}
      {activeSubTab === 'view' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {visibleMedia.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleMedia.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 rounded-2xl overflow-hidden aspect-square cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
                  >
                    {/* Media Body */}
                    <div className="relative w-full h-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                      {item.type === "photo" ? (
                        <img
                          src={item.url}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 z-10 transition-colors flex items-center justify-center">
                            <div className="bg-primary/20 backdrop-blur-md p-3 rounded-full text-white border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                              <Play className="h-5 w-5 fill-current" />
                            </div>
                          </div>
                          <video
                            src={item.url}
                            muted
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Attribute credits */}
                      {item.uploadedBy && (
                        <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md text-zinc-400 border border-zinc-850 text-[9px] px-2.5 py-0.5 rounded-full z-15 font-light">
                          By: {item.uploadedBy}
                        </span>
                      )}

                      <span className="absolute top-3 right-3 bg-amber-500/10 backdrop-blur-md text-amber-450 border border-amber-500/20 text-[9px] px-2.5 py-0.5 rounded-full z-15 font-mono">
                        {item.category}
                      </span>
                    </div>

                    {/* Bottom detail block */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 text-left z-20">
                      <h4 className="text-white font-bold text-xs truncate group-hover:text-amber-500 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-zinc-550 text-[10px] font-light mt-1">
                        {item.type === 'photo' ? (
                          <Camera className="h-3 w-3" />
                        ) : (
                          <Film className="h-3 w-3" />
                        )}
                        <span className="capitalize">{item.type}</span>
                        <span>•</span>
                        <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paging */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-white font-semibold text-xs py-3 px-8 rounded-xl transition-all shadow-md"
                  >
                    Load More Photos ({media.length - visibleCount} left)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/10 border border-zinc-900 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center">
              <div className="bg-zinc-900 p-4 rounded-full text-zinc-650 mb-4">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="text-white font-semibold text-base font-outfit">Gallery Empty</h3>
              <p className="text-zinc-500 text-xs font-light mt-1 max-w-sm">
                No memories have been uploaded for this reunion yet. Be the first to share your college photos!
              </p>
              <button
                onClick={() => setActiveSubTab('upload')}
                className="mt-6 bg-primary hover:bg-violet-750 text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition-colors"
              >
                Upload Photo Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: UPLOAD MEMORIES FORM */}
      {activeSubTab === 'upload' && (
        <div className="max-w-xl mx-auto animate-in fade-in duration-300">
          <form onSubmit={handleUpload} className="glass-card rounded-3xl p-6 md:p-8 space-y-5 text-left">
            <div>
              <h3 className="text-base font-bold font-outfit text-white border-b border-zinc-900 pb-3">Share Event Memories</h3>
              <p className="text-zinc-500 text-xs font-light mt-1.5 leading-relaxed">
                Add photos and video snippets you took during the event. Media will be visible to all alumni on the portal.
              </p>
            </div>

            {uploadSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                Memory published successfully to the event album!
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Caption Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reunion Dinner Toast with Batch of 2022"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Media Format
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video snippet</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Album Folder Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="2026 Reunion">2026 Reunion</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Batch Photos">Batch Photos</option>
                </select>
              </div>
            </div>

            {/* Video stream options */}
            {type === 'video' && (
              <div className="flex items-center gap-2 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                <input
                  type="checkbox"
                  id="albumVideo"
                  checked={useSampleVideo}
                  onChange={(e) => setUseSampleVideo(e.target.checked)}
                  className="rounded text-primary focus:ring-primary border-zinc-800"
                />
                <label htmlFor="albumVideo" className="text-[10px] text-zinc-450 cursor-pointer">
                  Use Mixkit Toast Video stream template
                </label>
              </div>
            )}

            {/* Selector box */}
            {!(type === 'video' && useSampleVideo) && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Select Photo/Video File
                </label>
                <div className="relative border-2 border-dashed border-zinc-850 hover:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-950/20 cursor-pointer">
                  {filePreview ? (
                    <div className="w-full relative">
                      {type === "photo" ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="h-36 w-full object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={filePreview}
                          controls
                          className="h-36 w-full object-cover rounded-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setFilePreview(null)}
                        className="absolute top-2 right-2 bg-zinc-950/85 p-1 rounded-full text-zinc-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-zinc-650 mb-2 animate-pulse" />
                      <span className="text-[10px] text-zinc-450 font-light">Drag & drop or Click to select</span>
                      <input
                        type="file"
                        accept={type === 'photo' ? 'image/*' : 'video/*'}
                        onChange={handleFileChange}
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
              disabled={isUploading || (!filePreview && !(type === 'video' && useSampleVideo))}
              className="w-full bg-primary hover:bg-violet-750 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Publish to Event Album</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Swipeable Lightbox Modal */}
      {lightboxIndex !== null && media[lightboxIndex] && (
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-zinc-950/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-250"
        >
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-50">
            <div className="text-left">
              <h3 className="text-white font-bold text-sm md:text-base leading-tight">
                {media[lightboxIndex].title}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1 font-light">
                {media[lightboxIndex].uploadedBy && (
                  <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-medium">Contributed by: {media[lightboxIndex].uploadedBy}</span>
                )}
                <span className="bg-primary/20 text-blue-300 px-2 py-0.5 rounded font-medium">{media[lightboxIndex].category}</span>
                <span>•</span>
                <span>Uploaded: {new Date(media[lightboxIndex].uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Close */}
            <button 
              onClick={() => setLightboxIndex(null)}
              className="p-2.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Swipe Left Arrow */}
          <button 
            onClick={handlePrevMedia}
            className="absolute left-4 p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-white z-40 border border-zinc-800/20 transition-colors hidden sm:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Preview Frame */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full h-[65vh] md:h-[75vh] flex items-center justify-center relative select-none"
          >
            {media[lightboxIndex].type === "photo" ? (
              <img 
                src={media[lightboxIndex].url} 
                alt={media[lightboxIndex].title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-250"
              />
            ) : (
              <video
                key={media[lightboxIndex].id}
                src={media[lightboxIndex].url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-250"
              />
            )}
          </div>

          {/* Swipe Right Arrow */}
          <button 
            onClick={handleNextMedia}
            className="absolute right-4 p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-white z-40 border border-zinc-800/20 transition-colors hidden sm:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Mobile swipe controls */}
          <div className="absolute bottom-6 flex gap-4 sm:hidden">
            <button 
              onClick={handlePrevMedia}
              className="px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-850 text-white text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button 
              onClick={handleNextMedia}
              className="px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-850 text-white text-xs font-semibold flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventGalleryPage() {
  return (
    <Suspense fallback={
      <div className="py-16 flex items-center justify-center gap-2 text-zinc-400 text-sm animate-pulse">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Bootstrapping Event Gallery...
      </div>
    }>
      <EventGalleryContent />
    </Suspense>
  );
}
