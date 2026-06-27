import { clsx } from "clsx";

type BadgeVariant =
  | "default"
  | "yellow"
  | "black"
  | "red"
  | "green"
  | "blue"
  | "muted"
  | "warning";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  default:  "nb-badge nb-badge-yellow",
  yellow:   "nb-badge nb-badge-yellow",
  black:    "nb-badge nb-badge-black",
  red:      "nb-badge nb-badge-red",
  green:    "nb-badge nb-badge-green",
  blue:     "nb-badge nb-badge-blue",
  muted:    "nb-badge nb-badge-muted",
  warning:  "nb-badge bg-amber-300 text-amber-900 border-amber-500",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={clsx(variantMap[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    MENUNGGU_PEMBAYARAN: { label: "Menunggu Bayar",     variant: "warning" },
    MENUNGGU_KONFIRMASI: { label: "Menunggu Konfirmasi",variant: "blue" },
    DIKEMAS:             { label: "Dikemas",            variant: "blue" },
    DIKIRIM:             { label: "Dikirim",            variant: "blue" },
    PESANAN_SELESAI:     { label: "Selesai",            variant: "green" },
    DIBATALKAN:          { label: "Dibatalkan",         variant: "red" },
    MENUNGGU_DRIVER:     { label: "Menunggu Driver",    variant: "warning" },
    SELESAI:             { label: "Selesai",            variant: "green" },
    ACTIVE:              { label: "Aktif",              variant: "green" },
    SUSPENDED:           { label: "Suspended",          variant: "warning" },
    BANNED:              { label: "Banned",             variant: "red" },
    CLOSED:              { label: "Ditutup",            variant: "muted" },
    DRAFT:               { label: "Draft",              variant: "muted" },
    INACTIVE:            { label: "Nonaktif",           variant: "muted" },
    DELETED:             { label: "Dihapus",            variant: "red" },
  };

  const entry = map[status] ?? { label: status, variant: "muted" as BadgeVariant };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export const OrderStatusBadge = StatusBadge;
export const DeliveryStatusBadge = StatusBadge;
