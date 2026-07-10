import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AnnouncementBar from './AnnouncementBar';
import WelcomeModal from './WelcomeModal';
import BackgroundCanvas from './BackgroundCanvas';

const THEMES = ['theme-prism', 'theme-poetry', 'theme-comic', 'theme-noir'];

export default function Layout() {
  const [activeTheme, setActiveTheme] = useState('theme-prism');
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // 1-minute rotation logic
    const lastTime = localStorage.getItem('ag_theme_last_time');
    const currentIndexStr = localStorage.getItem('ag_theme_index');
    
    const now = Date.now();
    let index = 0;

    if (currentIndexStr !== null) {
      index = parseInt(currentIndexStr, 10);
    }

    // Rotate theme if user has been away/reloaded after 60 seconds
    if (!lastTime || now - parseInt(lastTime, 10) > 60000) {
      index = (index + 1) % THEMES.length;
      localStorage.setItem('ag_theme_index', String(index));
    }

    localStorage.setItem('ag_theme_last_time', String(now));
    setActiveTheme(THEMES[index]);
  }, []);

  return (
    <div className={`theme-container min-h-screen flex flex-col font-sans text-white relative overflow-x-hidden ${activeTheme}`}>
      {/* ── DYNAMIC THEME OVERLAYS ── */}
      
      {/* 1. Prism Overlay (Music & Prism Theme) */}
      {activeTheme === 'theme-prism' && (
        <>
          <div className="grid-mesh animate-pulse opacity-40" />
          <div className="prism-leak" />
        </>
      )}

      {/* 2. Poetry Overlay (Warm handwritten scribbles) */}
      {activeTheme === 'theme-poetry' && (
        <>
          <div className="grid-mesh opacity-20" />
          <div className="poetry-handwritten-text top-[15%] left-[5%] opacity-35 max-w-[200px] leading-tight select-none">
            Riders on the storm...
          </div>
          <div className="poetry-handwritten-text bottom-[25%] right-[8%] opacity-30 select-none">
            poetic echoes of the vinyl.
          </div>
          <div
            className="fixed top-[-10%] right-[10%] w-[55vw] h-[55vw] rounded-full pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
              animation: 'float-slow 28s ease-in-out infinite alternate',
            }}
          />
        </>
      )}

      {/* 3. Comic Overlay (Halftone pop dots & meshes) */}
      {activeTheme === 'theme-comic' && (
        <>
          <div className="halftone-overlay" />
          <div
            className="fixed top-[-20%] left-[-15%] w-[65vw] h-[65vw] rounded-full pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle, rgba(234,179,8,0.05) 0%, transparent 80%)',
              animation: 'float-slow 22s ease-in-out infinite alternate',
            }}
          />
          <div
            className="fixed bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] rounded-full pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 80%)',
              animation: 'float-slower 26s ease-in-out infinite alternate',
            }}
          />
        </>
      )}

      {/* 4. Film Noir Overlay (Venetian blinds shadows & high contrast leaks) */}
      {activeTheme === 'theme-noir' && (
        <>
          <div className="grid-mesh opacity-20" />
          <div className="noir-blinds-overlay" />
          <div
            className="fixed top-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 75%)',
              animation: 'float-slow 35s ease-in-out infinite alternate',
            }}
          />
        </>
      )}

      {/* Soft animated backing glows */}
      <div
        className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.01) 0%, transparent 80%)',
          animation: 'float-slow 25s ease-in-out infinite alternate',
        }}
      />

      <style>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(4vw, 5vh) scale(1.1); }
        }
        @keyframes float-slower {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-3vw, -4vh) scale(1.05); }
        }
      `}</style>

      {/* Welcome Modal */}
      <WelcomeModal />

      {/* Dynamic Background Image & Blur-Reveal System */}
      <BackgroundCanvas />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-20">
          <Outlet />
        </main>
        <Footer />
        {isHomePage && <AnnouncementBar />}
      </div>
    </div>
  );
}
