import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBusiness } from '../context/BusinessContext';
import { COMPANY_NAME_MAX, BLURB_MAX } from '../lib/businessStorage';

export function PersonalizeBar() {
  const { business, setBusiness, reset } = useBusiness();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState(business?.companyName ?? '');
  const [blurb, setBlurb] = useState(business?.blurb ?? '');
  const [error, setError] = useState<string | null>(null);

  function openModal() {
    setCompanyName(business?.companyName ?? '');
    setBlurb(business?.blurb ?? '');
    setError(null);
    setOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = setBusiness({ companyName, blurb });
    if (validationError) {
      setError(validationError);
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
        {business ? (
          <div className="glass-panel-strong flex items-center gap-3 rounded-full px-5 py-3 shadow-2xl">
            <span className="text-sm text-[var(--text-primary)]">
              Viewing as <strong>{business.companyName}</strong>
            </span>
            <button onClick={openModal} className="text-sm font-medium text-[var(--accent)] hover:underline">
              Edit
            </button>
            <button onClick={reset} className="text-sm font-medium text-[var(--text-faint)] hover:text-[var(--text-primary)]">
              Reset
            </button>
          </div>
        ) : (
          <button
            onClick={openModal}
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--obsidian)] shadow-2xl transition hover:opacity-90"
          >
            Make This Yours
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              className="glass-panel-strong w-full max-w-md rounded-2xl p-8 shadow-2xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-2 font-serif text-2xl text-[var(--text-primary)]">Make This Yours</h2>
              <p className="mb-6 text-sm text-[var(--text-muted)]">
                Tell us about your business and watch this demo rewrite itself around it.
              </p>

              <label className="text-mono mb-1 block text-xs uppercase tracking-wide text-[var(--text-faint)]">
                Company Name
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={COMPANY_NAME_MAX}
                placeholder="e.g. Willow Creek Dental"
                className="mb-4 w-full rounded-lg border border-[var(--glass-border)] bg-black/30 px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]"
              />

              <label className="text-mono mb-1 block text-xs uppercase tracking-wide text-[var(--text-faint)]">
                What do you do?
              </label>
              <textarea
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                maxLength={BLURB_MAX}
                rows={3}
                placeholder="e.g. A family dental clinic in Austin focused on gentle, modern care."
                className="mb-2 w-full rounded-lg border border-[var(--glass-border)] bg-black/30 px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]"
              />
              <div className="text-mono mb-6 text-right text-xs text-[var(--text-faint)]">
                {blurb.length}/{BLURB_MAX}
              </div>

              {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--obsidian)] transition hover:opacity-90"
              >
                See It Become Mine
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
