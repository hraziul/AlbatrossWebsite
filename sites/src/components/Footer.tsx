interface FooterProps {
  /** Retained for call-site compatibility; the shell is Deep Obsidian
   * everywhere now, so both values render identically. */
  theme?: 'light' | 'dark';
}

function openEmail() {
  const subject = encodeURIComponent("let's build my site");
  const body = encodeURIComponent(
    "Hi Razi, I saw the Albatross Sites gallery and want a real site built for my business.\n\nBusiness:\n\nWhat we do:\n\nTimeline:\n\n",
  );
  window.location.href = `mailto:hraziul@gmail.com?subject=${subject}&body=${body}`;
}

export function Footer({}: FooterProps) {
  return (
    <footer className="border-t border-[var(--glass-border)] px-6 py-16 text-center md:px-12">
      <p className="mb-6 font-serif text-2xl text-[var(--text-primary)] md:text-3xl">
        Want this built for your business?
      </p>
      <button
        onClick={openEmail}
        className="rounded-full bg-[var(--accent)] px-8 py-4 text-sm font-medium text-[var(--obsidian)] transition hover:opacity-90"
      >
        Let's Build Yours — Email Raziul
      </button>
    </footer>
  );
}
