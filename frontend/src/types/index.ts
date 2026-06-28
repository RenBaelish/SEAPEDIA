
export enum RoleType {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  BUYER = "BUYER",
  DRIVER = "DRIVER",
}

export enum ProductStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
}

export enum StoreStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CLOSED = "CLOSED",
}

export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  IN_DELIVERY = "IN_DELIVERY",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum DeliveryStatus {
  AWAITING_DRIVER = "AWAITING_DRIVER",
  DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
}

export enum VoucherType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
  FREE_SHIPPING = "FREE_SHIPPING",
}

export enum WalletTxType {
  TOPUP = "TOPUP",
  TOP_UP = "TOP_UP",
  PURCHASE = "PURCHASE",
  REFUND = "REFUND",
  WITHDRAWAL = "WITHDRAWAL",
  COMMISSION = "COMMISSION",
  DELIVERY_EARNING = "DELIVERY_EARNING",
  INCOME = "INCOME",
  PAYMENT = "PAYMENT",
}

export enum AddressType {
  HOME = "HOME",
  OFFICE = "OFFICE",
  WAREHOUSE = "WAREHOUSE",
  OTHER = "OTHER",
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  activeRole?: RoleType;
}

export interface TokenPayload {
  sub: string;
  activeRole: RoleType;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  profilePictureUrl?: string;
  gender?: string;
  birthDate?: string;
  isVerified: boolean;
  roles: RoleType[];
  activeRole: RoleType;
  createdAt: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  rating: number;
  sold: number;
  stock: number;
  images: string[];
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeLogoUrl?: string | null;
  status: ProductStatus;
}

export interface ProductDetail extends ProductSummary {
  storeRating?: number;
  storeTotalSales?: number;
  description: string;
  weight: number;
  sku?: string;
  categoryId: string;
  categoryName: string;
  createdAt: string;
}

export interface CartItemDto {
  id: string;
  productId: string;
  quantity: number;
  note?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: { url: string }[];
  };
}

export interface CartDto {
  id: string;
  storeId?: string | null;
  store?: {
    id: string;
    name: string;
  };
  items: CartItemDto[];
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  storeName: string;
  storeSlug: string;
  createdAt: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productImg?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDetail {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentRef?: string;
  notes?: string;
  items: OrderItemDto[];
  statusHistory: { status: OrderStatus; note?: string; createdAt: string }[];
  deliveryJob?: DeliveryJobDto;
  createdAt: string;
}

export interface DeliveryJobDto {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  pickupAddress: string;
  dropAddress: string;
  distance?: number;
  fee: number;
  driverId?: string;
  driverName?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export interface VoucherDto {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
}

export interface ReviewDto {
  id: string;
  rating: number;
  comment?: string;
  mediaUrls: string[];
  buyerName: string;
  buyerAvatar?: string;
  createdAt: string;
}

export interface WalletDto {
  id: string;
  userId: string;
  balance: number;
}

export interface WalletTransactionDto {
  id: string;
  walletId: string;
  type: WalletTxType;
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}
