"use client";

import React, { useState, useEffect } from "react";
import { mockDb, MockGalleryImage } from "@/lib/mockDb";
import { useAuth } from "@/context/AuthContext";
import { 
  Camera, 
  Film, 
  Image as ImageIcon, 
  Play, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Tag, 
  Compass, 
  Grid
} from "lucide-react";

export default function GalleryPage() {
  const { user } = useAuth();
  const [media, setMedia] = useState<MockGalleryImage[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<string>("All");
  const [activeBatch, setActiveBatch] = useState<string>("All");
  const [activeType, setActiveType] = useState<string>("All");
  
  // Overload prevention - Paginated view
  const [visibleCount, setVisibleCount] = useState(8);
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const albums = ["All", "2026 Reunion", "Sports", "Cultural", "Batch Photos"];
  const batches = ["All", "2020", "2021", "2022"];

  useEffect(() => {
    setMedia(mockDb.getGalleryImages());
  }, []);

  const refreshGallery = () => {
    setMedia(mockDb.getGalleryImages());
  };

  // Reset pagination count on filter change
  useEffect(() => {
    setVisibleCount(8);
  }, [activeAlbum, activeBatch, activeType]);

  // Filtering Logic
  const filteredMedia = media.filter((item) => {
    const matchesAlbum = activeAlbum === "All" || item.category === activeAlbum;
    const matchesBatch = activeBatch === "All" || item.batch === activeBatch;
    const matchesType = activeType === "All" || item.type === activeType;
    return matchesAlbum && matchesBatch && matchesType;
  });

  const visibleMedia = filteredMedia.slice(0, visibleCount);
  const hasMore = filteredMedia.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  // Lightbox Navigation
  const handlePrevMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null || filteredMedia.length === 0) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredMedia.length - 1));
  };

  const handleNextMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex === null || filteredMedia.length === 0) return;
    setLightboxIndex((prev) => (prev !== null && prev < filteredMedia.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") handlePrevMedia();
      if (e.key === "ArrowRight") handleNextMedia();
      if (e.key === "Escape") setLightboxIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredMedia]);

  return (
    <div className="space-y-8 pb-12 font-outfit">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Event <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-zinc-400 text-sm font-light mt-1">
            Relive memories from reunions, cultural meets, sports competitions, and batch milestones.
          </p>
        </div>
      </div>

      {/* Filter Control Panels */}
      <div className="bg-zinc-900/20 border border-zinc-850 p-6 rounded-3xl space-y-4">
        {/* Row 1: Albums Tab Folder Selector */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Select Album Category</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {albums.map((alb) => (
              <button
                key={alb}
                onClick={() => setActiveAlbum(alb)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all duration-250 ${
                  activeAlbum === alb
                    ? "bg-white text-zinc-950 border-white font-semibold"
                    : "bg-zinc-900/50 text-zinc-400 border-zinc-850 hover:text-white hover:bg-zinc-850"
                }`}
              >
                {alb}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Batch Class Filter */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Filter by Class Year</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {batches.map((bat) => (
                <button
                  key={bat}
                  onClick={() => setActiveBatch(bat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    activeBatch === bat
                      ? "bg-primary text-white border-primary"
                      : "bg-zinc-900/30 text-zinc-450 border-zinc-850 hover:text-white hover:bg-zinc-850"
                  }`}
                >
                  {bat === "All" ? "All Batches" : `Class of ${bat}`}
                </button>
              ))}
            </div>
          </div>

          {/* Media Format Filter */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Format Type</span>
            <div className="flex gap-1.5">
              {["All", "photo", "video"].map((typ) => (
                <button
                  key={typ}
                  onClick={() => setActiveType(typ)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border capitalize transition-all duration-200 ${
                    activeType === typ
                      ? "bg-gradient-to-r from-primary to-amber-600 text-white border-transparent"
                      : "bg-zinc-900/30 text-zinc-450 border-zinc-850 hover:text-white hover:bg-zinc-850"
                  }`}
                >
                  {typ === "All" ? "All Formats" : `${typ}s`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Feed Grid */}
      {visibleMedia.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleMedia.map((item, index) => (
              <div 
                key={item.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 rounded-2xl overflow-hidden aspect-square cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between"
              >
                {/* Media Thumbnail Container */}
                <div className="relative w-full h-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                  {item.type === "photo" ? (
                    <img 
                      src={item.url} 
                      alt={item.title}
                      loading="lazy" // Prevents memory overloading
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    /* Video Thumbnail Overlay */
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 z-10 transition-colors flex items-center justify-center">
                        <div className="bg-primary/20 backdrop-blur-md p-3 rounded-full text-white border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                          <Play className="h-5 w-5 fill-current" />
                        </div>
                      </div>
                      <video 
                        src={item.url}
                        muted
                        preload="metadata" // Save client-side memory
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Subtle Top badge */}
                  <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md text-zinc-400 border border-zinc-850 text-[9px] px-2 py-0.5 rounded-full z-15 font-mono">
                    {item.category}
                  </span>

                  {item.batch !== "All" && (
                    <span className="absolute top-3 right-3 bg-amber-500/10 backdrop-blur-md text-amber-400 border border-amber-500/20 text-[9px] px-2 py-0.5 rounded-full z-15 font-mono">
                      Class of {item.batch}
                    </span>
                  )}
                </div>

                {/* Info Bar at the Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 text-left z-20">
                  <h4 className="text-white font-bold text-xs truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-light mt-1">
                    {item.type === "photo" ? (
                      <ImageIcon className="h-3 w-3" />
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

          {/* Overload Prevention - progressive load trigger */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-semibold text-xs py-3 px-8 rounded-xl transition-all shadow-md"
              >
                Load More Media ({filteredMedia.length - visibleCount} items remaining)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-zinc-900/10 border border-zinc-900 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-zinc-900 p-4 rounded-full text-zinc-750 mb-4">
            <Camera className="h-8 w-8" />
          </div>
          <h3 className="text-white font-semibold text-base">No media assets found</h3>
          <p className="text-zinc-500 text-xs font-light mt-1 max-w-sm">
            Try adjusting your folder tags, media format, or select another graduation class.
          </p>
        </div>
      )}

      {/* Swipeable Lightbox Modal */}
      {lightboxIndex !== null && filteredMedia[lightboxIndex] && (
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-zinc-950/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-250"
        >
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-50">
            <div className="text-left">
              <h3 className="text-white font-bold text-sm md:text-base leading-tight">
                {filteredMedia[lightboxIndex].title}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1 font-light">
                <span className="bg-primary/20 text-blue-300 px-2 py-0.5 rounded font-medium">{filteredMedia[lightboxIndex].category}</span>
                {filteredMedia[lightboxIndex].batch !== "All" && (
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-medium">Class of {filteredMedia[lightboxIndex].batch}</span>
                )}
                <span>•</span>
                <span>Uploaded: {new Date(filteredMedia[lightboxIndex].uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Close Button */}
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

          {/* Main Media Preview Frame */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full h-[65vh] md:h-[75vh] flex items-center justify-center relative select-none"
          >
            {filteredMedia[lightboxIndex].type === "photo" ? (
              <img 
                src={filteredMedia[lightboxIndex].url} 
                alt={filteredMedia[lightboxIndex].title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-250"
              />
            ) : (
              <video
                key={filteredMedia[lightboxIndex].id} // Force media refresh on index change
                src={filteredMedia[lightboxIndex].url}
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
