import { Product, Category } from './types';

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Akira Cyberpunk Tee',
    price: 3499,
    description: 'Neon-drenched Neo-Tokyo aesthetics on premium 240 GSM heavy cotton. A tribute to 80s cyberpunk anime.',
    category: 'Cinema & Anime',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
    hoverImage: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800',
    isNew: true,
    slug: 'akira-cyberpunk-tee',
    details: ['100% Premium Cotton', '240 GSM Heavyweight', 'Oversized Fit', 'High-density puff print']
  },
  {
    id: 'p2',
    name: 'Vintage Vinyl Echoes',
    price: 2999,
    description: 'Analog warmth in visual form. Inspired by 70s rock album covers and psychedelic art.',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
    isNew: false,
    slug: 'vintage-vinyl-echoes',
    details: ['100% Organic Cotton', '200 GSM', 'Relaxed Fit', 'Discharge print for soft feel']
  },
  {
    id: 'p3',
    name: 'Noir Detective Edition',
    price: 3299,
    description: 'Shadows, fog, and mystery. A monochrome masterpiece for fans of classic film noir.',
    category: 'Cinema',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
    slug: 'noir-detective-edition',
    details: ['100% Premium Cotton', '220 GSM', 'Boxy Fit', 'Screen printed graphics']
  },
  {
    id: 'p4',
    name: 'Cosmic Horror Hoodie',
    price: 5499,
    description: 'Eldritch terrors and unknown dimensions. Heavyweight hoodie featuring intricate occult artwork.',
    category: 'Comics & Art',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
    isNew: true,
    slug: 'cosmic-horror-hoodie',
    details: ['400 GSM French Terry', 'Drop shoulder', 'Double-lined hood', 'Embroidered details']
  },
  {
    id: 'p5',
    name: 'Synthwave Sunset',
    price: 2999,
    description: 'Grid lines, palm trees, and endless highways. Retro-futuristic vibes in vibrant neon colors.',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    slug: 'synthwave-sunset',
    details: ['100% Premium Cotton', '200 GSM', 'Standard Fit', 'Vibrant DTG print']
  },
  {
    id: 'p6',
    name: 'Kurosawa Samurai Silhouette',
    price: 3499,
    description: 'A minimalist homage to classic samurai cinema. Striking contrast and bold composition.',
    category: 'Cinema',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
    slug: 'kurosawa-samurai-silhouette',
    details: ['100% Premium Cotton', '240 GSM Heavyweight', 'Oversized Fit', 'High-density print']
  }
];

export const categories: Category[] = [
  {
    id: 'c1',
    name: 'Music Inspired',
    slug: 'music',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c2',
    name: 'Cinema & Anime',
    slug: 'cinema',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c3',
    name: 'Comics & Visual Culture',
    slug: 'comics',
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=800'
  }
];
