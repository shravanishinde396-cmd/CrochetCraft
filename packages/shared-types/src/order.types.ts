import { User, Address } from './user.types';
import { Product } from './product.types';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'RAZORPAY' | 'COD';

export type DiscountType = 'PERCENTAGE' | 'FLAT' | 'FIRST_PURCHASE' | 'CATEGORY';

export type RefundStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PROCESSED';

export type CustomOrderStatus =
  | 'PENDING'
  | 'REVIEWED'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number | null;
  expiryDate: string | Date;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  isFirstPurchase: boolean;
  categoryId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  taxAmount: number;
  total: number;
  couponId?: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  giftWrapping: boolean;
  giftMessage?: string | null;
  notes?: string | null;
  invoiceUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  items?: OrderItem[];
  user?: User;
  address?: Address;
  coupon?: Coupon | null;
}

export interface CustomOrder {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  referenceImages: string[];
  colorPreferences?: string | null;
  quantity: number;
  specialInstructions?: string | null;
  status: CustomOrderStatus;
  quotedPrice?: number | null;
  adminNote?: string | null;
  dueDate?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Refund {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  description?: string | null;
  images: string[];
  amount: number;
  status: RefundStatus;
  adminNote?: string | null;
  razorpayRefundId?: string | null;
  requestedAt: string | Date;
  reviewedAt?: string | Date | null;
  processedAt?: string | Date | null;
  order?: Order;
}
