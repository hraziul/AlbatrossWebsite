export type TemplateId = 'dental' | 'marriage-hall' | 'renovation' | 'fitness';

export const TEMPLATE_IDS: TemplateId[] = ['dental', 'marriage-hall', 'renovation', 'fitness'];

export interface ServiceItem {
  title: string;
  description: string;
}

export interface TemplateCopy {
  headline: string;
  subheadline: string;
  aboutTitle: string;
  aboutBody: string;
  services: ServiceItem[];
  ctaLabel: string;
  ctaSubtext: string;
  footerTagline: string;
}

export const TEMPLATE_META: Record<TemplateId, { label: string; route: string }> = {
  dental: { label: 'Dental Clinic', route: '/dental' },
  'marriage-hall': { label: 'Marriage & Banquet Hall', route: '/marriage-hall' },
  renovation: { label: 'Home Renovation & Interiors', route: '/renovation' },
  fitness: { label: 'Fitness & Yoga Studio', route: '/fitness' },
};

export const PLACEHOLDER_COPY: Record<TemplateId, TemplateCopy> = {
  dental: {
    headline: 'Dentistry That Actually Feels Good',
    subheadline:
      "Modern, gentle care for your whole family — from routine cleanings to same-day emergencies.",
    aboutTitle: 'Care Built Around You',
    aboutBody:
      "We know a dentist visit isn't anyone's favorite hour. That's why every room, every appointment, and every explanation is designed to keep you calm, informed, and out the door faster than you expected.",
    services: [
      { title: 'Preventive Care', description: 'Cleanings, exams, and X-rays that catch problems before they become expensive ones.' },
      { title: 'Cosmetic Dentistry', description: "Whitening, veneers, and bonding for a smile you're not afraid to show off." },
      { title: 'Emergency Visits', description: "Same-day appointments for chipped teeth, sudden pain, or anything that can't wait." },
      { title: 'Family & Kids', description: 'Gentle, patient care for your youngest patients, from their first visit onward.' },
    ],
    ctaLabel: 'Book a Free Consultation',
    ctaSubtext: 'No pressure, no obligation — just a conversation about your smile.',
    footerTagline: 'Your smile, taken seriously.',
  },
  'marriage-hall': {
    headline: 'Where Your Story Gets Its Grand Entrance',
    subheadline: 'A banquet hall built for weddings, receptions, and the nights people talk about for years.',
    aboutTitle: 'A Venue That Does the Heavy Lifting',
    aboutBody:
      'From the first walkthrough to the last dance, our team handles the details so you can actually be present at your own event — catering, lighting, and seating, all coordinated in-house.',
    services: [
      { title: 'Wedding Receptions', description: 'Full-service styling and coordination for up to 500 guests.' },
      { title: 'Engagement & Sangeet', description: 'Intimate to extravagant — spaces that scale to your celebration.' },
      { title: 'Corporate Galas', description: 'Award nights, product launches, and year-end events done properly.' },
      { title: 'In-House Catering', description: 'Custom menus from our own kitchen, tasted and tailored before the big day.' },
    ],
    ctaLabel: 'Check Your Date',
    ctaSubtext: "Tell us your date and guest count — we'll tell you what's possible.",
    footerTagline: 'Every celebration deserves a grand room.',
  },
  renovation: {
    headline: 'Homes, Rebuilt Around How You Actually Live',
    subheadline:
      'Full renovations and interior design for kitchens, living spaces, and homes that stopped working for you years ago.',
    aboutTitle: 'Design That Survives Contact With Real Life',
    aboutBody:
      "We've seen enough beautiful renders that fall apart in practice. Every project starts with how you actually use a space, then gets the finish quality it deserves — on a timeline and budget you agreed to upfront.",
    services: [
      { title: 'Kitchen Renovations', description: 'Layout, cabinetry, and finishes redone from the studs out.' },
      { title: 'Full Home Remodels', description: 'Multi-room renovations managed start to finish, one point of contact.' },
      { title: 'Interior Design', description: 'Furniture, lighting, and material selection for spaces that already feel finished.' },
      { title: 'Bathroom Remodels', description: 'Fixtures, tiling, and layouts that make small rooms feel deliberate.' },
    ],
    ctaLabel: 'Get a Project Estimate',
    ctaSubtext: "Send us a few photos — we'll give you a real number, not a guess.",
    footerTagline: 'Built for the way you actually live.',
  },
  fitness: {
    headline: "Show Up. We'll Handle The Rest.",
    subheadline: 'Strength, yoga, and conditioning classes built around real schedules, not perfect ones.',
    aboutTitle: 'A Studio That Meets You Where You Are',
    aboutBody:
      "No judgment, no clique, no impossible pace. Our coaches build every class to work whether you're on week one or year five — you just have to show up.",
    services: [
      { title: 'Strength & Conditioning', description: 'Coached group sessions built around real progress, not burnout.' },
      { title: 'Vinyasa & Restorative Yoga', description: 'Classes for every energy level, from sunrise flow to evening wind-down.' },
      { title: 'Personal Training', description: '1-on-1 programming for specific goals, injuries, or events.' },
      { title: 'Open Gym Access', description: 'Member access outside class hours, whenever your schedule allows.' },
    ],
    ctaLabel: 'Claim Your First Class Free',
    ctaSubtext: 'No contract, no credit card — just show up once and see.',
    footerTagline: 'Consistency beats intensity.',
  },
};
