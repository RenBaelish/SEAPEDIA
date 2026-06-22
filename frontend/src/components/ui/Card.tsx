import React from 'react';
import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: keyof React.JSX.IntrinsicElements;
  soft?: boolean;
}

const paddingClasses = {
  none: "p-0",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = "md", soft = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          soft ? "nb-card-soft" : "nb-card",
          hover && "cursor-pointer",
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
