export interface ProductCard {
  id: string;
  title: string;
  slug: string;
  priceMZN: number;
  originalPriceMZN: number | null;
  rating: number;
  reviewCount: number;
  sold: number;
  freeShipping: boolean;
  images: { url: string; alt?: string | null }[];
}

export interface ProductDetail extends ProductCard {
  description: string | null;
  stock: number;
  minOrder: number;
  shippingDays: string | null;
  category: { id: string; name: string; slug: string } | null;
  variants: ProductVariant[];
  reviews: ReviewData[];
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceMZN: number | null;
  stock: number;
  image: string | null;
}

export interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  images: string[];
  verified: boolean;
  createdAt: string;
  user: { name: string | null; image: string | null };
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  children?: CategoryData[];
  productCount?: number;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalMZN: number;
  createdAt: string;
  items: OrderItemData[];
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

export interface OrderItemData {
  id: string;
  title: string;
  image: string | null;
  variant: string | null;
  quantity: number;
  priceMZN: number;
}

export interface BannerData {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  link: string | null;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  freeShipping?: boolean;
  sort?: "price_asc" | "price_desc" | "newest" | "popular" | "rating";
  page?: number;
  limit?: number;
}
