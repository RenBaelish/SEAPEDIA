import { clsx } from "clsx";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs:  "w-6 h-6 text-xs",
  sm:  "w-8 h-8 text-sm",
  md:  "w-10 h-10 text-base",
  lg:  "w-14 h-14 text-lg",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={clsx(
        "flex-shrink-0 flex items-center justify-center overflow-hidden",
        "border-2 border-nb-black font-bold select-none",
        sizeClasses[size],
        !src && "bg-nb-yellow text-nb-black",
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
