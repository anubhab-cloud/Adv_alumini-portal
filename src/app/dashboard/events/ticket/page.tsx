"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { mockDb, MockRegistration, MockEvent } from "@/lib/mockDb";
import { useAuth } from "@/context/AuthContext";
import QRCode from "qrcode";
import { 
  Calendar, 
  MapPin, 
  User, 
  QrCode, 
  Award, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  FileDown,
  Info,
  Clock,
  Printer
} from "lucide-react";

function TicketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const regId = searchParams.get("regId");
  
  const [registration, setRegistration] = useState<MockRegistration | null>(null);
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!regId) {
      setLoading(false);
      return;
    }

    const regs = mockDb.getRegistrations();
    const foundReg = regs.find((r) => r.id === regId);
    
    if (foundReg) {
      setRegistration(foundReg);
      const events = mockDb.getEvents();
      const foundEvent = events.find((e) => e.id === foundReg.eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      }
      
      // Generate QR Code locally
      QRCode.toDataURL(foundReg.qrCodeData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#ffffff', // White QR code blocks
          light: '#18181b' // zinc-900 background
        }
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Local QR Generation error", err));
    }
    setLoading(false);
  }, [regId]);

  // Handle status checking (polling or manual refresh)
  const refreshStatus = () => {
    if (!regId) return;
    const regs = mockDb.getRegistrations();
    const foundReg = regs.find((r) => r.id === regId);
    if (foundReg) {
      setRegistration(foundReg);
    }
  };

  const handleDownloadCertificate = () => {
    if (!registration || !event) return;
    
    // Draw Certificate on HTML5 Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1120;
    canvas.height = 792;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dark theme certificate
    ctx.fillStyle = "#0c0a09"; // zinc-950
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Thick gold border
    ctx.strokeStyle = "#b45309"; // amber-700
    ctx.lineWidth = 16;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    // Thin inner gold border
    ctx.strokeStyle = "#fbbf24"; // amber-400
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

    // Golden corner corner blocks
    ctx.fillStyle = "#d97706";
    ctx.fillRect(36, 36, 12, 12);
    ctx.fillRect(canvas.width - 48, 36, 12, 12);
    ctx.fillRect(36, canvas.height - 48, 12, 12);
    ctx.fillRect(canvas.width - 48, canvas.height - 48, 12, 12);

    // Heading Seal
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 18px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("ADVANCED ALUMNI ASSOCIATION PORTAL", canvas.width / 2, 100);

    // Main Certificate Header
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px Georgia";
    ctx.fillText("CERTIFICATE OF PARTICIPATION", canvas.width / 2, 185);

    ctx.fillStyle = "#a1a1aa"; // zinc-400
    ctx.font = "italic 20px Georgia";
    ctx.fillText("This certificate is proudly awarded to", canvas.width / 2, 250);

    // Recipient Name
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 42px Georgia";
    ctx.fillText(registration.userName.toUpperCase(), canvas.width / 2, 320);

    // Line under recipient name
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 250, 345);
    ctx.lineTo(canvas.width / 2 + 250, 345);
    ctx.stroke();

    // Details text
    ctx.fillStyle = "#e4e4e7"; // zinc-200
    ctx.font = "18px Arial";
    ctx.fillText("for actively attending and completing all sessions of the event", canvas.width / 2, 405);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px Arial";
    ctx.fillText(`"${event.title}"`, canvas.width / 2, 455);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "16px Arial";
    ctx.fillText(`Organized on ${new Date(event.date).toLocaleDateString()} at ${event.location}`, canvas.width / 2, 505);

    // Verification ID text
    ctx.font = "11px Courier New";
    ctx.fillStyle = "#71717a";
    ctx.fillText(`Verification Token: ${registration.qrCodeData}  |  Checked In: ${new Date(registration.checkedInAt || Date.now()).toLocaleString()}`, canvas.width / 2, 570);

    // Signatures lines
    // Left: Coordinator
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(200, 680);
    ctx.lineTo(420, 680);
    ctx.stroke();

    ctx.fillStyle = "#e4e4e7";
    ctx.font = "bold 14px Georgia";
    ctx.fillText("EVENT COORDINATOR", 310, 705);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "italic 22px Georgia";
    ctx.fillText(event.coordinator, 310, 655);

    // Right: President
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 420, 680);
    ctx.lineTo(canvas.width - 200, 680);
    ctx.stroke();

    ctx.fillStyle = "#e4e4e7";
    ctx.font = "bold 14px Georgia";
    ctx.fillText("ALUMNI PRESIDENT", canvas.width - 310, 705);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "italic 22px Georgia";
    ctx.fillText("Dr. Robert H. Miller", canvas.width - 310, 655);

    // Trigger download
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Certificate_${registration.userName.replace(/\s+/g, "_")}_Event.png`;
    link.href = imgData;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-zinc-400 text-sm font-light">Loading ticket details...</span>
      </div>
    );
  }

  if (!registration || !event) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <div className="bg-rose-500/10 text-rose-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-zinc-400 text-xs font-light leading-relaxed">
          The registration token provided does not match any records in our database.
        </p>
        <button
          onClick={() => router.push("/dashboard/events")}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 py-2.5 px-5 rounded-xl text-xs transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event Hub
        </button>
      </div>
    );
  }

  const finalQrUrl = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(registration.qrCodeData)}&bgcolor=18181b&color=ffffff`;

  return (
    <div className="space-y-8 pb-12 font-outfit">
      {/* Back to Events Nav */}
      <button
        onClick={() => router.push("/dashboard/events")}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event Hub
      </button>

      {/* Hero Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Event <span className="text-gradient">Access Pass</span>
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-1">
          Present your QR ticket stub at the registration counter on campus.
        </p>
      </div>

      {/* Ticket Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-900/30 border border-zinc-850 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
          
          {/* Main Boarding Pass Side */}
          <div className="flex-1 p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-primary text-[10px] font-bold tracking-widest uppercase">OFFICIAL REGISTRATION TICKET</span>
                <h2 className="text-xl font-bold text-white leading-snug">{event.title}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shrink-0 ${
                registration.isCheckedIn 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                {registration.isCheckedIn ? (
                  <>
                    <CheckCircle className="h-3 w-3" /> Checked In
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" /> Awaiting Check-In
                  </>
                )}
              </span>
            </div>

            {/* Event Specific Info */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-y border-zinc-850/60 py-6 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-550 uppercase tracking-wider text-[9px] font-medium">DATE & TIME</span>
                <p className="text-zinc-200 font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-550 uppercase tracking-wider text-[9px] font-medium">VENUE LOCATION</span>
                <p className="text-zinc-200 font-medium truncate">{event.location}</p>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-550 uppercase tracking-wider text-[9px] font-medium">ATTENDEE NAME</span>
                <p className="text-white font-semibold">{registration.userName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-550 uppercase tracking-wider text-[9px] font-medium">FOOD PREFERENCE</span>
                <p className="text-zinc-200 font-medium">{registration.foodPreference}</p>
              </div>
            </div>

            {/* Activities selected */}
            <div className="space-y-2">
              <span className="text-zinc-550 uppercase tracking-wider text-[9px] font-medium block">PARTICIPATING SESSIONS</span>
              {registration.activitiesSelected.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {registration.activitiesSelected.map((act) => (
                    <span 
                      key={act} 
                      className="bg-zinc-950 border border-zinc-850 text-zinc-300 px-2.5 py-1 rounded-lg text-[10px]"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-xs italic">No specific activities selected.</p>
              )}
            </div>
          </div>

          {/* Ticket Tear Off Stub (Dashed Divider) */}
          <div className="relative border-t md:border-t-0 md:border-l border-zinc-850 border-dashed w-full md:w-64 bg-zinc-950/40 p-6 md:p-8 flex flex-col items-center justify-center text-center shrink-0">
            {/* Corner Ticket Circles for Tear-Off visual */}
            <div className="absolute top-0 left-1/2 md:left-0 -translate-x-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-850 hidden md:block" />
            <div className="absolute bottom-0 left-1/2 md:left-0 -translate-x-1/2 md:-translate-x-1/2 md:translate-y-1/2 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-850 hidden md:block" />

            <div className="space-y-4">
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 inline-block shadow-lg">
                <img 
                  src={finalQrUrl}
                  alt="Check-in QR Pass"
                  className="w-36 h-36 rounded-lg select-none"
                />
              </div>

              <div className="space-y-1 text-center">
                <span className="text-zinc-550 text-[10px] block font-mono">TICKET STUB ID</span>
                <p className="text-white text-xs font-mono select-all truncate max-w-44 mx-auto bg-zinc-900 border border-zinc-850 px-2 py-1 rounded">
                  {registration.qrCodeData}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action panel & Certification builder */}
      <div className="max-w-4xl mx-auto bg-zinc-900/10 border border-zinc-850 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-3.5">
          <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20 shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Alumni Attendance Certificate</h3>
            <p className="text-zinc-400 text-xs font-light mt-0.5 leading-relaxed">
              Upon successful check-in validation at the venue, download a verified digital certificate confirming your attendance.
            </p>
          </div>
        </div>

        {registration.isCheckedIn ? (
          <button
            onClick={handleDownloadCertificate}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-xs py-3 px-5 rounded-xl hover:opacity-90 shadow-lg shadow-amber-500/10 transition-all shrink-0 self-start md:self-auto"
          >
            <FileDown className="h-4.5 w-4.5 animate-bounce" />
            Download Certificate
          </button>
        ) : (
          <div className="flex flex-col gap-2 shrink-0">
            <button
              disabled
              className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-500 border border-zinc-850 text-xs font-semibold py-3 px-5 rounded-xl cursor-not-allowed shrink-0"
            >
              <Award className="h-4.5 w-4.5" />
              Certificate Locked
            </button>
            <button 
              onClick={refreshStatus}
              className="text-[10px] text-zinc-400 hover:text-white underline text-left"
            >
              Click here to refresh check-in status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-zinc-400 text-sm font-light">Bootstrapping ticket content...</span>
      </div>
    }>
      <TicketContent />
    </Suspense>
  );
}
