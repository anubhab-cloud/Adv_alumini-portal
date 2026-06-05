"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/ui/navbar";
import Carousel from "@/components/ui/carousel";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  ShieldAlert, 
  ArrowRight, 
  BookOpen, 
  Briefcase, 
  Award 
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  const gallerySlides = [
    {
      id: "slide-1",
      url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200",
      title: "Reconnecting Across Generations",
      description: "Bringing alumni together to share experiences, stories, and guidance for future graduates."
    },
    {
      id: "slide-2",
      url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
      title: "Celebrating Success & Achievement",
      description: "Our graduates continue to make waves across tech, business, research, and creative fields globally."
    },
    {
      id: "slide-3",
      url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1200",
      title: "Mentorship & Career Growth",
      description: "Guiding current students and peers to foster an environment of continuous learning and network growth."
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Alumni Directory",
      description: "Search and connect with alumni filtered by graduation batch, engineering branch, current company, or skills.",
      link: "/dashboard/directory"
    },
    {
      icon: Calendar,
      title: "Event Hub",
      description: "Stay updated on upcoming networking dinners, webinars, and annual reunions. Register and get instant digital entry passes.",
      link: "/dashboard/events"
    },
    {
      icon: ImageIcon,
      title: "Memory Wall",
      description: "Share nostalgic campus snapshots, describe funny anecdotes, and engage in comments with your peers.",
      link: "/dashboard/memories"
    },
    {
      icon: ShieldAlert,
      title: "Admin Controls",
      description: "Special panels for administrative coordinators to post events, manage gallery images, and review portal analytics.",
      link: "/dashboard/admin"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 animate-pulse-subtle">
            <span className="text-xs font-semibold text-violet-400">Exclusive Academic Alumni Network</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-outfit max-w-5xl mx-auto leading-[1.1] mb-6">
            Reconnect. Relive. <br />
            <span className="text-gradient">Shape the Future Together.</span>
          </h1>

          <p className="text-base md:text-xl text-zinc-400 max-w-2xl mx-auto font-light mb-10">
            Welcome to the official Advanced Alumni Portal. A premium bridge connecting graduating batches, building professional mentorship networks, and preserving lifelong college memories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-primary hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-xl hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                Enter Portal Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-primary hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-xl hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  Join the Community
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative Grid Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none select-none" />
      </section>

      {/* Gallery Showcase Carousel */}
      <section id="gallery" className="py-16 md:py-24 bg-zinc-950/60 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-outfit text-white">Campus & Community Showcase</h2>
          <p className="text-zinc-400 mt-2 font-light max-w-xl mx-auto">Explore official event coverage, batch get-togethers, and life on campus.</p>
        </div>
        <Carousel slides={gallerySlides} />
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-white">Explore Portal Capabilities</h2>
            <p className="text-zinc-400 mt-2 font-light max-w-xl mx-auto">
              Everything you need to network, share milestones, and support academic growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl text-primary w-fit mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-outfit mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm font-light leading-relaxed mb-6">{feature.description}</p>
                </div>
                <Link
                  href={feature.link}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-violet-400 group mt-auto w-fit"
                >
                  Explore feature
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 md:py-20 border-t border-zinc-900 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl md:text-5xl font-extrabold font-outfit text-white">5,000+</p>
              <p className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-wider">Registered Alumni</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-5xl font-extrabold font-outfit text-white">24</p>
              <p className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-wider">Batches Represented</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-5xl font-extrabold font-outfit text-white">150+</p>
              <p className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-wider">Events Conducted</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-5xl font-extrabold font-outfit text-white">1.2K</p>
              <p className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-wider">Memory Wall Uploads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-bold text-white text-sm font-outfit">
              Alumni<span className="text-gradient">Portal</span>
            </span>
          </div>
          <p className="text-zinc-500 text-xs font-light">
            © {new Date().getFullYear()} Alumni Association. All rights reserved. Built with Next.js & Tailwind CSS.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-zinc-500 hover:text-white text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-zinc-500 hover:text-white text-xs transition-colors">Terms of Service</a>
            <a href="#" className="text-zinc-500 hover:text-white text-xs transition-colors">Contact Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
