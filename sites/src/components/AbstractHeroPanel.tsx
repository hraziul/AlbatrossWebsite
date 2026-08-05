export type PatternVariant = 'dots' | 'rings' | 'grid' | 'stripes';

interface AbstractHeroPanelProps {
  base: string;
  accent: string;
  pattern: PatternVariant;
  className?: string;
}

export function patternStyle(pattern: PatternVariant, accent: string): React.CSSProperties {
  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${accent} 2px, transparent 2px)`,
        backgroundSize: '28px 28px',
      };
    case 'rings':
      return {
        backgroundImage: `radial-gradient(circle at 30% 40%, transparent 0, transparent 70px, ${accent} 71px, ${accent} 74px, transparent 75px, transparent 140px, ${accent} 141px, ${accent} 144px, transparent 145px)`,
        backgroundRepeat: 'no-repeat',
      };
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      };
    case 'stripes':
      return {
        backgroundImage: `repeating-linear-gradient(115deg, ${accent} 0px, ${accent} 3px, transparent 3px, transparent 26px)`,
      };
  }
}

export function AbstractHeroPanel({ base, accent, pattern, className }: AbstractHeroPanelProps) {
  return (
    <div
      className={`relative h-[420px] w-full overflow-hidden rounded-2xl shadow-xl ${className ?? ''}`}
      style={{ background: base }}
    >
      <div className="absolute inset-0 opacity-[0.16]" style={patternStyle(pattern, accent)} />
    </div>
  );
}
