"use client";

import { AnchorProvider, BN, Program, setProvider, type Wallet } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { SolanaLottery } from "@/idl/solana_lottery";
import type { WatcherReferral } from "@/idl/watcher_referral";
import lotteryIdl from "@/idl/solana_lottery.json";
import watcherIdl from "@/idl/watcher_referral.json";
import { useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

export type { BN };

const LOTTERY_PROGRAM_ID = (lotteryIdl as SolanaLottery).address as string;
const WATCHER_PROGRAM_ID = (watcherIdl as WatcherReferral).address as string;

export function useAnchor() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return { provider: null as AnchorProvider | null, lottery: null as Program<SolanaLottery> | null, watcher: null as Program<WatcherReferral> | null };
    const provider = new AnchorProvider(connection, wallet as Wallet, { preflightCommitment: "confirmed" });
    setProvider(provider);
    // В этой версии Anchor адрес программы читается из IDL (`address`), поэтому передаём только idl и provider
    const lottery = new Program(lotteryIdl as unknown as Idl, provider) as unknown as Program<SolanaLottery>;
    const watcher = new Program(watcherIdl as unknown as Idl, provider) as unknown as Program<WatcherReferral>;
    return { provider, lottery, watcher };
  }, [connection, wallet]);
}

export const ids = {
  lottery: LOTTERY_PROGRAM_ID,
  watcher: WATCHER_PROGRAM_ID,
};


