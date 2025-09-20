import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={"flex h-10 w-full rounded-md border border-[#9945FF] bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#14F195]/60 focus:border-[#14F195] hover:border-[#7C3AED] transition-colors " + (className || "")}
    {...props}
  />
));
Input.displayName = "Input";


