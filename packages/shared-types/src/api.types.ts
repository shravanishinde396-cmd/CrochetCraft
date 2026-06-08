export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiErrorResponse {
  success: boolean; // false
  message: string;
  errors?: { field: string; message: string }[];
  stack?: string;
}

export interface CartItemResponse {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  savedForLater: boolean;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    images: string[];
    stock: number;
    stockStatus: string;
  };
}

export interface CartSummaryResponse {
  items: CartItemResponse[];
  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  taxAmount: number;
  total: number;
  appliedCoupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
}
