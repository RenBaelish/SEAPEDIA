import { clsx } from "clsx";

// ─── Skeleton Box ──────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={clsx("skeleton", className)} style={style} />;
}

// ─── Product Card Skeleton ─────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border-3 border-nb-black" style={{ borderWidth: '3px', borderColor: '#0A0A0A' }}>
      {/* Image */}
      <div className="aspect-square skeleton" />
      {/* Content */}
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// ─── Table Row Skeleton ────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3 border-b border-gray-100">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
