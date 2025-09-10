import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getExplorerBaseUrl() {
  return "https://explorer.solana.com";
}

function getClusterQuery(network?: string) {
  const net = (network || process.env.NEXT_PUBLIC_CLUSTER || "devnet").toString().toLowerCase();
  if (net === "mainnet" || net === "mainnet-beta" || net === "mainnetbeta") return "";
  if (net === "testnet") return "?cluster=testnet";
  return "?cluster=devnet";
}

export function explorerAddressUrl(address: string, network?: string) {
  const base = getExplorerBaseUrl();
  return `${base}/address/${address}${getClusterQuery(network)}`;
}

export function explorerTxUrl(signature: string, network?: string) {
  const base = getExplorerBaseUrl();
  return `${base}/tx/${signature}${getClusterQuery(network)}`;
}


