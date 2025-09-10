"use client";

import { useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useAnchor } from "@/lib/anchor";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletGate } from "@/components/WalletGate";

export default function AdminPage() {
  const { lottery } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [ticketPrice, setTicketPrice] = useState("10000000");
  const [duration, setDuration] = useState("3600");
  const [feeBps, setFeeBps] = useState("500");

  const createRound = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      const [lotteryState] = PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
      const state = await lottery.account.lotteryState.fetch(lotteryState);
      const newRoundId = state.latestRoundId.toNumber() + 1;
      const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(newRoundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      const now = Math.floor(Date.now() / 1000);
      const startTs = now + 30;
      const finishTs = now + parseInt(duration, 10);
      await lottery.methods
        .initializeRound(new anchor.BN(startTs), new anchor.BN(finishTs), parseInt(feeBps, 10), 1, [10000], new anchor.BN(ticketPrice))
        .accounts({ lotteryState, round: roundPda })
        .rpc();
      alert("Раунд создан");
    } catch (e) {
      const err = e as Error & { message?: string };
      alert(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const finishRound = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      const [lotteryState] = PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
      const state = await lottery.account.lotteryState.fetch(lotteryState);
      const roundId = state.latestRoundId.toNumber();
      const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      await lottery.methods
        .finishRound(new anchor.BN(roundId))
        .accounts({ lotteryState, round: roundPda })
        .rpc();
      alert("Раунд завершен");
    } catch (e) {
      const err = e as Error & { message?: string };
      alert(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const claimFees = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      const [lotteryState] = PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
      await lottery.methods
        .claimAdminFees()
        .accounts({ lotteryState })
        .rpc();
      alert("Комиссии выведены");
    } catch (e) {
      const err = e as Error & { message?: string };
      alert(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Админ</h1>
        <WalletMultiButton />
      </div>
      <WalletGate>
        <div className="rounded border p-4 space-y-3">
          <div className="text-sm font-medium">Создать раунд</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm opacity-80">Цена билета (lamports)</label>
            <input className="border rounded px-2 py-1 bg-transparent" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} />
            <label className="text-sm opacity-80">Длительность (сек)</label>
            <input className="border rounded px-2 py-1 bg-transparent" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <label className="text-sm opacity-80">Комиссия bps</label>
            <input className="border rounded px-2 py-1 bg-transparent" value={feeBps} onChange={(e) => setFeeBps(e.target.value)} />
          </div>
          <button onClick={createRound} disabled={loading || !lottery} className="px-3 py-1.5 rounded bg-black text-white disabled:opacity-50">{loading ? "..." : "Создать"}</button>
        </div>

        <div className="rounded border p-4 space-y-3">
          <div className="text-sm font-medium">Завершить текущий раунд</div>
          <button onClick={finishRound} disabled={loading || !lottery} className="px-3 py-1.5 rounded bg-black text-white disabled:opacity-50">{loading ? "..." : "Завершить"}</button>
        </div>

        <div className="rounded border p-4 space-y-3">
          <div className="text-sm font-medium">Вывод комиссий администратором</div>
          <button onClick={claimFees} disabled={loading || !lottery} className="px-3 py-1.5 rounded bg-black text-white disabled:opacity-50">{loading ? "..." : "Вывести комиссии"}</button>
        </div>
      </WalletGate>
    </div>
  );
}


