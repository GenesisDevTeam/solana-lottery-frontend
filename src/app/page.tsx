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
import { IconButton } from "@/components/ui/icon-button";
import { Copy, ExternalLink } from "lucide-react";

export default function Home() {
  const { connection } = useConnection();
  const { lottery, watcher } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [roundPot, setRoundPot] = useState<string>("-");
  const [ticketPrice, setTicketPrice] = useState<string>("-");
  const [totalTickets, setTotalTickets] = useState<string>("-");
  const [winnersCount, setWinnersCount] = useState<string>("-");
  const [finishTs, setFinishTs] = useState<string>("-");
  const [roundReferralTotal, setRoundReferralTotal] = useState<string>("-");
  const [ticketCount, setTicketCount] = useState(1);
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [referrer, setReferrer] = useState<string | null>(null);
  const [refCodeHex, setRefCodeHex] = useState<string | null>(null);
  const [watcherDefaults, setWatcherDefaults] = useState<{ bps: number; limit: string } | null>(null);
  const [watcherOwner, setWatcherOwner] = useState<string | null>(null);
  const [watcherAdmin, setWatcherAdmin] = useState<string | null>(null);
  const [watcherSigner, setWatcherSigner] = useState<string | null>(null);
  const [watcherLottery, setWatcherLottery] = useState<string | null>(null);
  const [lotteryOwner, setLotteryOwner] = useState<string | null>(null);
  const [lotteryAdmin, setLotteryAdmin] = useState<string | null>(null);
  const [feeBalance, setFeeBalance] = useState<string>("-");
  const [walletBalance, setWalletBalance] = useState<string>("-");
  const [registerHex, setRegisterHex] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!lottery) return;
      try {
        setLoading(true);
        const [lotteryStatePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
        const state = await lottery.account.lotteryState.fetch(lotteryStatePda);
        setLotteryOwner(state.owner.toBase58());
        setLotteryAdmin(state.admin.toBase58());
        setFeeBalance((state.feeBalance as anchor.BN).toString());
        const currentRoundId = state.latestRoundId.toNumber();
        setRoundId(currentRoundId);
        if (currentRoundId > 0) {
          const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(currentRoundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
          const round = await lottery.account.round.fetch(roundPda);
          setRoundPot((round.pot as anchor.BN).toString());
          setTicketPrice((round.ticketPrice as anchor.BN).toString());
          setTotalTickets((round.totalTickets as anchor.BN).toString());
          setWinnersCount(String(round.winnersCount));
          setFinishTs(String(round.finishTimestamp));
          // суммарная партнёрка за раунд
          if (watcher) {
            const [roundTotalProfit] = PublicKey.findProgramAddressSync([Buffer.from("round_profit"), new anchor.BN(currentRoundId).toArrayLike(Buffer, "le", 8)], watcher.programId);
            const acc = await watcher.account.roundTotalProfit.fetchNullable(roundTotalProfit);
            if (acc) {
              const a = (acc as unknown as { totalAmount: anchor.BN }).totalAmount as anchor.BN;
              setRoundReferralTotal(a.toString());
            } else {
              setRoundReferralTotal("0");
            }
          }
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
            const d = wState as unknown as { owner: PublicKey; admin: PublicKey; signer: PublicKey; lottery: PublicKey; defaultProfitBps: number; defaultReferralLimit: anchor.BN };
            setWatcherDefaults({ bps: Number(d.defaultProfitBps), limit: (d.defaultReferralLimit as anchor.BN).toString() });
            setWatcherOwner(d.owner.toBase58());
            setWatcherAdmin(d.admin.toBase58());
            setWatcherSigner(d.signer.toBase58());
            setWatcherLottery(d.lottery.toBase58());
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

  const onGenerateCode = async () => {
    if (!watcher || !watcher.provider.publicKey) return;
    try {
      setLoading(true);
      const bytes = anchor.web3.Keypair.generate().publicKey.toBytes();
      const codeHash = Buffer.from(bytes);
      const [statePda] = PublicKey.findProgramAddressSync([Buffer.from("watcher_state")], watcher.programId);
      const [codeRefPda] = PublicKey.findProgramAddressSync([Buffer.from("code"), watcher.provider.publicKey.toBuffer()], watcher.programId);
      const [codeIndexPda] = PublicKey.findProgramAddressSync([Buffer.from("code_hash"), codeHash], watcher.programId);
      await watcher.methods
        .generateReferralCode(Array.from(codeHash))
        .accounts({
          state: statePda,
          codeRef: codeRefPda,
          codeIndex: codeIndexPda,
          user: watcher.provider.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as {
          state: PublicKey;
          codeRef: PublicKey;
          codeIndex: PublicKey;
          user: PublicKey;
          systemProgram: PublicKey;
        })
        .rpc();
      const hex = codeHash.toString("hex");
      setRefCodeHex(hex);
      alert("Код сгенерирован");
    } catch (e) {
      const err = e as Error & { message?: string };
      alert(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const onRegisterByCode = async () => {
    if (!watcher || !watcher.provider.publicKey) return;
    try {
      const hex = registerHex.trim();
      if (!/^([0-9a-f]{64})$/i.test(hex)) {
        alert("Введите 64-символьный hex");
        return;
      }
      setLoading(true);
      const codeHash = Buffer.from(hex, "hex");
      const userPk = watcher.provider.publicKey;
      const [statePda] = PublicKey.findProgramAddressSync([Buffer.from("watcher_state")], watcher.programId);
      const [userRefPda] = PublicKey.findProgramAddressSync([Buffer.from("user_ref"), userPk.toBuffer()], watcher.programId);
      const [codeIndexPda] = PublicKey.findProgramAddressSync([Buffer.from("code_hash"), codeHash], watcher.programId);
      const [registrationStatsPda] = PublicKey.findProgramAddressSync([Buffer.from("reg"), codeHash], watcher.programId);
      const codeIndex = await watcher.account.codeIndex.fetch(codeIndexPda);
      const referrer = (codeIndex as unknown as { owner: PublicKey }).owner as PublicKey;
      const [referrerSettingsPda] = PublicKey.findProgramAddressSync([Buffer.from("referrer"), referrer.toBuffer()], watcher.programId);
      await watcher.methods
        .registerWithReferral(Array.from(codeHash))
        .accounts({
          state: statePda,
          userRef: userRefPda,
          codeIndex: codeIndexPda,
          registrationStats: registrationStatsPda,
          referrerSettings: referrerSettingsPda,
          user: userPk,
          backendSigner: userPk,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as {
          state: PublicKey;
          userRef: PublicKey;
          codeIndex: PublicKey;
          registrationStats: PublicKey;
          referrerSettings: PublicKey;
          user: PublicKey;
          backendSigner: PublicKey;
          systemProgram: PublicKey;
        })
        .rpc();
      alert("Регистрация выполнена");
      // перезагрузим реф. состояние
      const [userRefForPlayerPda] = PublicKey.findProgramAddressSync([Buffer.from("user_ref"), userPk.toBuffer()], watcher.programId);
      const userRef = await watcher.account.userReferral.fetchNullable(userRefForPlayerPda);
      if (userRef) {
        setRegistered(true);
        const data = userRef as unknown as { referrer: PublicKey; referrerCode: number[] };
        setReferrer(data.referrer.toBase58());
        setRefCodeHex(Buffer.from(data.referrerCode).toString("hex"));
      }
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
                <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(ids.lottery)} target="_blank" rel="noreferrer">Explorer<ExternalLink size={14} /></a>
                <IconButton onClick={() => copy(ids.lottery)} aria-label="copy"><Copy size={14} /></IconButton>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Owner:</span>
                <span className="break-all">{lotteryOwner ?? "-"}</span>
                {lotteryOwner && <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(lotteryOwner)} target="_blank" rel="noreferrer">Explorer<ExternalLink size={14} /></a>}
                {lotteryOwner && <IconButton onClick={() => copy(lotteryOwner!)} aria-label="copy-owner"><Copy size={14} /></IconButton>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Admin:</span>
                <span className="break-all">{lotteryAdmin ?? "-"}</span>
                {lotteryAdmin && <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(lotteryAdmin)} target="_blank" rel="noreferrer">Explorer<ExternalLink size={14} /></a>}
                {lotteryAdmin && <IconButton onClick={() => copy(lotteryAdmin!)} aria-label="copy-admin"><Copy size={14} /></IconButton>}
              </div>
              <div className="opacity-70">Fee balance (lamports): {feeBalance}</div>
              <Separator className="my-2" />
              <div className="flex gap-4"><span className="opacity-70">Текущий раунд:</span><span>{roundId ?? "-"}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Пот:</span><span>{roundPot !== "-" ? `${(Number(roundPot) / LAMPORTS_PER_SOL).toFixed(4)} SOL (${roundPot} lamports)` : '-'}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Цена билета:</span><span>{ticketPrice !== "-" ? `${(Number(ticketPrice) / LAMPORTS_PER_SOL).toFixed(6)} SOL (${ticketPrice} lamports)` : '-'}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Куплено билетов:</span><span>{totalTickets}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Победителей:</span><span>{winnersCount}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Финиш:</span><span>{finishTs !== "-" ? new Date(Number(finishTs) * 1000).toLocaleString() : '-'}</span></div>
              <div className="flex gap-4"><span className="opacity-70">Referral total (round):</span><span>{roundReferralTotal}</span></div>
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
                <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(ids.watcher)} target="_blank" rel="noreferrer">Explorer<ExternalLink size={14} /></a>
                <IconButton onClick={() => copy(ids.watcher)} aria-label="copy"><Copy size={14} /></IconButton>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Owner:</span>
                <span className="break-all">{watcherOwner ?? '-'}</span>
                {watcherOwner && <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(watcherOwner)} target="_blank" rel="noreferrer">Explorer<ExternalLink size={14} /></a>}
                {watcherOwner && <IconButton onClick={() => copy(watcherOwner!)} aria-label="copy-w-owner"><Copy size={14} /></IconButton>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Admin:</span>
                <span className="break-all">{watcherAdmin ?? '-'}</span>
                {watcherAdmin && <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(watcherAdmin)} target="_blank" rel="noreferrer">Explorer<ExternalLink size={14} /></a>}
                {watcherAdmin && <IconButton onClick={() => copy(watcherAdmin!)} aria-label="copy-w-admin"><Copy size={14} /></IconButton>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Signer:</span>
                <span className="break-all">{watcherSigner ?? '-'}</span>
                {watcherSigner && <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(watcherSigner)} target="_blank" rel="noreferrer">Explorer<ExternalLink size={14} /></a>}
                {watcherSigner && <IconButton onClick={() => copy(watcherSigner!)} aria-label="copy-w-signer"><Copy size={14} /></IconButton>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Lottery linked:</span>
                <span className="break-all">{watcherLottery ?? '-'}</span>
                {watcherLottery && <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(watcherLottery)} target="_blank" rel="noreferrer">Explorer<ExternalLink size={14} /></a>}
                {watcherLottery && <IconButton onClick={() => copy(watcherLottery!)} aria-label="copy-w-lottery"><Copy size={14} /></IconButton>}
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
                <span>{referrer ? <a className="inline-flex items-center gap-1 underline" href={explorerAddressUrl(referrer)} target="_blank" rel="noreferrer">{referrer}<ExternalLink size={14} /></a> : "-"}</span>
                {referrer && <IconButton onClick={() => copy(referrer!)} aria-label="copy-ref"><Copy size={14} /></IconButton>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="opacity-70">Code hash (hex):</span>
                <span className="break-all">{refCodeHex ?? "-"}</span>
                {refCodeHex && <IconButton onClick={() => copy(refCodeHex!)} aria-label="copy-code"><Copy size={14} /></IconButton>}
              </div>
              {registered === false && (
                <p className="text-xs text-amber-600">Вы не зарегистрированы по реф.коду. Покупка возможна без реферала.</p>
              )}
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <Button onClick={onGenerateCode} disabled={!watcher || loading}>Сгенерировать реф-код</Button>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Label>Код рефовода (hex)</Label>
                <Input placeholder="64-симв. hex" value={registerHex} onChange={(e) => setRegisterHex(e.target.value)} />
                <div>
                  <Button onClick={onRegisterByCode} disabled={!watcher || loading}>Зарегистрироваться по коду</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </WalletGate>
    </div>
  );
}
