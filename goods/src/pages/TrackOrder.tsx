import { useState } from 'react';
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import { Search, Loader2, ClipboardCheck, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface TimelineStep {
  status: string;
  label: string;
  time: string | null;
  completed: boolean;
}

interface TrackResponse {
  id: string;
  created_at: string;
  status: string;
  status_label: string;
  elapsed_hours: number;
  timeline: TimelineStep[];
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<TrackResponse | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setTrackData(null);

    const formattedId = orderId.trim().toUpperCase();
    if (!formattedId) {
      setErrorMsg('Please enter a valid Order Reference ID.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(formattedId)}&contact=${encodeURIComponent(contact.trim())}`);
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Unable to retrieve tracking details. Verify Reference ID.');
      }

      const data = await res.json();
      setTrackData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Tracking system currently offline.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 min-h-[75vh] flex flex-col justify-center">
      <SEO
        title="Track Your Order | Albatross Goods India"
        description="Check your custom streetwear order production, printing, and shipping status in real-time."
      />

      <div className="mb-10 text-center">
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-cyan-400 block mb-2">
          ✦ LIVE FULFILLMENT STATUS
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-white mb-3">
          Track Order
        </h1>
        <p className="text-white/40 text-xs max-w-md mx-auto leading-relaxed font-sans font-light">
          Monitor your subculture collectible through our printing press, packaging grid, and regional dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left column - Form */}
        <div className="md:col-span-5 bg-white/[0.02] border border-white/10 p-6 rounded-sm space-y-6 backdrop-blur-md">
          <h2 className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-white/50 border-b border-white/5 pb-2">
            Verification details
          </h2>

          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-sm font-sans font-light">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleTrack} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Order Reference ID *</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ALB-78346630"
                className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/25 focus:outline-none focus:border-cyan-400 rounded-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Email or Mobile (Optional)</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/25 focus:outline-none focus:border-cyan-400 rounded-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black text-[10px] font-display font-bold uppercase tracking-[0.2em] hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 rounded-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  LOCATING RECORD...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  RETRIEVE STATUS
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right column - Status readout */}
        <div className="md:col-span-7">
          {trackData ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/[0.02] border border-white/10 p-6 rounded-sm space-y-8 backdrop-blur-md"
            >
              {/* Header stats */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest block font-mono">REF ID</span>
                  <span className="text-xs text-white font-mono font-bold">{trackData.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest block font-mono">CURRENT STATUS</span>
                  <span className="px-2.5 py-0.5 border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-[8px] uppercase tracking-widest font-display font-bold rounded-full">
                    {trackData.status_label}
                  </span>
                </div>
              </div>

              {/* Timeline list */}
              <div className="relative pl-6 space-y-6 border-l border-white/10 ml-3">
                {trackData.timeline.map((step, idx) => {
                  const isCompleted = step.completed;
                  return (
                    <div key={step.status} className="relative">
                      {/* Node circle */}
                      <div
                        className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-[#030303] border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                            : 'bg-[#030303] border-white/10'
                        }`}
                      >
                        {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                      </div>

                      {/* Content block */}
                      <div className="space-y-1">
                        <h3 className={`text-[10px] font-display font-bold uppercase tracking-wider ${
                          isCompleted ? 'text-white' : 'text-white/20'
                        }`}>
                          {step.label}
                        </h3>
                        {step.time ? (
                          <span className="text-[9px] text-white/30 block font-mono">
                            {new Date(step.time).toLocaleDateString()} // {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-[9px] text-white/15 block font-mono">Pending schedule</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom cues */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[9px] uppercase tracking-wider text-white/30">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Verified secure
                </span>
                <span>Created {new Date(trackData.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ) : (
            <div className="h-full border border-dashed border-white/10 p-12 text-center flex flex-col justify-center items-center text-white/20 rounded-sm">
              <ClipboardCheck className="w-8 h-8 mb-3 opacity-40" />
              <span className="text-xs font-serif italic mb-1">Awaiting details</span>
              <p className="text-[8px] uppercase tracking-widest max-w-[200px] leading-relaxed">
                Provide Order Reference ID to load timeline dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
