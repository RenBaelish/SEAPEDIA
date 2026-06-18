import { HTMLAttributes } from 'react';
import { clsx } from "clsx";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string; // for initials fallback
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[12px]",
  lg: "w-12 h-12 text-[14px]",
  xl: "w-16 h-16 text-[18px]",
};

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// Deterministic background color from name
const colors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
function getColor(name?: string) {
  if (!name) return colors[0];
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

export function Avatar({ src, alt, name, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={clsx(
        "rounded-full overflow-hidden flex items-center justify-center shrink-0 select-none",
        sizeClasses[size],
        !src && getColor(name),
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt ?? name ?? "avatar"} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold">{getInitials(name)}</span>
      )}
    </div>
  );
}
