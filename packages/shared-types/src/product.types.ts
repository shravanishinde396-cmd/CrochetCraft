export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  salePrice?: number | null;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  featured: boolean;
  bestSeller: boolean;
  isActive: boolean;
  stockStatus: StockStatus;
  lowStockThreshold: number;
  weight?: number | null;
  dimensions?: any | null; // ProductDimensions as Json
  tags: string[];
  material?: string | null;
  careInstructions?: string | null;
  rating: number;
  reviewsCount: number;
  totalSold: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: Category;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId?: string | null;
  rating: number; // 1-5
  title?: string | null;
  review: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: {
    name: string;
    avatar?: string | null;
  };
}
