import { ReactNode, useEffect } from 'react';

export default function TextPage({ title, children }: { title: string, children: ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} | Albatross Goods India`;
  }, [title]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase mb-12 border-b border-white/10 pb-8">{title}</h1>
      <div className="space-y-8 text-white/70 leading-relaxed text-sm">
        {children}
      </div>
    </div>
  );
}
