import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={"flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm focus:outline-none " + (className || "")}
    {...props}
  />
));
Input.displayName = "Input";


