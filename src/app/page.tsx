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
import { useConnection } from "@solana/wallet-adapter-react";
import { IconButton } from "@/components/ui/icon-button";
import { Copy, ExternalLink, Ticket, Users, Settings, Gift, UserPlus, Code } from "lucide-react";
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Spinner,
  Badge,
  Divider,
  useToast
} from "@chakra-ui/react";

export default function Home() {
  const { connection } = useConnection();
  const { lottery, watcher } = useAnchor();
  const toast = useToast();
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
        // для mut-аккаунтов передаем кошелек пользователя (writable), чтобы пройти ConstraintMut,
        // при отсутствии user_ref CPI не вызывается и запись не происходит
        referrerSettingsForPlayer: userPk,
        profitForRound: userPk,
        roundTotalProfit: userPk,
        referralEscrow: userPk,
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
      toast({
        title: "Билеты куплены",
        description: `Успешно куплено ${ticketCount} билетов`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      const err = e as Error & { message?: string };
      toast({
        title: "Ошибка покупки",
        description: err.message || "Не удалось купить билеты",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: "Код сгенерирован",
        description: "Реферальный код успешно создан",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      const err = e as Error & { message?: string };
      toast({
        title: "Ошибка генерации",
        description: err.message || "Не удалось сгенерировать код",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRegisterByCode = async () => {
    if (!watcher || !watcher.provider.publicKey) return;
    try {
      const hex = registerHex.trim();
      if (!/^([0-9a-f]{64})$/i.test(hex)) {
        toast({
          title: "Неверный формат",
          description: "Введите 64-символьный hex код",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
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
      toast({
        title: "Регистрация выполнена",
        description: "Вы успешно зарегистрированы по реферальному коду",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: "Ошибка регистрации",
        description: err.message || "Не удалось зарегистрироваться",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="full" mx="auto" p={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Gift size={28} color="#9945FF" />
            <Heading size="xl" color="gray.800">Solana Lottery</Heading>
            <Badge colorScheme="purple" variant="subtle" fontSize="sm">
              Live
            </Badge>
          </HStack>
          <WalletMultiButton />
        </HStack>
        <WalletGate>
          <VStack spacing={8} align="stretch" maxW="4xl" mx="auto">
            <div className="grid grid-cols-1 gap-8">
              {/* Состояние контракта */}
              <Card minH="400px">
                <CardHeader>
                  <HStack spacing={2}>
                    <Settings size={20} color="#9945FF" />
                    <CardTitle>Состояние контракта</CardTitle>
                  </HStack>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Основная информация</h3>
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
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Текущий раунд</h3>
                    <div className="flex gap-4"><span className="opacity-70">Раунд:</span><span className="font-medium">{roundId ?? "-"}</span></div>
                    <div className="flex gap-4"><span className="opacity-70">Пот:</span><span className="font-medium">{roundPot !== "-" ? `${(Number(roundPot) / LAMPORTS_PER_SOL).toFixed(4)} SOL` : '-'}</span></div>
                    <div className="flex gap-4"><span className="opacity-70">Цена билета:</span><span className="font-medium">{ticketPrice !== "-" ? `${(Number(ticketPrice) / LAMPORTS_PER_SOL).toFixed(6)} SOL` : '-'}</span></div>
                    <div className="flex gap-4"><span className="opacity-70">Куплено билетов:</span><span className="font-medium">{totalTickets}</span></div>
                    <div className="flex gap-4"><span className="opacity-70">Победителей:</span><span className="font-medium">{winnersCount}</span></div>
                    <div className="flex gap-4"><span className="opacity-70">Финиш:</span><span className="font-medium">{finishTs !== "-" ? new Date(Number(finishTs) * 1000).toLocaleString() : '-'}</span></div>
                    <div className="flex gap-4"><span className="opacity-70">Referral total:</span><span className="font-medium">{roundReferralTotal}</span></div>
                  </div>
                </div>
          </Card>

              {/* Покупка билетов */}
              <Card minH="400px">
                <CardHeader>
                  <HStack spacing={2}>
                    <Ticket size={20} color="#9945FF" />
                    <CardTitle>Покупка билетов</CardTitle>
                  </HStack>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-0">
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Label className="mb-2 block text-lg">Количество билетов</Label>
                      <HStack spacing={4}>
                        <Input 
                          type="number" 
                          min={1} 
                          value={ticketCount} 
                          onChange={(e) => setTicketCount(Number(e.target.value))}
                          className="max-w-[150px] text-lg"
                        />
                        <Text fontSize="lg" color="gray.500" fontWeight="medium">
                          {ticketCount} шт.
                        </Text>
                      </HStack>
                    </Box>
                    
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                        <Text fontSize="md" color="gray.600">Баланс кошелька:</Text>
                        <Text fontSize="md" fontWeight="bold" color="green.600">
                          {walletBalance} SOL
                        </Text>
                      </HStack>
                      <HStack justify="space-between" p={3} bg="purple.50" borderRadius="md">
                        <Text fontSize="md" color="gray.600">Итого к оплате:</Text>
                        <Text fontSize="md" fontWeight="bold" color="purple.600">
                          {totalToPay}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                  
                  <VStack spacing={6} align="stretch" justify="center">
                    <Box textAlign="center">
                      <Text fontSize="lg" color="gray.600" mb={4}>
                        Готовы участвовать в лотерее?
                      </Text>
                      <Button 
                        onClick={onBuy} 
                        disabled={buyDisabled}
                        colorScheme="purple"
                        size="xl"
                        leftIcon={loading ? <Spinner size="sm" /> : <Ticket size={20} />}
                        width="full"
                        height="60px"
                        fontSize="lg"
                      >
                        {loading ? "Покупка..." : "Купить билеты"}
                      </Button>
                    </Box>
                  </VStack>
                </div>
              </Card>

              {/* Watcher (Referral) */}
              <Card minH="400px">
                <CardHeader>
                  <HStack spacing={2}>
                    <Users size={20} color="#9945FF" />
                    <CardTitle>Watcher (Referral)</CardTitle>
                  </HStack>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Контракт Watcher</h3>
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
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Настройки партнерки</h3>
                    <div className="flex gap-4"><span className="opacity-70">Default profit bps:</span><span className="font-medium">{watcherDefaults ? watcherDefaults.bps : "-"}</span></div>
                    <div className="flex gap-4"><span className="opacity-70">Default daily reg. limit:</span><span className="font-medium">{watcherDefaults ? watcherDefaults.limit : "-"}</span></div>
                  </div>
                </div>
          </Card>

              {/* Моя реф. информация */}
              <Card minH="500px">
                <CardHeader>
                  <HStack spacing={2}>
                    <UserPlus size={20} color="#9945FF" />
                    <CardTitle>Моя реф. информация</CardTitle>
                  </HStack>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Текущий статус</h3>
                    <div className="flex gap-4"><span className="opacity-70">Статус:</span><span className="font-medium">{registered === null ? "-" : registered ? "Зарегистрирован" : "Не зарегистрирован"}</span></div>
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
                      <p className="text-xs text-amber-700">Вы не зарегистрированы по реф.коду. Покупка возможна без реферала.</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Управление рефералами</h3>
                    <VStack spacing={4} align="stretch">
                      <Box>
                    <Button 
                      onClick={onGenerateCode} 
                      disabled={!watcher || loading}
                      colorScheme="purple"
                      variant="outline"
                      leftIcon={loading ? <Spinner size="sm" /> : <Code size={16} />}
                      size="lg"
                    >
                      {loading ? "Генерация..." : "Сгенерировать реф-код"}
                    </Button>
                  </Box>
                  
                  <Divider />
                  
                      <VStack spacing={4} align="stretch">
                        <Label>Код рефовода (hex)</Label>
                        <Input 
                          placeholder="64-симв. hex" 
                          value={registerHex} 
                          onChange={(e) => setRegisterHex(e.target.value)}
                        />
                        <Button 
                          onClick={onRegisterByCode} 
                          disabled={!watcher || loading}
                          colorScheme="green"
                          leftIcon={loading ? <Spinner size="sm" /> : <UserPlus size={16} />}
                          size="lg"
                        >
                          {loading ? "Регистрация..." : "Зарегистрироваться по коду"}
                        </Button>
                      </VStack>
                    </VStack>
                  </div>
                </div>
              </Card>
            </div>
          </VStack>
        </WalletGate>
      </VStack>
    </Box>
  );
}
