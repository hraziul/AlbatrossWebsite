export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  hoverImage?: string;
  isNew?: boolean;
  slug: string;
  details?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}
