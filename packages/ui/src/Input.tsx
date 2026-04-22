import * as React from "react";
import { cn } from "./cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-8 w-full rounded-md bg-bg-input border border-border-primary/50 px-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-micro focus:border-border-focus focus:bg-bg-input",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md bg-bg-input border border-border-primary/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-micro focus:border-border-focus resize-none",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
