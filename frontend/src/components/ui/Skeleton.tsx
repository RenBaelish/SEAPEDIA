import { HTMLAttributes } from 'react';
import { clsx } from "clsx";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ width, height, rounded = "md", className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "bg-muted ",
        {
          "rounded-sm": rounded === "sm",
          "rounded-md": rounded === "md",
          "rounded-lg": rounded === "lg",
          "rounded-full": rounded === "full",
        },
        className
      )}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

// Pre-built skeleton composites for common use cases
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3 bg-surface rounded-md border border-muted">
      <Skeleton height="180px" />
      <Skeleton height="14px" width="90%" />
      <Skeleton height="14px" width="60%" />
      <Skeleton height="20px" width="50%" />
    </div>
  );
}

export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 ? "70%" : "100%"}
        />
      ))}
    </div>
  );
}
