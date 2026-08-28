import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] font-sans text-white relative overflow-x-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-50px] right-[-50px] w-[350px] h-[350px] bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-20">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
