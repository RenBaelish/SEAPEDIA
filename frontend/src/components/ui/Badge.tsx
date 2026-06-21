import { HTMLAttributes } from 'react';
import { clsx } from "clsx";
import { OrderStatus, DeliveryStatus } from '@/types';

type BadgeVariant = "success" | "warning" | "error" | "info" | "muted" | "brand";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, string> = {
  success: "bg-primary-light text-primary",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-error",
  info: "bg-blue-50 text-blue-700",
  muted: "bg-muted text-secondary",
  brand: "bg-[#EEEEF9] text-brand",
};

export function Badge({ variant = "muted", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-full",
        "text-xs leading-[14px] font-semibold",
        "px-2.5 py-0.5",
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── Status Badge helpers ──────────────────────────────────────────────────

const orderStatusVariant: Record<OrderStatus, BadgeVariant> = {
  PENDING_PAYMENT: "warning",
  PAID: "info",
  PROCESSING: "info",
  READY_FOR_PICKUP: "info",
  IN_DELIVERY: "brand",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "error",
  REFUNDED: "muted",
};

const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  READY_FOR_PICKUP: "Siap Diambil",
  IN_DELIVERY: "Dalam Pengiriman",
  DELIVERED: "Terkirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={orderStatusVariant[status]}>
      {orderStatusLabel[status]}
    </Badge>
  );
}

const deliveryStatusVariant: Record<DeliveryStatus, BadgeVariant> = {
  AWAITING_DRIVER: "muted",
  DRIVER_ASSIGNED: "info",
  PICKED_UP: "brand",
  IN_TRANSIT: "brand",
  DELIVERED: "success",
  FAILED: "error",
};

const deliveryStatusLabel: Record<DeliveryStatus, string> = {
  AWAITING_DRIVER: "Mencari Driver",
  DRIVER_ASSIGNED: "Driver Ditugaskan",
  PICKED_UP: "Diambil Driver",
  IN_TRANSIT: "Dalam Perjalanan",
  DELIVERED: "Terkirim",
  FAILED: "Gagal",
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <Badge variant={deliveryStatusVariant[status]}>
      {deliveryStatusLabel[status]}
    </Badge>
  );
}
