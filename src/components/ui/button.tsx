import * as React from "react";
import { Button as CButton, type ButtonProps as CButtonProps } from "@chakra-ui/react";

export type ButtonProps = CButtonProps;

export function Button({ ...props }: ButtonProps) {
  return (
    <CButton colorScheme="purple" variant="solid" {...props} />
  );
}


