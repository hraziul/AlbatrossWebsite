import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// TODO: swap for licensed assets before ship — Pexels placeholders only.
const HERO_VIDEO_URL =
  'https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_30fps.mp4';
const PARALLAX_IMAGE_PRIMARY =
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200';
const PARALLAX_IMAGE_SECONDARY =
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200';

const STATS = [
  { value: '5', label: 'Bedrooms' },
  { value: '232m²', label: 'Living Space' },
  { value: '19/7', label: 'Concierge' },
  { value: '4', label: 'Parking Bays' },
];

export function RealEstateLuxury() {
  // URLSearchParams#get() already URL-decodes the value — wrapping it in
  // decodeURIComponent() again would double-decode and throw on a brand
  // name containing a literal "%" (e.g. "100% Luxury Realty").
  const searchParams = new URLSearchParams(window.location.search);
  const urlBrand = searchParams.get('brand');
  const displayBrand = urlBrand ? urlBrand : 'THE PINNACLE RESIDENCE';

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  const scale = useTransform(heroProgress, [0, 1], [1, 0.85]);
  const borderRadius = useTransform(heroProgress, [0, 1], ['0px', '24px']);

  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: parallaxProgress } = useScroll({
    target: parallaxRef,
    offset: ['start end', 'end start'],
  });

  const yPrimary = useTransform(parallaxProgress, [0, 1], [-50, 50]);
  const ySecondary = useTransform(parallaxProgress, [0, 1], [50, -50]);

  return (
    <>
      <div ref={heroRef} className="relative h-[200vh] bg-[#F5F5F7]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          <motion.div
            className="relative w-full h-full overflow-hidden shadow-2xl"
            style={{ scale, borderRadius }}
          >
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO_VIDEO_URL}
              autoPlay
              muted
              loop
              playsInline
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
              <span className="font-sans text-xs sm:text-sm font-light uppercase tracking-[0.4em] text-white/80">
                The Pinnacle of Luxury
              </span>
              <h1 className="mt-4 font-luxury font-medium text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
                {displayBrand}
              </h1>
            </div>
          </motion.div>
        </div>
      </div>

      <section className="relative bg-[#F5F5F7] w-full z-10 px-6 md:px-20 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24"
        >
          <div>
            <span className="font-sans text-xs font-light uppercase tracking-[0.4em] text-black/50">
              Welcome To
            </span>
            <h2 className="mt-4 font-luxury font-light text-5xl md:text-7xl leading-[0.95] tracking-tight text-black">
              {displayBrand}
            </h2>
          </div>
          <div className="flex items-end">
            <p className="font-sans text-base md:text-lg font-light leading-relaxed text-black/50">
              {displayBrand} blends resort-inspired living with uncompromising architectural
              precision. Fully furnished residences featuring panoramic views, elite wellness
              amenities, and bespoke concierge services.
            </p>
          </div>
        </motion.div>

        <div className="mt-24 flex flex-wrap md:flex-nowrap">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 min-w-[45%] md:min-w-0 px-6 py-6 md:py-0 ${
                i !== 0 ? 'border-l border-black/10' : ''
              }`}
            >
              <div className="font-luxury font-light text-4xl md:text-6xl text-black">
                {stat.value}
              </div>
              <div className="mt-2 font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-black/40">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={parallaxRef}
        className="relative bg-[#F5F5F7] w-full z-10 px-6 md:px-20 pb-24 md:pb-32 overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            style={{ y: yPrimary }}
            className="overflow-hidden aspect-[4/5] mt-0 md:mt-16"
          >
            <img
              src={PARALLAX_IMAGE_PRIMARY}
              alt="Interior detail of the residence"
              className="h-full w-full object-cover grayscale-[35%]"
            />
          </motion.div>
          <motion.div style={{ y: ySecondary }} className="overflow-hidden aspect-[4/5]">
            <img
              src={PARALLAX_IMAGE_SECONDARY}
              alt="Facade detail of the residence"
              className="h-full w-full object-cover grayscale-[35%]"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
