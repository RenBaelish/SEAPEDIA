import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from "clsx";

// ─── Text Input ────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, fullWidth, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className={clsx("flex flex-col gap-1", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-tertiary pointer-events-none">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full bg-surface text-on-surface text-xs leading-[18px]",
              "border border-border rounded-md outline-none",
              "h-10 transition-[border-color,box-shadow] duration-150",
              leftIcon ? "pl-9 pr-4" : "px-4",
              rightIcon ? "pr-9" : "",
              error
                ? "border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(229,72,77,0.15)]"
                : "focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,170,91,0.15)]",
              "placeholder:text-tertiary",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-tertiary">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-tertiary">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Textarea ─────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth, className, id, ...props }, ref) => {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2, 7)}`;
    return (
      <div className={clsx("flex flex-col gap-1", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full bg-surface text-on-surface text-xs leading-[18px]",
            "border border-border rounded-md outline-none resize-y p-3",
            "transition-[border-color,box-shadow] duration-150",
            error
              ? "border-error focus:border-error"
              : "focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,170,91,0.15)]",
            "placeholder:text-tertiary",
            className
          )}
          rows={4}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
