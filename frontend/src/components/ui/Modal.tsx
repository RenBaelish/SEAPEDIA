import { ReactNode, useEffect } from 'react';
import { clsx } from "clsx";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  footer?: ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          "relative bg-white w-full border-4 border-nb-black",
          "shadow-[8px_8px_0px_#0A0A0A]",
          "animate-[fadeInScale_150ms_ease]",
          sizeClasses[size]
        )}
      >
        {/* Yellow accent top bar */}
        <div className="h-2 bg-nb-yellow w-full" />

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b-3 border-nb-black">
            {title && (
              <h3 className="text-lg font-extrabold text-nb-black tracking-tight">
                {title}
              </h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center border-2 border-nb-black bg-white hover:bg-nb-yellow transition-colors"
                aria-label="Tutup modal"
              >
                <X size={16} strokeWidth={3} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[80vh]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 pb-5 pt-0 border-t-2 border-gray-200 pt-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
