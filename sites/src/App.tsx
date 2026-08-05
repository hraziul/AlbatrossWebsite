import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BusinessProvider } from './context/BusinessContext';
import { useLenis } from './hooks/useLenis';
import { GlobalCanvas } from './components/3d/GlobalCanvas';
import Gallery from './pages/Gallery';
import DentalPage from './pages/templates/DentalPage';
import MarriageHallPage from './pages/templates/MarriageHallPage';
import RenovationPage from './pages/templates/RenovationPage';
import FitnessPage from './pages/templates/FitnessPage';

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
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/dental" element={<DentalPage />} />
          <Route path="/marriage-hall" element={<MarriageHallPage />} />
          <Route path="/renovation" element={<RenovationPage />} />
          <Route path="/fitness" element={<FitnessPage />} />
          <Route path="*" element={<Gallery />} />
        </Routes>
      </BrowserRouter>
    </BusinessProvider>
  );
}
