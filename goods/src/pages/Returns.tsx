import { useState } from 'react';
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import { ShieldAlert, CheckCircle, RotateCcw, Loader2, ArrowRight, Camera, User, HelpCircle } from 'lucide-react';

export default function Returns() {
  // Input verification states
  const [orderId, setOrderId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdDate, setCreatedDate] = useState<string | null>(null);
  const [elapsedHours, setElapsedHours] = useState<number>(0);

  // Form submission states
  const [reason, setReason] = useState('damage');
  const [contact, setContact] = useState('');
  const [comments, setComments] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsEligible(null);

    const formattedId = orderId.trim().toUpperCase();
    if (!formattedId) {
      setErrorMsg('Please enter a valid Order Reference ID.');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(formattedId)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Order Reference not found. Verify your ID.');
      }

      const data = await res.json();
      const elapsed = data.elapsed_hours ?? 0;
      
      setCreatedDate(data.created_at);
      setElapsedHours(elapsed);

      if (elapsed > 48) {
        setIsEligible(false);
      } else {
        setIsEligible(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'System failed to verify eligibility.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!contact.trim()) {
      setErrorMsg('Please provide your contact email or phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId.trim().toUpperCase(),
          reason,
          contact: contact.trim(),
          comments: comments.trim(),
          photoUrl: photoUrl.trim()
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Return request submission failed.');
      }

      const data = await res.json();
      setSuccessRef(data.reference_number);
    } catch (err: any) {
      setErrorMsg(err.message || 'Returns gateway currently unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 min-h-[75vh] flex flex-col justify-center">
      <SEO
        title="Returns & Replacements | Albatross Goods India"
        description="Verify returns eligibility and file return requests for custom print graphic apparel."
      />

      <div className="mb-10 text-center">
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-fuchsia-500 block mb-2">
          ✦ COMPLIANCE DESK
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-white mb-3">
          Returns Portal
        </h1>
        <p className="text-white/40 text-xs max-w-sm mx-auto leading-relaxed font-sans font-light">
          Verify your order dispatch timestamp to initiate damage claims, misprint swaps, or replacements.
        </p>
      </div>

      {successRef ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="border border-green-500/20 bg-green-500/5 p-8 text-center space-y-6 max-w-md mx-auto rounded-sm"
        >
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-green-400 font-bold block">
              Claim Accepted
            </span>
            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">
              Request Submitted
            </h2>
          </div>
          <p className="text-white/50 text-xs font-sans font-light leading-relaxed">
            Your return case has been logged. Our design quality cell will audit the photo reference and contact you shortly.
          </p>
          <div className="py-3 px-4 border border-white/5 bg-[#080808] text-xs font-mono flex justify-between">
            <span className="text-white/30">Case Reference</span>
            <span className="text-white font-bold">{successRef}</span>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white/[0.02] border border-white/10 p-8 rounded-sm backdrop-blur-md">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans font-light rounded-sm">
              {errorMsg}
            </div>
          )}

          {/* Verification Step: ID Not Verified Yet */}
          {isEligible === null && (
            <form onSubmit={handleVerify} className="space-y-6 max-w-md mx-auto">
              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/50 border-b border-white/5 pb-2 block">
                01 / Verify Order Age
              </span>
              
              <p className="text-white/40 text-xs font-sans font-light leading-relaxed">
                Enter your Order Reference ID. The system will inspect your placement timestamp to enforce our 48-hour return eligibility window.
              </p>

              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Order ID *</label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="ALB-78346630"
                  className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 rounded-sm font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-4 bg-white text-black text-[10px] font-display font-bold uppercase tracking-[0.25em] hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 rounded-sm"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    CHECKING WINDOW ELIGIBILITY...
                  </>
                ) : (
                  <>
                    VERIFY COMPLIANCE WINDOW
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Ineligible State: Exceeded 48 hours */}
          {isEligible === false && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 max-w-md mx-auto space-y-6"
            >
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-rose-500 font-bold block">
                  Eligibility Expired
                </span>
                <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white">
                  Compliance Window Closed
                </h2>
              </div>
              <p className="text-white/40 text-xs leading-relaxed font-sans font-light">
                Your order was created on <span className="font-mono text-white/60">{createdDate ? new Date(createdDate).toLocaleDateString() : 'N/A'}</span> ({Math.round(elapsedHours)} hours ago), which exceeds our 48-hour return policy. Due to the custom, limited drops, we are unable to process return claims past this window.
              </p>
              <button
                onClick={() => setIsEligible(null)}
                className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-cyan-400 hover:text-white transition-colors"
              >
                ← Back to verification
              </button>
            </motion.div>
          )}

          {/* Eligible State: within 48 hours */}
          {isEligible === true && (
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmitReturn}
              className="space-y-6 max-w-lg mx-auto"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-green-400">
                  ✓ Eligible for claim ({Math.round(48 - elapsedHours)} hours remaining)
                </span>
                <button
                  type="button"
                  onClick={() => setIsEligible(null)}
                  className="text-[9px] uppercase tracking-widest font-mono text-white/30 hover:text-white"
                >
                  Change Order
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Claim Reason *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                  >
                    <option value="damage">Physical Garment Damage</option>
                    <option value="misprint">Printing Alignment / Misprint</option>
                    <option value="wrong_item">Incorrect Size / Item Received</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Contact Email/Mobile *</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 rounded-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Photo Reference URL (For damage verification)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://image-hosting.com/my-tee-damage.jpg"
                  className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 rounded-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Detailed Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Describe the misalignment or fabric flaw..."
                  rows={4}
                  className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 rounded-sm font-sans font-light"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-black text-[10px] font-display font-bold uppercase tracking-[0.25em] hover:bg-green-400 transition-colors flex items-center justify-center gap-2 rounded-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SUBMITTING RETURN CLAIM...
                  </>
                ) : (
                  <>
                    SUBMIT EXCLUSION CASE
                  </>
                )}
              </button>
            </motion.form>
          )}
        </div>
      )}
    </div>
  );
}
