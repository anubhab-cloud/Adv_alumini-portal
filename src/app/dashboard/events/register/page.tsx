"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockEvent, MockRegistration } from "@/lib/mockDb";
import { Calendar, CheckCircle2, QrCode, ArrowLeft, Loader2, Utensils, AlertCircle } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";

function EventRegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [foodPreference, setFoodPreference] = useState<'Veg' | 'Non-Veg'>('Veg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Post-submit states
  const [registration, setRegistration] = useState<MockRegistration | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    const events = mockDb.getEvents();
    const found = events.find(e => e.id === eventId);
    if (found) {
      setEvent(found);
      // Preselect all activities by default
      setSelectedActivities(found.activities || []);
    }
    setLoading(false);
  }, [eventId]);

  const handleActivityChange = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity) 
        : [...prev, activity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !user) return;

    setIsSubmitting(true);
    
    const registrationToken = `ALUMNI-PASS-${event.id.toUpperCase()}-${user.uid.slice(5, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    try {
      // Generate QR Code URL
      const qrDataUrl = await QRCode.toDataURL(registrationToken, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Save registration in mockDb
      const newRegistration = mockDb.createRegistration({
        eventId: event.id,
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        activitiesSelected: selectedActivities,
        foodPreference: foodPreference,
        qrCodeData: registrationToken
      });

      setRegistration(newRegistration);
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error("Failed to generate ticket QR code", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center gap-2 text-zinc-400 text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading event information...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center text-zinc-500">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="font-outfit font-bold text-white text-lg">Event Not Found</h3>
        <p className="text-xs font-light mt-1 mb-6">
          The event ID specified is invalid or has been removed.
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

  // POST SUBMIT SCREEN
  if (registration) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-left animate-in fade-in duration-300">
        <div className="text-center">
          <div className="inline-flex bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-full text-emerald-400 mb-3">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold font-outfit text-white">Registration Complete!</h2>
          <p className="text-zinc-400 text-sm mt-1 font-light">Your ticket pass has been successfully generated.</p>
        </div>

        {/* Boarding Pass Ticket */}
        <div className="bg-white text-zinc-950 rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-200">
          
          {/* Header */}
          <div className="bg-primary text-white p-5 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-violet-200" />
            <div className="text-left">
              <h3 className="font-bold font-outfit text-sm truncate max-w-[280px]">
                {event.title}
              </h3>
              <p className="text-[10px] text-violet-200 mt-0.5">
                {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Attendee</span>
                <span className="font-semibold text-zinc-800">{registration.userName}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Food Preference</span>
                <span className="font-semibold text-zinc-800">{registration.foodPreference}</span>
              </div>
            </div>

            <div className="text-xs pt-2 border-t border-dashed border-zinc-200">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold mb-1">Catering Activities</span>
              <ul className="space-y-1">
                {registration.activitiesSelected.map((act, i) => (
                  <li key={i} className="text-zinc-600 font-light flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full shrink-0" />
                    {act}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* QR Pass */}
            <div className="pt-4 border-t border-zinc-200 flex flex-col items-center justify-center">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="Entry Ticket Pass QR Code"
                  className="h-44 w-44 object-contain border border-zinc-200 p-1 rounded-lg"
                />
              )}
              <span className="text-[10px] font-mono text-zinc-500 mt-2">
                Ticket ID: {registration.qrCodeData}
              </span>
            </div>
          </div>

          {/* Ticket jagged edge circles decoration */}
          <div className="absolute top-[76px] -left-3 h-6 w-6 rounded-full bg-zinc-950 border-r border-zinc-950" />
          <div className="absolute top-[76px] -right-3 h-6 w-6 rounded-full bg-zinc-950 border-l border-zinc-950" />
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard/events"
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs py-3 rounded-xl transition-all text-center"
          >
            Back to Event Hub
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-primary hover:bg-violet-700 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md"
          >
            Print Ticket Pass
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 text-left">
      {/* Return link */}
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1 text-zinc-400 hover:text-white text-xs font-semibold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Event Hub
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-white leading-tight">
          Register Event Pass
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Select your schedule activities and preferences to generate your boarding ticket.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        {/* Event header card */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-900 rounded-xl">
          <h3 className="font-bold text-white text-sm font-outfit">{event.title}</h3>
          <p className="text-zinc-400 text-xs font-light mt-1 leading-normal">
            Location: {event.location}
          </p>
        </div>

        {/* Checkbox activities list */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Select Activities to Attend
          </label>
          <div className="space-y-2">
            {event.activities.map((activity, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60 hover:border-zinc-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity)}
                  onChange={() => handleActivityChange(activity)}
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 bg-zinc-900 border-zinc-800"
                />
                <span className="text-zinc-300 text-xs font-light leading-snug">
                  {activity}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* RadioGroup Catering preference */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Catering Preference
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                foodPreference === "Veg"
                  ? "bg-primary/10 border-primary text-violet-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Utensils className="h-4 w-4" />
                Vegetarian
              </span>
              <input
                type="radio"
                name="food"
                checked={foodPreference === "Veg"}
                onChange={() => setFoodPreference("Veg")}
                className="sr-only"
              />
            </label>
            
            <label
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                foodPreference === "Non-Veg"
                  ? "bg-primary/10 border-primary text-violet-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Utensils className="h-4 w-4" />
                Non-Vegetarian
              </span>
              <input
                type="radio"
                name="food"
                checked={foodPreference === "Non-Veg"}
                onChange={() => setFoodPreference("Non-Veg")}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || selectedActivities.length === 0}
          className="w-full bg-primary hover:bg-violet-700 disabled:bg-zinc-800 text-white font-semibold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          ) : (
            <>
              Confirm Registration
              <QrCode className="h-4.5 w-4.5 text-violet-200" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function EventRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="py-12 flex items-center justify-center gap-2 text-zinc-400 text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading registration details...
      </div>
    }>
      <EventRegistrationForm />
    </Suspense>
  );
}
