import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from "clsx";

type Variant = "primary" | "yellow" | "secondary" | "link" | "ghost" | "danger";
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
  primary:   "nb-btn nb-btn-primary",
  yellow:    "nb-btn nb-btn-yellow",
  secondary: "nb-btn nb-btn-white",
  ghost:     "bg-transparent border-transparent shadow-none text-nb-black font-semibold text-sm hover:bg-gray-100 transition-colors",
  link:      "bg-transparent text-nb-black font-semibold text-sm p-0 h-auto hover:text-nb-blue underline-offset-2 hover:underline",
  danger:    "nb-btn nb-btn-danger",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "", // height via --btn-height CSS var
  lg: "h-12 px-6 text-base",
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
    const isNbBtn = ["primary", "yellow", "secondary", "danger"].includes(variant);
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          variantClasses[variant],
          // For non-nb-btn variants add size manually
          !isNbBtn && variant !== "link" && sizeClasses[size],
          // For nb-btn, only sm/lg override
          isNbBtn && size === "sm" && "h-9 px-3 text-xs",
          isNbBtn && size === "lg" && "h-12 px-6 text-base",
          fullWidth && "w-full",
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
