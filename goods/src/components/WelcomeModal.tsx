import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('ag_welcome_seen');
    if (seen) return;
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem('ag_welcome_seen', '1');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const stored = localStorage.getItem('ag_collected_emails');
      const emailList = stored ? JSON.parse(stored) : [];
      if (!emailList.includes(email.trim())) {
        emailList.push(email.trim());
        localStorage.setItem('ag_collected_emails', JSON.stringify(emailList));
      }
    } catch (err) {
      console.error('Failed to save email to localStorage:', err);
    }
    setSubmitted(true);
  };

  const close = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[201] inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md pointer-events-auto bg-[#0c0c0c] border border-white/10 overflow-hidden"
              style={{ boxShadow: '0 0 60px rgba(34,211,238,0.07), 0 30px 60px rgba(0,0,0,0.7)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top neon accent bar */}
              <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400" />

              {/* Close button */}
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="px-8 pt-10 pb-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyan-500/30 bg-cyan-500/10 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                    Albatross Collector Club
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2
                        id="modal-headline"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tighter uppercase leading-[1.05] mb-3"
                      >
                        You've discovered
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                          something rare.
                        </span>
                      </h2>

                      <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
                        Albatross makes limited-run apparel for people who take culture seriously.
                        Each piece is numbered. Once a drop sells out, it's retired — forever.
                      </p>

                      {/* Trust row */}
                      <div className="flex gap-4 mb-7 text-[9px] uppercase tracking-widest text-white/30 font-bold">
                        <span>✦ Numbered Runs</span>
                        <span>✦ 48hr Dispatch</span>
                        <span>✦ India-made</span>
                      </div>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <label htmlFor="modal-email" className="sr-only">Email address</label>
                        <input
                          id="modal-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] transition-all font-mono"
                        />
                        <button
                          type="submit"
                          id="modal-join-cta"
                          className="w-full py-4 bg-white text-black text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-cyan-400 transition-colors duration-200"
                        >
                          Join the Inner Circle
                        </button>
                      </form>

                      <button
                        onClick={close}
                        className="mt-5 w-full text-center text-[9px] uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors"
                      >
                        Skip for now — browse the archive
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-8 text-center"
                    >
                      <div className="w-12 h-12 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center mx-auto mb-5">
                        <span className="text-cyan-400 text-xl">✓</span>
                      </div>
                      <h3 className="text-xl font-extrabold uppercase tracking-tighter mb-2">
                        You're in.
                      </h3>
                      <p className="text-white/40 text-sm mb-6">
                        You'll hear about new drops before anyone else. Welcome to the collective.
                      </p>
                      <Link
                        to="/collection"
                        onClick={close}
                        className="inline-block px-8 py-3 bg-white text-black text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-cyan-400 transition-colors"
                      >
                        Explore the Collection
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom neon line */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
