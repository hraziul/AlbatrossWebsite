import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { HelpCircle, RefreshCw, Send, AlertTriangle, Loader2 } from 'lucide-react';

export default function RequestDesign() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsLoaded(false);
    setLoadError(false);

    // 1. Remove previous script tags to prevent duplicates and force re-initialization
    const existingScript = document.querySelector('script[src="https://static-bundles.visme.co/forms/vismeforms-embed.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // 2. Append Visme script tag
    const script = document.createElement('script');
    script.src = "https://static-bundles.visme.co/forms/vismeforms-embed.js";
    script.async = true;
    
    script.onerror = () => {
      setLoadError(true);
    };

    document.body.appendChild(script);

    // 3. Set polling interval to detect when Visme renders the iframe
    const interval = setInterval(() => {
      const container = document.querySelector('.visme_d');
      if (container && container.querySelector('iframe')) {
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, 200);

    // 4. Setup watchdog timeout for slow loading or network failure (7 seconds)
    const timeout = setTimeout(() => {
      const container = document.querySelector('.visme_d');
      const hasIframe = container && container.querySelector('iframe');
      if (!hasIframe) {
        setLoadError(true);
        clearInterval(interval);
      }
    }, 7000);

    // 5. Cleanup script and timers on component unmount
    return () => {
      script.remove();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 min-h-screen text-left bg-transparent">
      <SEO 
        title="Request Your Custom Design | Albatross Goods India" 
        description="Collaborate with the Albatross Design Lab. Submit your subculture inspiration brief and custom design request." 
      />

      {/* Page Header */}
      <div className="mb-8 border-b border-white/5 pb-6">
        <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-orange-400 block mb-2">
          ✦ CREATIVE INTAKE SERVICE
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-white mb-3">
          Request Your Design
        </h1>
        <p className="text-white/40 text-xs leading-relaxed max-w-xl font-sans font-light">
          Submit your brief, reference links, and design goals below. The Albatross Design Lab reviews all submissions to construct heavyweight custom drops.
        </p>
      </div>

      {/* Centered Form Wrapper Frame */}
      <div className="w-full min-h-[500px] relative flex flex-col justify-center py-4 overflow-visible">
        
        {/* Loading Indicator */}
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-white/30 py-20 bg-[#070707]/10 backdrop-blur-xs z-10">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
            <span className="text-[10px] font-display uppercase tracking-widest font-bold">
              Loading design brief...
            </span>
          </div>
        )}

        {/* Visme Embed Content */}
        {!loadError ? (
          <div 
            className={`visme_d w-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ width: '100%', maxWidth: '100%', overflow: 'visible' }}
            data-title="Simple Subscription Sign Up Form" 
            data-url="8kvgr0mp-simple-subscription-sign-up-form" 
            data-domain="forms" 
            data-full-page="false" 
            data-min-height="500px" 
            data-form-id="189602"
          />
        ) : (
          /* High Contrast Fallback UI for Connection Faults */
          <div className="text-center py-16 space-y-6 max-w-md mx-auto z-10 select-none border border-white/10 bg-white/[0.015] p-6 rounded-sm backdrop-blur-md">
            <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                Form Loading Slow
              </h2>
              <p className="text-white/40 text-[10px] leading-relaxed font-sans font-light">
                The request form is loading slowly. Please refresh the page, check your connection, or contact support directly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 px-5 py-2.5 border border-white/10 hover:border-cyan-400 text-white hover:text-cyan-400 text-[9px] font-display font-bold uppercase tracking-wider transition-colors rounded-sm cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              <a
                href="mailto:studio@albatrossgoods.in"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-orange-400 hover:text-black text-[9px] font-display font-bold uppercase tracking-wider transition-colors rounded-sm cursor-pointer"
              >
                <Send className="w-3 h-3" />
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Trust Guide Notes */}
      <div className="mt-8 p-5 bg-white/[0.01] border border-white/5 rounded-sm flex items-start gap-4 text-left">
        <HelpCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5 min-w-0">
          <h4 className="text-[10px] font-display font-bold uppercase tracking-wider text-white/70">
            Design Verification & Setup
          </h4>
          <p className="text-white/35 text-[10px] leading-relaxed font-sans font-light">
            Submissions are evaluated by our design studio. If approved, we will configure your designs in the backend catalog, generate custom mockups, and email you a direct product buy-link within 48 hours.
          </p>
        </div>
      </div>

    </div>
  );
}
