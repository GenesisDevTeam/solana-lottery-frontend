import * as React from "react";
import { Divider, type DividerProps } from "@chakra-ui/react";

export function Separator(props: DividerProps) {
  return <Divider opacity={0.2} borderColor="whiteAlpha.300" {...props} />;
}
