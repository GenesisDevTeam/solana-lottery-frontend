"use client";

import * as React from "react";
import { ChakraProvider, extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: "#ffffff",
        color: "gray.800",
      },
    },
  },
  colors: {
    brand: {
      50: "#e5fff7",
      100: "#b8ffe9",
      200: "#7affd8",
      300: "#39f5c3",
      400: "#15d7ad",
      500: "#00b894",
      600: "#00a07f",
      700: "#00866a",
      800: "#006a54",
      900: "#004f3f",
    },
    solana: {
      500: "#9945FF",
      600: "#7C3AED",
      700: "#5B21B6",
      800: "#3B0764",
    },
  },
});

export function ChakraProviders({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}


