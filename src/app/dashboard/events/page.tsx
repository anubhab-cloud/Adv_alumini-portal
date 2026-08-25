"use client";
 
import React, { useState, useEffect } from "react";
import { mockDb, MockEvent, MockRegistration } from "@/lib/mockDb";
import { mockRedis } from "@/lib/mockRedis";
import { useAuth } from "@/context/AuthContext";
import { Calendar, MapPin, Clock, User, ArrowRight, X, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
 
export default function EventHub() {
  const { user } = useAuth();
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [registrations, setRegistrations] = useState<MockRegistration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null);
 
  useEffect(() => {
    setEvents(mockDb.getEvents());
    if (user) {
      setRegistrations(mockDb.getRegistrationsByUser(user.uid));
    }
  }, [user]);
 
  const getEventRegistration = (eventId: string) => {
    return registrations.find((r) => r.eventId === eventId);
  };
 
  return (
    <div className="space-y-6 text-left relative">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-white leading-tight">
            Event Hub
          </h1>
          <p className="text-zinc-400 text-sm font-light mt-1">
            Stay updated with reunions, virtual webinars, panel mixers, and student-alumni games.
          </p>
        </div>
      </div>
 
      {/* Grid of Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => {
          const isUpcoming = new Date(event.date).getTime() > Date.now();
          const userReg = getEventRegistration(event.id);
 
          // Get capacity metrics from Redis
          const initialCapacity = event.capacity ?? 300;
          const currentCap = mockRedis.getCounter(`event-capacity:${event.id}`, initialCapacity);
          const waitlistSize = mockRedis.zrange(`event-waitlist:${event.id}`).length;
          
          return (
            <div
              key={event.id}
              className={`glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/20 transition-all ${
                !isUpcoming ? "opacity-75" : ""
              }`}
            >
              <div>
                {/* Event Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isUpcoming
                          ? "bg-violet-500/10 text-violet-400 border border-violet-500/25"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-800"
                      }`}
                    >
                      {isUpcoming ? "Upcoming Event" : "Past Event"}
                    </span>
 
                    {isUpcoming && !userReg && (
                      currentCap > 0 ? (
                        <span className="text-[9px] font-bold text-emerald-450 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                          {currentCap} Seats Left
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-450 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                          Waitlist Active ({waitlistSize} queued)
                        </span>
                      )
                    )}
                  </div>
                  
                  {userReg && (
                    userReg.isWaitlisted ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/10 text-amber-450 border border-amber-500/25">
                        Waitlisted (Pos #{user && mockRedis.zrank(`event-waitlist:${event.id}`, user.uid) + 1})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle className="h-2.5 w-2.5" /> Registered
                      </span>
                    )
                  )}
                </div>
 
                {/* Event Info */}
                <h3 className="font-bold text-white text-lg font-outfit mt-4 leading-snug">
                  {event.title}
                </h3>
                <p className="text-zinc-400 text-xs font-light mt-2 line-clamp-3 leading-relaxed">
                  {event.description}
                </p>

                {/* Logistics */}
                <div className="space-y-2 mt-5 text-xs text-zinc-400 font-light">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span>
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span>Coordinated by: <strong className="font-medium text-zinc-300">{event.coordinator}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-4 mt-6 border-t border-zinc-900">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all text-center"
                >
                  View Details
                </button>
                {isUpcoming ? (
                  userReg ? (
                    <Link
                      href={`/dashboard/events/ticket?regId=${userReg.id}`}
                      className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-450 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md"
                    >
                      View Ticket Pass
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/events/register?eventId=${event.id}`}
                      className="flex-1 bg-primary hover:bg-violet-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-violet-500/10"
                    >
                      Register Now
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )
                ) : (
                  <Link
                    href={`/dashboard/events/gallery?eventId=${event.id}`}
                    className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-450 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md"
                  >
                    View Photo Album
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Dialog Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Overlay */}
          <div
            onClick={() => setSelectedEvent(null)}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <div className="glass-card rounded-2xl p-6 md:p-8 max-w-xl w-full z-10 border border-zinc-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-4">
              <div>
                <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-violet-400 border border-primary/20 uppercase tracking-widest">
                  Event Details
                </span>
                <h2 className="text-xl font-bold font-outfit text-white mt-3">
                  {selectedEvent.title}
                </h2>
              </div>

              <div className="space-y-2 py-2 border-y border-zinc-900 text-xs font-light text-zinc-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-violet-400" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-violet-400" />
                  <span>
                    {new Date(selectedEvent.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-violet-400" />
                  <span>Coordinated by: <strong className="font-semibold text-white">{selectedEvent.coordinator}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">About the Event</h4>
                <p className="text-zinc-300 text-xs font-light leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              {selectedEvent.activities && selectedEvent.activities.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Activities Schedule</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEvent.activities.map((activity, i) => (
                      <li key={i} className="text-xs text-zinc-400 font-light flex items-center gap-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-900">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full shrink-0" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Registration check */}
              {new Date(selectedEvent.date).getTime() > Date.now() ? (
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all"
                  >
                    Close
                  </button>
                  {getEventRegistration(selectedEvent.id) ? (
                    <Link
                      href={`/dashboard/events/ticket?regId=${getEventRegistration(selectedEvent.id)!.id}`}
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-450 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md"
                    >
                      View Ticket Pass
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/events/register?eventId=${selectedEvent.id}`}
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1 bg-primary hover:bg-violet-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md"
                    >
                      Register for Event
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="pt-4 flex flex-col gap-3">
                  <div className="bg-zinc-900/40 border border-zinc-900 text-zinc-500 p-3.5 rounded-xl flex items-center gap-2 text-xs font-light">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    Registration closed. This event was completed in the past.
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all"
                    >
                      Close
                    </button>
                    <Link
                      href={`/dashboard/events/gallery?eventId=${selectedEvent.id}`}
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-450 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md text-center"
                    >
                      View Photo Album
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
