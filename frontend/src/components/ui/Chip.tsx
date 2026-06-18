import { HTMLAttributes } from 'react';
import { clsx } from "clsx";

interface ChipProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  as?: "button" | "span";
}

export function Chip({ active = false, as: Tag = "button", className, children, ...props }: ChipProps) {
  return (
    <Tag
      className={clsx(
        "inline-flex items-center justify-center gap-1",
        "text-[12px] leading-[18px] font-semibold",
        "border rounded-full px-3 h-8",
        "transition-colors duration-150 whitespace-nowrap",
        active
          ? "border-primary bg-primary-light text-primary"
          : "border-border bg-white text-on-surface hover:border-primary hover:bg-primary-light hover:text-primary",
        className
      )}
      {...(props as HTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </Tag>
  );
}
