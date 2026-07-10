const testimonials = [
  {
    quote: 'The Cinema series tee is genuinely the most talked-about piece in my wardrobe.',
    author: 'Arjun S.',
    role: 'Filmmaker, Mumbai',
    avatar: 'AS',
    accent: '#22d3ee',
  },
  {
    quote: 'Limited run means something. I\'ve owned 6 Albatross pieces and each feels archival.',
    author: 'Priya M.',
    role: 'Art Director, Bengaluru',
    avatar: 'PM',
    accent: '#d946ef',
  },
  {
    quote: 'Not merch. Wearable film criticism. Nothing else comes close.',
    author: '@underground.curator',
    role: '14.2k followers ✓',
    avatar: 'UC',
    accent: '#facc15',
  },
  {
    quote: 'The fabric weight alone justifies the price. This is what fast fashion can\'t replicate.',
    author: 'Rohan K.',
    role: 'Photographer, Delhi',
    avatar: 'RK',
    accent: '#4ade80',
  },
  {
    quote: 'Wore the Comics series hoodie to a gallery opening. Three people asked where I got it.',
    author: 'Tanvi R.',
    role: 'Independent Curator, Pune',
    avatar: 'TR',
    accent: '#fb923c',
  },
  {
    quote: 'My entire circle of musicians has at least one Albatross piece. It\'s become a uniform.',
    author: 'Dev A.',
    role: 'Music Producer, Hyderabad',
    avatar: 'DA',
    accent: '#fb7185',
  },
];

// Duplicate for seamless loop
const loopItems = [...testimonials, ...testimonials];

export default function SocialProofBar() {
  return (
    <section className="w-full py-10 border-t border-b border-white/5 overflow-hidden relative bg-[#060606]" aria-label="Customer testimonials">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#060606] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#060606] to-transparent z-10 pointer-events-none" />

      {/* Section label */}
      <div className="text-center mb-6">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
          ✦ Collected by filmmakers, musicians & independent curators across India ✦
        </span>
      </div>

      {/* Scrolling row */}
      <div
        className="flex gap-6"
        style={{
          animation: 'marquee-scroll 40s linear infinite',
          width: 'max-content',
        }}
        aria-hidden="true"
      >
        {loopItems.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[300px] border border-white/5 bg-white/[0.02] p-5 relative"
            style={{ borderLeft: `2px solid ${item.accent}20` }}
          >
            {/* Quote mark */}
            <span className="absolute top-3 right-4 text-2xl font-serif leading-none" style={{ color: `${item.accent}20` }}>"</span>

            <p className="text-white/60 text-xs leading-relaxed font-light italic mb-4">
              "{item.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold tracking-widest shrink-0"
                style={{ backgroundColor: `${item.accent}15`, border: `1px solid ${item.accent}30`, color: item.accent }}
              >
                {item.avatar}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">{item.author}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider">{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
