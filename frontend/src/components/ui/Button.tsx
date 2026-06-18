import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "link" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white font-bold text-[12px] hover:bg-primary-hover disabled:opacity-50",
  secondary:
    "bg-white text-secondary font-bold text-[12px] border border-border hover:bg-muted disabled:opacity-50",
  ghost:
    "bg-transparent text-on-surface font-semibold text-[12px] hover:bg-muted disabled:opacity-50",
  link:
    "bg-transparent text-on-surface font-semibold text-[12px] p-0 h-auto hover:text-primary underline-offset-2 hover:underline",
  danger:
    "bg-error text-white font-bold text-[12px] hover:bg-red-600 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px]",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-md transition-colors duration-150 cursor-pointer select-none",
          variantClasses[variant],
          variant !== "link" && sizeClasses[size],
          fullWidth && "w-full",
          "disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
