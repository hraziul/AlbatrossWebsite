import { Link } from 'react-router-dom';

interface NavProps {
  /** Retained for call-site compatibility with existing pages; the shell
   * is Deep Obsidian everywhere now, so both values render identically. */
  theme?: 'light' | 'dark';
}

export function Nav({}: NavProps) {
  return (
    <nav className="glass-panel sticky top-0 z-20 flex items-center justify-between px-6 py-5 md:px-12">
      <Link to="/" className="font-serif text-xl tracking-tight text-[var(--text-primary)]">
        Albatross Sites
      </Link>
      <a
        href="https://albatrossamaze.com"
        className="text-mono text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
      >
        ← Back to Albatross
      </a>
    </nav>
  );
}
