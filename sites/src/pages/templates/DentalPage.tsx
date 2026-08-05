import { useState } from 'react';
// Uses `motion/react` (the current Framer Motion package — Motion One's
// team folded framer-motion's engine into this rebranded package), NOT the
// separate `framer-motion` package: the rest of the app (RevealText,
// PersonalizeBar) already uses `motion/react`, and mixing the two in the
// same tree crashes with "Cannot read properties of null (reading
// 'useContext')" — each package instantiates its own internal context,
// and a `framer-motion` component can't read a `motion/react` provider.
import { motion } from 'motion/react';
import { Nav } from '../../components/Nav';
import { Footer } from '../../components/Footer';
import { PersonalizeBar } from '../../components/PersonalizeBar';
import { RevealText } from '../../components/RevealText';
import { useTemplateCopy } from '../../hooks/useTemplateCopy';
import { PLACEHOLDER_COPY } from '../../lib/copySchemas';

const TESTIMONIALS = [
  { quote: "Booked online in two minutes, in the chair the same afternoon. Didn't expect that from a dentist.", name: 'Illustrative example' },
  { quote: 'First cleaning in years where nobody made me feel bad about it.', name: 'Illustrative example' },
];

export default function DentalPage() {
  const { copy, isPersonalizing, hasError, errorMessage, retry } = useTemplateCopy('dental', PLACEHOLDER_COPY.dental);
  const [openService, setOpenService] = useState<number | null>(null);
  // useTemplateCopy returns the exact PLACEHOLDER_COPY.dental object
  // reference until a generation resolves to 'ready' — reference equality
  // is a reliable, non-invasive way to detect "AI generation just
  // completed" without touching the hook or BusinessContext.
  const isAiGenerated = copy !== PLACEHOLDER_COPY.dental;

  return (
    <div className="relative z-10">
      <Nav />

      {hasError && (
        <div className="mx-6 mb-4 flex items-center justify-between rounded-lg bg-red-950/40 px-4 py-3 text-sm text-red-300 md:mx-12">
          <span>{errorMessage}</span>
          <button onClick={retry} className="font-medium underline">Retry personalizing</button>
        </div>
      )}

      {/* Full-bleed spatial hero — the 3D crystal scene (GlobalCanvas,
          route-aware) shows through behind this text, no boxed CSS panel. */}
      <header className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-20 text-center md:px-12">
        <motion.div
          key={isAiGenerated ? 'ai' : 'placeholder'}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl"
        >
          <span className="text-mono mb-4 inline-block rounded-full bg-[#3FA9C7]/15 px-4 py-1 text-xs uppercase tracking-wide text-[#7ED0E8]">
            {isPersonalizing ? 'Personalizing…' : 'Dental Clinic'}
          </span>
          <h1 className="mb-4 font-serif text-5xl leading-tight text-[var(--text-primary)] md:text-6xl">
            <RevealText value={copy.headline} />
          </h1>
          <p className="mb-8 text-lg text-[var(--text-muted)]">
            <RevealText value={copy.subheadline} />
          </p>
          <button className="rounded-full bg-[#3FA9C7] px-8 py-4 text-sm font-medium text-[#07080a] transition hover:opacity-90">
            {copy.ctaLabel}
          </button>
          <p className="mt-3 text-xs text-[var(--text-faint)]">{copy.ctaSubtext}</p>
        </motion.div>
      </header>

      <section className="relative z-10 px-6 py-20 md:px-12">
        <h2 className="mb-4 font-serif text-3xl text-[var(--text-primary)]">
          <RevealText value={copy.aboutTitle} />
        </h2>
        <p className="max-w-2xl text-[var(--text-muted)]">
          <RevealText value={copy.aboutBody} />
        </p>
      </section>

      <section className="relative z-10 px-6 py-20 md:px-12">
        <h2 className="mb-8 font-serif text-3xl text-[var(--text-primary)]">Services &amp; What's Covered</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {copy.services.map((service, i) => (
            <button
              key={i}
              onClick={() => setOpenService(openService === i ? null : i)}
              className="glass-panel rounded-2xl p-6 text-left transition hover:border-[#3FA9C7]/50"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[var(--text-primary)]">{service.title}</h3>
                <span className="text-[#3FA9C7]">{openService === i ? '−' : '+'}</span>
              </div>
              {openService === i && (
                <div className="mt-3">
                  <p className="mb-2 text-sm text-[var(--text-muted)]">{service.description}</p>
                  <span className="text-mono inline-block rounded-full bg-[#3FA9C7]/10 px-3 py-1 text-xs text-[#7ED0E8]">
                    Most insurance plans accepted
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 py-20 md:px-12">
        <h2 className="mb-2 font-serif text-3xl text-[var(--text-primary)]">The Kind of Reviews You'll Start Earning</h2>
        <p className="text-mono mb-8 text-sm text-[var(--text-faint)]">Illustrative examples — not real reviews.</p>
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.quote} className="glass-panel rounded-2xl p-6">
              <p className="mb-3 text-[var(--text-primary)]/80">"{t.quote}"</p>
              <p className="text-mono text-xs text-[var(--text-faint)]">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-6 py-12 text-center md:px-12">
        <p className="font-serif text-xl text-[var(--text-primary)]">
          <RevealText value={copy.footerTagline} />
        </p>
      </footer>

      <Footer />
      <PersonalizeBar />
    </div>
  );
}
