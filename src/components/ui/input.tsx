import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={"flex h-9 w-full rounded-md border-2 border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors " + (className || "")}
    {...props}
  />
));
Input.displayName = "Input";


