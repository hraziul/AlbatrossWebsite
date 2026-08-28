import { useState } from 'react';

export default function RequestDesign() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-24">
      <div className="mb-12">
        <div className="inline-block px-3 py-1 bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400 text-[10px] uppercase tracking-widest font-bold mb-6 rounded-sm">
          Exclusive Service
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase mb-6 leading-tight">
          Request Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Exclusive Design</span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
          Commission a custom piece. Provide your references, themes, and aesthetic preferences. We'll craft a limited-edition design just for you.
        </p>
      </div>

      {submitted ? (
        <div className="bg-black/40 backdrop-blur-xl p-12 text-center border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-cyan-400 mb-4 relative z-10">Request Received</h2>
          <p className="text-white/60 relative z-10">
            Our design team will review your references and get back to you within 48 hours.
          </p>
        </div>
      ) : (
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Full Name</label>
              <input type="text" required className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Email Address</label>
              <input type="email" required className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors" placeholder="Enter your email" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Inspiration Source / Theme</label>
            <input type="text" required className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors" placeholder="e.g. 80s Anime, French New Wave, Synthwave" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Color Preference</label>
              <input type="text" className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors" placeholder="e.g. Monochrome, Neon" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Garment Type</label>
              <select className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors text-white/80 appearance-none rounded-none">
                <option>Heavyweight Tee</option>
                <option>French Terry Hoodie</option>
                <option>Longsleeve</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Fit Preference</label>
              <select className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors text-white/80 appearance-none rounded-none">
                <option>Oversized / Boxy</option>
                <option>Standard / Relaxed</option>
                <option>Slim Fit</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Reference Links (Moodboards, Images)</label>
            <input type="url" className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors" placeholder="https://" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Additional Notes</label>
            <textarea rows={5} className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors resize-none" placeholder="Tell us more about your vision..."></textarea>
          </div>

          <button type="submit" className="px-8 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-auto">
            Submit Your Design Idea
          </button>
        </form>
      )}
    </div>
  );
}
