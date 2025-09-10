"use client";

import { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type Props = { children: ReactNode };

export function WalletGate({ children }: Props) {
  const { connected } = useWallet();
  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <WalletMultiButton />
        <p className="text-sm opacity-80">Подключите кошелёк для продолжения</p>
      </div>
    );
  }
  return <>{children}</>;
}


