import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none whitespace-nowrap transition-colors duration-micro ease-out-smooth disabled:opacity-40 disabled:cursor-not-allowed focus-ring",
  {
    variants: {
      variant: {
        primary:
          "bg-text-primary text-bg-primary hover:bg-text-primary/90 active:bg-text-primary/80",
        secondary:
          "bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 border border-border-primary/50",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-accent-subtle",
        outline:
          "border border-border-secondary text-text-primary hover:bg-accent-subtle",
        danger:
          "bg-semantic-danger/90 text-white hover:bg-semantic-danger",
      },
      size: {
        sm: "h-7 px-2.5 text-sm rounded-md",
        md: "h-8 px-3 text-sm rounded-md",
        lg: "h-10 px-4 text-base rounded-md",
        icon: "h-8 w-8 rounded-md",
        iconSm: "h-7 w-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
