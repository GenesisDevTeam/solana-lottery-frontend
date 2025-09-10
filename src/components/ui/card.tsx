import * as React from "react";
import { Box, Flex, Heading, type BoxProps, type FlexProps, type HeadingProps } from "@chakra-ui/react";

export function Card(props: BoxProps) {
  return (
    <Box borderRadius="lg" borderWidth="1px" p={4} bg="blackAlpha.400" borderColor="whiteAlpha.200" {...props} />
  );
}

export function CardHeader(props: FlexProps) {
  return <Flex mb={2} align="center" justify="space-between" {...props} />;
}

export function CardTitle(props: HeadingProps) {
  return <Heading size="sm" color="whiteAlpha.900" {...props} />;
}


