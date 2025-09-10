import * as React from "react";
import { Text, type TextProps } from "@chakra-ui/react";

export function Label(props: TextProps) {
  return <Text as="label" fontSize="sm" opacity={0.7} {...props} />;
}


