import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
        "bg-black text-white hover:opacity-90 px-3 py-1.5",
        className,
      )}
      {...props}
    />
  );
}


