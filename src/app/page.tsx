"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useAnchor, ids } from "@/lib/anchor";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletGate } from "@/components/WalletGate";
import { explorerAddressUrl } from "../lib/utils";

export default function Home() {
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
        // проверяем регистрацию пользователя в реф. системе и читаем детали
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
        // дефолтные параметры партнёрки
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
  }, [lottery, watcher]);

  const buyDisabled = useMemo(() => !lottery || roundId === null || loading, [lottery, roundId, loading]);

  const onBuy = async () => {
    if (!lottery || !watcher || roundId === null) return;
    try {
      setLoading(true);
      const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      // узнаем текущий purchase_index
      const round = await lottery.account.round.fetch(roundPda);
      const purchaseIndex = new anchor.BN((round.purchaseCount as unknown as anchor.BN).toString());
      const [purchasePda] = PublicKey.findProgramAddressSync([
        Buffer.from("purchase"),
        new anchor.BN(roundId).toArrayLike(Buffer, "le", 8),
        purchaseIndex.toArrayLike(Buffer, "le", 8),
      ], lottery.programId);

      // PDA партнёрки (опционально)
      const userPk = lottery.provider.publicKey!;
      const [watcherStatePda] = PublicKey.findProgramAddressSync([Buffer.from("watcher_state")], watcher.programId);
      const [userRefForPlayerPda] = PublicKey.findProgramAddressSync([Buffer.from("user_ref"), userPk.toBuffer()], watcher.programId);
      const userRef = await watcher.account.userReferral.fetchNullable(userRefForPlayerPda);

      // Если нет регистрации, подставляем SystemProgram в реферальные аккаунты, чтобы CPI была пропущена в программе лотереи
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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Solana Lottery</h1>
        <WalletMultiButton />
      </div>
      <WalletGate>
        {/* Блок 1: Моя реф. информация */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="font-medium">Моя реф. информация</div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Статус:</span><span>{registered === null ? "-" : registered ? "Зарегистрирован" : "Не зарегистрирован"}</span></div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Реферер:</span><span>{referrer ? <a className="underline" href={explorerAddressUrl(referrer)} target="_blank" rel="noreferrer">{referrer}</a> : "-"}</span></div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Код (hex):</span><span className="break-all">{refCodeHex ?? "-"}</span></div>
          {registered === false && (
            <p className="text-xs text-amber-600">Вы не зарегистрированы по реф.коду. Покупка возможна без реферала.</p>
          )}
        </div>

        {/* Блок 2: Покупка билета */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="font-medium">Покупка билета</div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={ticketCount}
              onChange={(e) => setTicketCount(Number(e.target.value))}
              className="border rounded px-2 py-1 w-28 bg-transparent"
            />
            <button
              onClick={onBuy}
              disabled={buyDisabled}
              className="px-3 py-1.5 rounded bg-black text-white disabled:opacity-50"
            >
              {loading ? "Обработка..." : "Купить билеты"}
            </button>
          </div>
        </div>

        {/* Блок 3: Информация о лотерее */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="font-medium">Информация о лотерее</div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Program ID:</span><a className="underline" href={explorerAddressUrl(ids.lottery)} target="_blank" rel="noreferrer">{ids.lottery}</a></div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Текущий раунд:</span><span>{roundId ?? "-"}</span></div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Пот (lamports):</span><span>{roundPot}</span></div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Цена билета (lamports):</span><span>{ticketPrice}</span></div>
        </div>

        {/* Блок 4: Информация о партнёрке */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="font-medium">Информация о партнёрке</div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Program ID:</span><a className="underline" href={explorerAddressUrl(ids.watcher)} target="_blank" rel="noreferrer">{ids.watcher}</a></div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Default profit (bps):</span><span>{watcherDefaults ? watcherDefaults.bps : "-"}</span></div>
          <div className="text-sm flex gap-4"><span className="opacity-70">Default referral limit:</span><span>{watcherDefaults ? watcherDefaults.limit : "-"}</span></div>
        </div>
      </WalletGate>
    </div>
  );
}
