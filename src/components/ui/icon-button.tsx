import * as React from "react";
import { IconButton as CIconButton, type IconButtonProps as CIconButtonProps } from "@chakra-ui/react";

export type IconButtonProps = CIconButtonProps;

export function IconButton({ "aria-label": ariaLabel, ...props }: IconButtonProps) {
  return (
    <CIconButton size="sm" aria-label={ariaLabel || "icon"} variant="ghost" colorScheme="purple" {...props} />
  );
}


