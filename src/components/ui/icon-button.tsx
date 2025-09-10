import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md border border-black/10 bg-white text-black",
        "hover:bg-black/5 active:bg-black/10 transition-colors",
        "disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}


