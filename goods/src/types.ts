export interface ProductVariant {
  id: number;
  size?: string;      // absent for sizeless products (e.g. tote bags)
  color: string;
  colorCode: string;
  stockStatus: string;
  image?: string;      // per-color mockup, used to swap the product photo on color change
  hoverImage?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  hoverImage?: string;
  isNew?: boolean;
  isTrending?: boolean;
  isBasic?: boolean;
  slug: string;
  details?: string[];
  baseProductId?: number;
  variants?: ProductVariant[];
  /** True when the Printrove base garment is the Women's Curved Fit pattern (vs. Unisex) */
  isWomens?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  accent?: string;
  glyph?: string;
  tagline?: string;
}
