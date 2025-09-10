"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useAnchor, ids } from "@/lib/anchor";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletGate } from "@/components/WalletGate";
import { explorerAddressUrl } from "../lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useConnection } from "@solana/wallet-adapter-react";

export default function Home() {
  const { connection } = useConnection();
  const { lottery, watcher } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [roundPot, setRoundPot] = useState<string>("-");
  const [ticketPrice, setTicketPrice] = useState<string>("-");
  const [ticketCount, setTicketCount] = useState(1);
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [referrer, setReferrer] = useState<string | null>(null);
  const [refCodeHex, setRefCodeHex] = useState<string | null>(null);
  const [watcherDefaults, setWatcherDefaults] = useState<{ bps: number; limit: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("-");

  useEffect(() => {
    const run = async () => {
      if (!lottery) return;
      try {
        setLoading(true);
        const [lotteryStatePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
        const state = await lottery.account.lotteryState.fetch(lotteryStatePda);
        const currentRoundId = state.latestRoundId.toNumber();
        setRoundId(currentRoundId);
        if (currentRoundId > 0) {
          const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(currentRoundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
          const round = await lottery.account.round.fetch(roundPda);
          setRoundPot((round.pot as anchor.BN).toString());
          setTicketPrice((round.ticketPrice as anchor.BN).toString());
        }
        // баланс кошелька
        if (lottery.provider.publicKey) {
          const lamports = await connection.getBalance(lottery.provider.publicKey);
          setWalletBalance((lamports / LAMPORTS_PER_SOL).toFixed(5));
        }
        // реф. состояние
        if (watcher && lottery.provider.publicKey) {
          const [userRefPda] = PublicKey.findProgramAddressSync([Buffer.from("user_ref"), lottery.provider.publicKey.toBuffer()], watcher.programId);
          const userRef = await watcher.account.userReferral.fetchNullable(userRefPda);
          if (userRef) {
            setRegistered(true);
            const data = userRef as unknown as { referrer: PublicKey; referrerCode: number[] };
            setReferrer(data.referrer.toBase58());
            const hex = Buffer.from(data.referrerCode).toString("hex");
            setRefCodeHex(hex);
          } else {
            setRegistered(false);
            setReferrer(null);
            setRefCodeHex(null);
          }
        }
        // дефолты партнёрки
        if (watcher) {
          const [watcherStatePda] = PublicKey.findProgramAddressSync([Buffer.from("watcher_state")], watcher.programId);
          const wState = await watcher.account.watcherState.fetchNullable(watcherStatePda);
          if (wState) {
            const d = wState as unknown as { defaultProfitBps: number; defaultReferralLimit: anchor.BN };
            setWatcherDefaults({ bps: Number(d.defaultProfitBps), limit: (d.defaultReferralLimit as anchor.BN).toString() });
          }
        }
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [lottery, watcher, connection]);

  const buyDisabled = useMemo(() => !lottery || roundId === null || loading, [lottery, roundId, loading]);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const totalToPay = useMemo(() => {
    if (!ticketPrice) return "-";
    const tp = Number(ticketPrice);
    if (!tp || !Number.isFinite(tp)) return "-";
    const lamports = tp * ticketCount;
    return `${(lamports / LAMPORTS_PER_SOL).toFixed(6)} SOL`;
  }, [ticketPrice, ticketCount]);

  const onBuy = async () => {
    if (!lottery || !watcher || roundId === null) return;
    try {
      setLoading(true);
      const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      const round = await lottery.account.round.fetch(roundPda);
      const purchaseIndex = new anchor.BN((round.purchaseCount as unknown as anchor.BN).toString());
      const [purchasePda] = PublicKey.findProgramAddressSync([
        Buffer.from("purchase"),
        new anchor.BN(roundId).toArrayLike(Buffer, "le", 8),
        purchaseIndex.toArrayLike(Buffer, "le", 8),
      ], lottery.programId);

      // опциональная партнёрка
      const userPk = lottery.provider.publicKey!;
      const [watcherStatePda] = PublicKey.findProgramAddressSync([Buffer.from("watcher_state")], watcher.programId);
      const [userRefForPlayerPda] = PublicKey.findProgramAddressSync([Buffer.from("user_ref"), userPk.toBuffer()], watcher.programId);
      const userRef = await watcher.account.userReferral.fetchNullable(userRefForPlayerPda);

      const accountsWhenNoReferral = {
        watcherState: anchor.web3.SystemProgram.programId,
        userRefForPlayer: anchor.web3.SystemProgram.programId,
        referrerSettingsForPlayer: anchor.web3.SystemProgram.programId,
        profitForRound: anchor.web3.SystemProgram.programId,
        roundTotalProfit: anchor.web3.SystemProgram.programId,
        referralEscrow: anchor.web3.SystemProgram.programId,
      } as const;

      let accountsReferralPart:
        | {
            watcherState: PublicKey;
            userRefForPlayer: PublicKey;
            referrerSettingsForPlayer: PublicKey;
            profitForRound: PublicKey;
            roundTotalProfit: PublicKey;
            referralEscrow: PublicKey;
          }
        | typeof accountsWhenNoReferral;

      if (!userRef) {
        accountsReferralPart = accountsWhenNoReferral;
      } else {
        const referrer: PublicKey = (userRef as unknown as { referrer: PublicKey }).referrer;
        const [referrerSettingsForPlayer] = PublicKey.findProgramAddressSync([Buffer.from("referrer"), referrer.toBuffer()], watcher.programId);
        const [profitForRound] = PublicKey.findProgramAddressSync([Buffer.from("profit"), referrer.toBuffer(), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], watcher.programId);
        const [roundTotalProfit] = PublicKey.findProgramAddressSync([Buffer.from("round_profit"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], watcher.programId);
        const [referralEscrow] = PublicKey.findProgramAddressSync([Buffer.from("referral_escrow")], watcher.programId);
        accountsReferralPart = {
          watcherState: watcherStatePda,
          userRefForPlayer: userRefForPlayerPda,
          referrerSettingsForPlayer,
          profitForRound,
          roundTotalProfit,
          referralEscrow,
        };
      }

      await lottery.methods
        .play(new anchor.BN(roundId), new anchor.BN(ticketCount))
        .accounts({
          round: roundPda,
          purchase: purchasePda,
          user: userPk,
          watcherState: accountsReferralPart.watcherState,
          userRefForPlayer: accountsReferralPart.userRefForPlayer,
          referrerSettingsForPlayer: accountsReferralPart.referrerSettingsForPlayer,
          lotteryProgram: lottery.programId,
          watcherProgram: watcher.programId,
          profitForRound: accountsReferralPart.profitForRound,
          roundTotalProfit: accountsReferralPart.roundTotalProfit,
          referralEscrow: accountsReferralPart.referralEscrow,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as {
          round: PublicKey;
          purchase: PublicKey;
          user: PublicKey;
          watcherState: PublicKey;
          userRefForPlayer: PublicKey;
          referrerSettingsForPlayer: PublicKey;
          lotteryProgram: PublicKey;
          watcherProgram: PublicKey;
          profitForRound: PublicKey;
          roundTotalProfit: PublicKey;
          referralEscrow: PublicKey;
          systemProgram: PublicKey;
        })
        .rpc();
      alert("Билеты куплены");
    } catch (e) {
      const err = e as Error & { message?: string };
      alert(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Solana Lottery</h1>
        <WalletMultiButton />
      </div>
      <WalletGate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Состояние контракта */}
          <Card>
            <CardHeader>
              <CardTitle>Состояние контракта</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">ID:</span>
                <a className="underline" href={explorerAddressUrl(ids.lottery)} target="_blank" rel="noreferrer">Explorer</a>
                <Button className="px-2 py-1" onClick={() => copy(ids.lottery)}>копировать</Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Owner:</span>
                <span>FV1AtdSnciCMnXeYsD77Hg1PMYXgGVpiYqhDhGxB1Xgb</span>
                <a className="underline" href={explorerAddressUrl("FV1AtdSnciCMnXeYsD77Hg1PMYXgGVpiYqhDhGxB1Xgb")} target="_blank" rel="noreferrer">Explorer</a>
                <Button className="px-2 py-1" onClick={() => copy("FV1AtdSnciCMnXeYsD77Hg1PMYXgGVpiYqhDhGxB1Xgb")}>копировать</Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Admin:</span>
                <span>FV1AtdSnciCMnXeYsD77Hg1PMYXgGVpiYqhDhGxB1Xgb</span>
                <a className="underline" href={explorerAddressUrl("FV1AtdSnciCMnXeYsD77Hg1PMYXgGVpiYqhDhGxB1Xgb")} target="_blank" rel="noreferrer">Explorer</a>
                <Button className="px-2 py-1" onClick={() => copy("FV1AtdSnciCMnXeYsD77Hg1PMYXgGVpiYqhDhGxB1Xgb")}>копировать</Button>
              </div>
              <div className="opacity-70">Fee balance (lamports): 0</div>
              <Separator className="my-2" />
              <div className="flex gap-4"><span className="opacity-70">Текущий раунд:</span><span>{roundId ?? "-"}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Пот (lamports):</span><span>{roundPot}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Цена билета (lamports):</span><span>{ticketPrice}</span></div>
            </div>
          </Card>

          {/* Покупка билетов */}
          <Card>
            <CardHeader>
              <CardTitle>Покупка билетов</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-sm">
              <div>
                <Label className="mb-1 block">Количество</Label>
                <div className="max-w-[160px]">
                  <Input type="number" min={1} value={ticketCount} onChange={(e) => setTicketCount(Number(e.target.value))} />
                </div>
              </div>
              <div className="opacity-70 text-xs">Баланс кошелька: {walletBalance} SOL</div>
              <div className="opacity-70 text-xs">Итого к оплате: {totalToPay}</div>
              <div>
                <Button onClick={onBuy} disabled={buyDisabled}>Купить билеты</Button>
              </div>
            </div>
          </Card>

          {/* Watcher (Referral) */}
          <Card>
            <CardHeader>
              <CardTitle>Watcher (Referral)</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">ID:</span>
                <a className="underline" href={explorerAddressUrl(ids.watcher)} target="_blank" rel="noreferrer">Explorer</a>
                <Button className="px-2 py-1" onClick={() => copy(ids.watcher)}>копировать</Button>
              </div>
              <div className="flex gap-4"><span className="opacity-70">Default profit bps:</span><span>{watcherDefaults ? watcherDefaults.bps : "-"}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Default daily reg. limit:</span><span>{watcherDefaults ? watcherDefaults.limit : "-"}</span></div>
            </div>
          </Card>

          {/* Моя реф. информация */}
          <Card>
            <CardHeader>
              <CardTitle>Моя реф. информация</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div className="flex gap-4"><span className="opacity-70">Статус:</span><span>{registered === null ? "-" : registered ? "Зарегистрирован" : "Не зарегистрирован"}</span></div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Referrer:</span>
                <span>{referrer ? <a className="underline" href={explorerAddressUrl(referrer)} target="_blank" rel="noreferrer">{referrer}</a> : "-"}</span>
                {referrer && <Button className="px-2 py-1" onClick={() => copy(referrer!)}>копировать</Button>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Code hash (hex):</span>
                <span className="break-all">{refCodeHex ?? "-"}</span>
                {refCodeHex && <Button className="px-2 py-1" onClick={() => copy(refCodeHex!)}>копировать</Button>}
              </div>
              {registered === false && (
                <p className="text-xs text-amber-600">Вы не зарегистрированы по реф.коду. Покупка возможна без реферала.</p>
              )}
            </div>
          </Card>
        </div>
      </WalletGate>
    </div>
  );
}
