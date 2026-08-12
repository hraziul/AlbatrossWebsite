import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BusinessProvider } from './context/BusinessContext';
import { useLenis } from './hooks/useLenis';
import { GlobalCanvas } from './components/3d/GlobalCanvas';
import Gallery from './pages/Gallery';

// Lazy-loaded per route: each template page pulls in its own Three.js/GSAP
// weight (the single-bundle build was 1.5MB+ minified). Gallery — the
// landing route every visitor hits first, mobile included — no longer has
// to download code for templates the visitor may never open, including
// the three (dental/marriage-hall/fitness) currently on hold and unlinked
// from the Gallery grid entirely.
const DentalPage = lazy(() => import('./pages/templates/DentalPage'));
const MarriageHallPage = lazy(() => import('./pages/templates/MarriageHallPage'));
const RenovationPage = lazy(() => import('./pages/templates/RenovationPage'));
const FitnessPage = lazy(() => import('./pages/templates/FitnessPage'));
// Named export, not a page module under templates/ — RealEstateLuxury is a
// bespoke flagship component rather than a TemplateCopy-driven niche page.
const RealEstateLuxuryPage = lazy(() =>
  import('./components/RealEstateLuxury').then((m) => ({ default: m.RealEstateLuxury })),
);

const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  useLenis();

  return (
    <BusinessProvider>
      <BrowserRouter basename={ROUTER_BASENAME}>
        {/* Mounted once, inside the router (needs useLocation for
            route-aware 3D content) but outside <Routes> — persists across
            route changes rather than remounting per page. */}
        <GlobalCanvas />
        <Suspense fallback={<div className="fixed inset-0 bg-[#07080A]" />}>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/dental" element={<DentalPage />} />
            <Route path="/marriage-hall" element={<MarriageHallPage />} />
            <Route path="/renovation" element={<RenovationPage />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/real-estate" element={<RealEstateLuxuryPage />} />
            <Route path="*" element={<Gallery />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </BusinessProvider>
  );
}
