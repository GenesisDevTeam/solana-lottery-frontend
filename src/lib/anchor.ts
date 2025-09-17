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

export interface WinnerInfo {
  winningTicket: number;
  user: string;
  reward: number;
  ticketRange: { start: number; end: number };
}

export interface RoundWinners {
  roundId: number;
  isFinished: boolean;
  pot: number;
  winners: WinnerInfo[];
  totalTickets: number;
  finishTimestamp: number;
}

export async function getRoundWinners(
  lottery: Program<SolanaLottery>, 
  roundId: number
): Promise<RoundWinners | null> {
  try {
    const [roundPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("round"), new BN(roundId).toArrayLike(Buffer, "le", 8)], 
      lottery.programId
    );
    
    const round = await lottery.account.round.fetch(roundPda);
    
    if (!round.isFinished) {
      return {
        roundId,
        isFinished: false,
        pot: (round.pot as BN).toNumber(),
        winners: [],
        totalTickets: (round.totalTickets as BN).toNumber(),
        finishTimestamp: Number(round.finishTimestamp),
      };
    }

    const winningTickets = (round.winningTickets as BN[]).map(bn => bn.toNumber());
    const purchaseCount = (round.purchaseCount as BN).toNumber();
    const rewardSharingBps = round.rewardSharingBps as number[];
    const pot = (round.pot as BN).toNumber();
    
    const winners: WinnerInfo[] = [];
    
    for (let i = 0; i < winningTickets.length; i++) {
      const ticket = winningTickets[i];
      
      // Находим покупку, которая содержит этот билет
      for (let idx = 0; idx < purchaseCount; idx++) {
        const purchasePda = PublicKey.findProgramAddressSync([
          Buffer.from("purchase"),
          new BN(roundId).toArrayLike(Buffer, "le", 8),
          new BN(idx).toArrayLike(Buffer, "le", 8),
        ], lottery.programId)[0];
        
        try {
          const purchase = await lottery.account.purchase.fetch(purchasePda);
          const end = (purchase.cumulativeTickets as BN).toNumber();
          const start = end - (purchase.ticketCount as BN).toNumber() + 1;
          
          if (ticket >= start && ticket <= end) {
            // Рассчитываем награду
            const rewardBps = rewardSharingBps[i] || 0;
            const reward = Math.floor((pot * rewardBps) / 10000);
            
            winners.push({
              winningTicket: ticket,
              user: (purchase.user as PublicKey).toBase58(),
              reward,
              ticketRange: { start, end },
            });
            break;
          }
        } catch (e) {
          console.error(`Ошибка получения покупки ${idx}:`, e);
        }
      }
    }
    
    return {
      roundId,
      isFinished: true,
      pot,
      winners,
      totalTickets: (round.totalTickets as BN).toNumber(),
      finishTimestamp: Number(round.finishTimestamp),
    };
    
  } catch (e) {
    console.error("Ошибка получения победителей раунда:", e);
    return null;
  }
}


