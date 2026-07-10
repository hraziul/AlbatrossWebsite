import React, { useEffect, useState } from 'react';
import { useThemeBackground } from '../hooks/useThemeBackground';

export default function BackgroundCanvas() {
  const { currentImage, nextImage, isTransitioning } = useThemeBackground();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    // Track mouse coordinates for the clear reveal zone
    const handlePointerMove = (e: PointerEvent) => {
      // Don't track if touch device
      if (e.pointerType === 'touch') {
        setIsHovering(false);
        return;
      }
      setIsHovering(true);
      
      // Update coordinates smoothly
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerleave', handlePointerLeave);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  if (!currentImage) return null;

  // Mask style: radial gradient centered at pointer position
  // Outer default state is heavily blurred (blur-3xl).
  // Under the hover zone, the blur is reduced to about 30% at the center, fading to 100% blur at 150px edge.
  const maskStyle = isHovering
    ? {
        maskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,1) 100%)`,
        WebkitMaskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,1) 100%)`
      }
    : {};

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 select-none overflow-hidden bg-[#030303]">
      {/* 1. Underlying Mildly Blurred / Base Layer */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-[1000ms] ease-in-out opacity-45 scale-105"
        style={{ 
          backgroundImage: `url(${currentImage})`,
          filter: 'blur(8px) brightness(0.25)'
        }}
      />

      {/* 2. Front Heavily Blurred Layer (The default blurred state) */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-[1000ms] ease-in-out opacity-65 scale-105"
        style={{ 
          backgroundImage: `url(${currentImage})`,
          filter: 'blur(60px) brightness(0.25)',
          ...maskStyle
        }}
      />

      {/* 3. Soft Glow Reveal Overlay (Behind z-10 cards & text) */}
      {isHovering && (
        <div 
          className="absolute rounded-full pointer-events-none mix-blend-screen opacity-20"
          style={{ 
            left: mousePos.x - 175,
            top: mousePos.y - 175,
            width: 350,
            height: 350,
            background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(217,70,239,0.04) 60%, transparent 100%)',
            filter: 'blur(15px)'
          }}
        />
      )}

      {/* Crossfade Layer for next preloaded image */}
      {nextImage && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-[800ms] opacity-0 pointer-events-none scale-105"
          style={{ 
            backgroundImage: `url(${nextImage})`,
            filter: 'blur(30px) brightness(0.25)'
          }}
        />
      )}

      {/* Fine overlay grid for zine texture */}
      <div className="absolute inset-0 bg-repeat opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    </div>
  );
}
