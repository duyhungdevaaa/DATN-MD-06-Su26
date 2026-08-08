/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ActiveTab {
  DASHBOARD = "dashboard",
  ORDERS = "orders",
  USERS = "users",
  PRODUCTS = "products",
  CATEGORIES = "categories",
<<<<<<< HEAD
  REPORTS = "reports",
=======
  VOUCHERS = "vouchers",
>>>>>>> origin/main
  SETTINGS = "settings",
  NOTIFICATIONS = "notifications",
  BANNERS = "banners",
}

export enum ProductStatus {
  ACTIVE = "active",
  DRAFT = "draft",
  ARCHIVED = "archived",
}

export enum UserTier {
  GOLD = "GOLD",
  SILVER = "SILVER",
  GUEST = "GUEST",
}

export enum OrderStatus {
  AWAITING_PAYMENT = "Chờ xác nhận",
  PROCESSING = "Đang xử lý",
  SHIPPING = "Đang giao hàng",
  DELIVERED = "Đã giao hàng",
  CANCELLED = "Đã hủy",
  REFUNDED = "Trả hàng/Hoàn tiền",
  REFUND_COMPLETED = "Đã hoàn tiền",
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl: string;
  lastModified: string;
  discount?: number;
  sizes?: string[];
  colors?: string[];
  variants?: Array<{ size: string; color: string; quantity: number }>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isLive: boolean;
  imageUrl: string;
  slug: string;
  productCount: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerAvatar: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  paymentEndingCard: string;
  status: OrderStatus;
  date: string;
  time: string;
  timeline: {
    confirmed: { active: boolean; time: string };
    packing: { active: boolean; time: string };
    shipping: { active: boolean; time: string };
    delivered: { active: boolean; time: string };
  };
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  tier: UserTier;
  email: string;
  phone?: string;
<<<<<<< HEAD
  phoneVerified?: boolean;
=======
>>>>>>> origin/main
  joinedDate: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountAmount: number;
  discountRate: number;
  maximumDiscount: number;
  expirationDate: string;
}
