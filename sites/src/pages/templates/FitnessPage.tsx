import { useState } from 'react';
import { Nav } from '../../components/Nav';
import { Footer } from '../../components/Footer';
import { PersonalizeBar } from '../../components/PersonalizeBar';
import { RevealText } from '../../components/RevealText';
import { AbstractHeroPanel } from '../../components/AbstractHeroPanel';
import { useTemplateCopy } from '../../hooks/useTemplateCopy';
import { PLACEHOLDER_COPY } from '../../lib/copySchemas';

const TESTIMONIALS = [
  { quote: "First gym where I didn't feel like I needed to already be in shape to show up.", name: 'Illustrative example' },
  { quote: 'The coaches actually remember your name and your last set. Rare.', name: 'Illustrative example' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SCHEDULE: Record<string, { time: string; class: string }[]> = {
  Mon: [{ time: '6:00 AM', class: 'Strength' }, { time: '6:00 PM', class: 'Vinyasa Flow' }],
  Tue: [{ time: '7:00 AM', class: 'Conditioning' }, { time: '7:00 PM', class: 'Restorative Yoga' }],
  Wed: [{ time: '6:00 AM', class: 'Strength' }, { time: '6:00 PM', class: 'Open Gym' }],
  Thu: [{ time: '7:00 AM', class: 'Conditioning' }, { time: '7:00 PM', class: 'Vinyasa Flow' }],
  Fri: [{ time: '6:00 AM', class: 'Strength' }, { time: '6:00 PM', class: 'Community WOD' }],
  Sat: [{ time: '9:00 AM', class: 'Open Gym' }],
};

export default function FitnessPage() {
  const { copy, isPersonalizing, hasError, errorMessage, retry } = useTemplateCopy('fitness', PLACEHOLDER_COPY.fitness);
  const [activeDay, setActiveDay] = useState('Mon');

  return (
    <div className="relative z-10 text-[var(--text-primary)]">
      <Nav theme="dark" />

      {hasError && (
        <div className="mx-6 mb-4 flex items-center justify-between rounded-lg bg-red-950/60 px-4 py-3 text-sm text-red-300 md:mx-12">
          <span>{errorMessage}</span>
          <button onClick={retry} className="font-medium underline">Retry personalizing</button>
        </div>
      )}

      <header className="relative overflow-hidden px-6 pb-20 pt-12 md:px-12">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="mb-4 inline-block rounded-full bg-[#C8FF3F]/15 px-4 py-1 text-xs font-medium uppercase tracking-wide text-[#C8FF3F]">
              {isPersonalizing ? 'Personalizing…' : 'Fitness & Yoga Studio'}
            </span>
            <h1 className="mb-4 font-serif text-5xl leading-tight text-white md:text-6xl">
              <RevealText value={copy.headline} />
            </h1>
            <p className="mb-8 text-lg text-white/60">
              <RevealText value={copy.subheadline} />
            </p>
            <button className="rounded-full bg-[#C8FF3F] px-8 py-4 text-sm font-medium text-black transition hover:bg-white">
              {copy.ctaLabel}
            </button>
            <p className="mt-3 text-xs text-white/40">{copy.ctaSubtext}</p>
          </div>
          <AbstractHeroPanel base="#141311" accent="#C8FF3F" pattern="stripes" />
        </div>
      </header>

      <section className="px-6 py-20 md:px-12">
        <h2 className="mb-4 font-serif text-3xl text-white">
          <RevealText value={copy.aboutTitle} />
        </h2>
        <p className="max-w-2xl text-white/60">
          <RevealText value={copy.aboutBody} />
        </p>
      </section>

      <section className="px-6 py-20 md:px-12">
        <h2 className="mb-8 font-serif text-3xl text-white">This Week's Schedule</h2>
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                activeDay === day ? 'bg-[#C8FF3F] text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {SCHEDULE[activeDay].map((slot) => (
            <div key={slot.time} className="glass-panel flex items-center justify-between rounded-xl px-6 py-4">
              <span className="text-mono text-[var(--text-muted)]">{slot.time}</span>
              <span className="font-medium text-[var(--text-primary)]">{slot.class}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <h2 className="mb-8 font-serif text-3xl text-white">Programs</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {copy.services.map((service, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-2 font-serif text-xl text-[#C8FF3F]">{service.title}</h3>
              <p className="text-sm text-white/60">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <h2 className="mb-2 font-serif text-3xl text-white">The Kind of Reviews You'll Start Earning</h2>
        <p className="mb-8 text-sm text-white/40">Illustrative examples — not real reviews.</p>
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.quote} className="rounded-2xl bg-white/5 p-6">
              <p className="mb-3 text-white/80">"{t.quote}"</p>
              <p className="text-xs text-white/40">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-12 text-center md:px-12">
        <p className="font-serif text-xl text-white">
          <RevealText value={copy.footerTagline} />
        </p>
      </footer>

      <Footer theme="dark" />
      <PersonalizeBar />
    </div>
  );
}
