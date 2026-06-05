"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselSlide {
  id: string;
  url: string;
  title: string;
  description?: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoPlayInterval?: number;
}

export default function Carousel({ slides, autoPlayInterval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Autoplay hook
  useEffect(() => {
    if (isHovered || !autoPlayInterval) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, autoPlayInterval]);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="relative w-full h-[300px] md:h-[480px] rounded-2xl overflow-hidden group shadow-2xl border border-zinc-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background glow matching the slide image */}
      <div 
        className="absolute inset-0 scale-105 opacity-30 blur-2xl transition-all duration-700 select-none pointer-events-none"
        style={{ backgroundImage: `url(${slides[currentIndex].url})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />

      {/* Main Image Slides container */}
      <div className="absolute inset-0 w-full h-full bg-zinc-950">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className="w-full h-full object-cover transition-transform duration-10000 ease-linear scale-100 group-hover:scale-105"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            
            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 text-left">
              <span className="inline-block text-[10px] md:text-xs font-bold tracking-widest text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full mb-3">
                CAMPUS GALLERY
              </span>
              <h3 className="text-xl md:text-3xl font-bold font-outfit text-white leading-tight">
                {slide.title}
              </h3>
              {slide.description && (
                <p className="text-sm md:text-base text-zinc-300 mt-2 max-w-2xl font-light">
                  {slide.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-zinc-950/60 hover:bg-primary text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border border-zinc-800 hover:scale-105 focus:outline-none"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-zinc-950/60 hover:bg-primary text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border border-zinc-800 hover:scale-105 focus:outline-none"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicators/Dots */}
      <div className="absolute bottom-6 right-6 md:right-10 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentIndex ? "w-6 bg-primary" : "w-2 bg-zinc-500 hover:bg-zinc-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
