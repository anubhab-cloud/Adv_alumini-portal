"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockContribution } from "@/lib/mockDb";
import { 
  HeartHandshake, 
  IndianRupee, 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  X,
  Sparkles,
  Users,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function ContributionsPage() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<MockContribution[]>([]);
  const [amountInput, setAmountInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [latestTxToken, setLatestTxToken] = useState("");
  const [successAmount, setSuccessAmount] = useState<number>(0);

  const targetGoal = 500000; // ₹5,00,000 goal
  const presets = [1000, 2500, 5000, 10000];

  useEffect(() => {
    setContributions(mockDb.getContributions());

    // Inject Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const refreshContributions = () => {
    setContributions(mockDb.getContributions());
  };

  const totalCollected = contributions.reduce((sum, item) => sum + item.amount, 0);
  const progressPercent = Math.min(100, (totalCollected / targetGoal) * 100);
  const donorCount = contributions.length;
  const avgDonation = donorCount > 0 ? Math.round(totalCollected / donorCount) : 0;

  const handlePresetSelect = (preset: number) => {
    setSelectedPreset(preset);
    setAmountInput(preset.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null);
    setAmountInput(e.target.value);
  };

  const openCheckout = async () => {
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid contribution amount.");
      return;
    }

    if (!user) {
      alert("You must be logged in to make a contribution.");
      return;
    }

    setProcessing(true);

    try {
      // 1. Create order on Next.js backend endpoint
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });

      if (!response.ok) {
        throw new Error("Unable to create order from server gateway.");
      }

      const orderData = await response.json();

      // 2. Open Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SuvDD9siyulFm8",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Advanced Alumni Portal",
        description: "Campaign Fund Donation",
        image: "https://api.dicebear.com/7.x/initials/svg?seed=AAP",
        order_id: orderData.id,
        handler: function (paymentResponse: any) {
          try {
            // Payment success verified by Razorpay
            const result = mockDb.createContribution({
              userId: user.uid,
              userName: user.name,
              amount: amt,
            });

            // Sync with local mock Db using the real payment receipt ID
            result.txToken = paymentResponse.razorpay_payment_id;
            const contributions = mockDb.getContributions();
            const updated = contributions.map(c => c.id === result.id ? {
              ...c,
              txToken: paymentResponse.razorpay_payment_id
            } : c);
            localStorage.setItem("mock_contributions", JSON.stringify(updated));

            setLatestTxToken(paymentResponse.razorpay_payment_id);
            setSuccessAmount(amt);
            setSuccess(true);
            setCheckoutOpen(true);
            refreshContributions();

            // Reset inputs
            setAmountInput("");
            setSelectedPreset(null);
          } catch (err) {
            console.error("Receipt logger failed:", err);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2563eb", // Medium Blue
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay setup error:", err);
      alert(err.message || "Failed to launch Razorpay gateway.");
    } finally {
      setProcessing(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setSuccess(false);
    setLatestTxToken("");
  };

  return (
    <div className="space-y-8 pb-12 font-outfit">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Support the <span className="text-gradient">Alma Mater</span>
          </h1>
          <p className="text-zinc-400 text-sm font-light mt-1">
            Empower the next generation. Contribute to student scholarships, campus research, and infrastructure upgrades.
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute -right-10 -top-10 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          {/* Progress Metrics & Bar */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary/20 text-violet-300 border border-primary/30 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Active Campaign
              </span>
              <span className="text-zinc-400 text-xs font-light">Campus Development Fund 2026</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              Raise Target: <span className="text-violet-400">₹{targetGoal.toLocaleString()}</span>
            </h2>

            <div className="space-y-2">
              <div className="w-full bg-zinc-950 h-3.5 rounded-full overflow-hidden border border-zinc-900 flex">
                <div 
                  className="bg-gradient-to-r from-violet-600 to-primary h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-light text-zinc-400">
                <span>Collected: <strong>₹{totalCollected.toLocaleString()}</strong> ({Math.round(progressPercent)}%)</span>
                <span>Goal: ₹{targetGoal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 lg:w-96 shrink-0">
            <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-zinc-550 text-xs font-light">
                <Users className="h-4 w-4 text-violet-400" />
                Total Donors
              </div>
              <p className="text-xl font-bold text-white mt-1.5">{donorCount}</p>
            </div>
            <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-zinc-550 text-xs font-light">
                <IndianRupee className="h-4 w-4 text-emerald-400" />
                Avg Contribution
              </div>
              <p className="text-xl font-bold text-white mt-1.5">₹{avgDonation.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Support Form & Recent Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Form */}
        <div className="lg:col-span-5 bg-zinc-900/20 border border-zinc-850 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Make a Contribution</h3>
              <p className="text-zinc-550 text-xs font-light">Choose a preset or input your donation amount.</p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  selectedPreset === preset
                    ? "bg-white text-zinc-950 border-white shadow-md"
                    : "bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-850"
                }`}
              >
                ₹{preset.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="space-y-2">
            <label className="block text-zinc-400 text-xs font-medium">Custom Amount (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4.5 w-4.5" />
              <input
                type="number"
                min="100"
                placeholder="Enter custom amount"
                value={amountInput}
                onChange={handleCustomAmountChange}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={openCheckout}
            className="w-full bg-gradient-to-r from-primary to-violet-600 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2 group text-sm"
          >
            Contribute Now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[10px] font-light">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            SECURED END-TO-END SANDBOX TRANSACTION
          </div>
        </div>

        {/* Recent Contributions Table */}
        <div className="lg:col-span-7 bg-zinc-900/20 border border-zinc-850 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Honor Roll of Contributors</h3>
            <p className="text-zinc-550 text-xs font-light mt-0.5">Recognizing the generous supporters of our campaign.</p>
          </div>

          {contributions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-500 text-[10px] uppercase font-semibold">
                    <th className="pb-3 pr-4">Contributor</th>
                    <th className="pb-3 pr-4">Transaction ID</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/40 text-xs font-light">
                  {contributions.map((item) => (
                    <tr key={item.id} className="group hover:bg-zinc-900/10">
                      <td className="py-3.5 pr-4">
                        <span className="font-semibold text-white">{item.userName}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="font-mono text-zinc-500">{item.txToken}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-semibold text-emerald-400">
                        ₹{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-zinc-900/10 border border-zinc-900 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center">
              <HeartHandshake className="h-8 w-8 text-zinc-700 mb-2" />
              <p className="text-zinc-500 text-xs font-light">No contributions made yet. Be the first to support!</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Success Receipt Modal */}
      {checkoutOpen && success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal close */}
            <button
              onClick={closeCheckout}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md animate-pulse" />
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 relative z-10" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white font-outfit">Payment Received!</h3>
              <p className="text-zinc-400 text-xs font-light px-2 leading-relaxed">
                Thank you for your generous contribution. A transaction receipt has been verified and registered in the ledger.
              </p>

              <div className="bg-zinc-950 rounded-2xl p-4 text-left border border-zinc-850 space-y-2.5 text-xs font-light">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction ID</span>
                  <span className="font-mono text-zinc-300 select-all">{latestTxToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Contributor</span>
                  <span className="text-white font-medium">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount Support</span>
                  <span className="text-emerald-400 font-semibold">₹{successAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[9px] uppercase">SUCCESS</span>
                </div>
              </div>

              <button
                onClick={closeCheckout}
                className="w-full bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 rounded-xl text-xs transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
