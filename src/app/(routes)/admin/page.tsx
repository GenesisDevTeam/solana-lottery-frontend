"use client";

import { useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useAnchor } from "@/lib/anchor";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletGate } from "@/components/WalletGate";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Divider
} from "@chakra-ui/react";
import { Settings, Play, Square, DollarSign } from "lucide-react";
import watcherIdl from "@/idl/watcher_referral.json";
import { useEffect } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function AdminPage() {
  const { lottery } = useAnchor();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [ticketPrice, setTicketPrice] = useState("10000000");
  const [duration, setDuration] = useState("3600");
  const [feeBps, setFeeBps] = useState("500");
  const [error, setError] = useState<string | null>(null);
  const [feeBalance, setFeeBalance] = useState<string>("-");
  const [currentRoundInfo, setCurrentRoundInfo] = useState<{
    roundId: number | null;
    pot: string;
    ticketPrice: string;
    totalTickets: string;
    finishTs: string;
  }>({
    roundId: null,
    pot: "-",
    ticketPrice: "-",
    totalTickets: "-",
    finishTs: "-"
  });

  // Загрузка информации о комиссиях и текущем раунде
  useEffect(() => {
    const loadAdminInfo = async () => {
      if (!lottery) return;
      try {
        // Загружаем информацию о комиссиях
        const [lotteryState] = PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
        const state = await lottery.account.lotteryState.fetch(lotteryState);
        setFeeBalance((state.feeBalance as anchor.BN).toString());

        // Загружаем информацию о текущем раунде
        const currentRoundId = state.latestRoundId.toNumber();
        if (currentRoundId > 0) {
          const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(currentRoundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
          const round = await lottery.account.round.fetch(roundPda);
          
          setCurrentRoundInfo({
            roundId: currentRoundId,
            pot: (round.pot as anchor.BN).toString(),
            ticketPrice: (round.ticketPrice as anchor.BN).toString(),
            totalTickets: (round.totalTickets as anchor.BN).toString(),
            finishTs: String(round.finishTimestamp)
          });
        }
      } catch (e) {
        console.error("Ошибка загрузки админской информации:", e);
      }
    };

    loadAdminInfo();
  }, [lottery]);

  const createRound = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      setError(null);
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
      toast({
        title: "Раунд создан",
        description: `Раунд #${newRoundId} успешно создан`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      const err = e as Error & { message?: string };
      const errorMsg = err.message || "Ошибка создания раунда";
      setError(errorMsg);
      toast({
        title: "Ошибка",
        description: errorMsg,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const finishRound = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      setError(null);
      const [lotteryState] = PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
      const state = await lottery.account.lotteryState.fetch(lotteryState);
      const roundId = state.latestRoundId.toNumber();
      const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      // watcher referral PDAs
      const watcherProgramId = new PublicKey((watcherIdl as { address: string }).address);
      const referralEscrow = PublicKey.findProgramAddressSync([Buffer.from("referral_escrow")], watcherProgramId)[0];
      const roundTotalProfit = PublicKey.findProgramAddressSync([Buffer.from("round_profit"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], watcherProgramId)[0];

      // подберем пары (purchase, system account победителя)
      const roundAcc = await lottery.account.round.fetch(roundPda);
      const winners: number[] = (roundAcc.winningTickets as anchor.BN[]).map((bn: anchor.BN) => bn.toNumber());
      const purchaseCount = (roundAcc.purchaseCount as anchor.BN).toNumber();
      const purchases: PublicKey[] = [];
      const payees: PublicKey[] = [];
      for (const ticket of winners) {
        let matchPk: PublicKey | null = null;
        let matchUser: PublicKey | null = null;
        for (let idx = 0; idx < purchaseCount; idx++) {
          const purchasePda = PublicKey.findProgramAddressSync([
            Buffer.from("purchase"),
            new anchor.BN(roundId).toArrayLike(Buffer, "le", 8),
            new anchor.BN(idx).toArrayLike(Buffer, "le", 8),
          ], lottery.programId)[0];
          try {
            const p = await lottery.account.purchase.fetch(purchasePda);
            const end = (p.cumulativeTickets as anchor.BN).toNumber();
            const start = end - (p.ticketCount as anchor.BN).toNumber() + 1;
            if (ticket >= start && ticket <= end) {
              matchPk = purchasePda;
              matchUser = p.user as PublicKey;
              break;
            }
          } catch {}
        }
        if (!matchPk || !matchUser) throw new Error("Не найден purchase для победителя");
        purchases.push(matchPk);
        payees.push(matchUser);
      }

      const remainingAccounts = [
        { pubkey: referralEscrow, isSigner: false, isWritable: true },
        { pubkey: roundTotalProfit, isSigner: false, isWritable: false },
        ...purchases.flatMap((pk, i) => ([
          { pubkey: pk, isSigner: false, isWritable: false },
          { pubkey: payees[i], isSigner: false, isWritable: true },
        ])),
      ];

      await lottery.methods
        .finishRound(new anchor.BN(roundId))
        .accounts({ lotteryState, round: roundPda })
        .remainingAccounts(remainingAccounts)
        .rpc();
      toast({
        title: "Раунд завершен",
        description: `Раунд #${roundId} успешно завершен`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      const err = e as Error & { message?: string };
      const errorMsg = err.message || "Ошибка завершения раунда";
      setError(errorMsg);
      toast({
        title: "Ошибка",
        description: errorMsg,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const claimFees = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      setError(null);
      const [lotteryState] = PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
      await lottery.methods
        .claimAdminFees()
        .accounts({ lotteryState })
        .rpc();
      toast({
        title: "Комиссии выведены",
        description: "Административные комиссии успешно выведены",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      const err = e as Error & { message?: string };
      const errorMsg = err.message || "Ошибка вывода комиссий";
      setError(errorMsg);
      toast({
        title: "Ошибка",
        description: errorMsg,
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
            <Settings size={24} color="#9945FF" />
            <Heading size="lg" color="gray.800">Админ панель</Heading>
          </HStack>
          <WalletMultiButton />
        </HStack>

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Ошибка!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        <WalletGate>
          <VStack spacing={8} align="stretch" maxW="4xl" mx="auto">
            {/* Create Round Card */}
            <Card minH="450px">
              <CardHeader>
                <HStack spacing={2}>
                  <Play size={20} color="#9945FF" />
                  <CardTitle>Создать новый раунд</CardTitle>
                </HStack>
              </CardHeader>
              <VStack spacing={6} align="stretch" p={6} pt={0}>
                <VStack spacing={3} align="stretch">
                  <Box>
                    <Label mb={2} display="block">Цена билета (lamports)</Label>
                    <Input
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      placeholder="10000000"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {ticketPrice ? `${(Number(ticketPrice) / 1000000000).toFixed(6)} SOL` : ""}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Label mb={2} display="block">Длительность (секунды)</Label>
                    <Input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="3600"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {duration ? `${Math.floor(Number(duration) / 60)} минут` : ""}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Label mb={2} display="block">Комиссия (базисные пункты)</Label>
                    <Input
                      value={feeBps}
                      onChange={(e) => setFeeBps(e.target.value)}
                      placeholder="500"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {feeBps ? `${(Number(feeBps) / 100).toFixed(2)}%` : ""}
                    </Text>
                  </Box>
                </VStack>
                
                <Separator />
                
                <Button
                  onClick={createRound}
                  disabled={loading || !lottery}
                  colorScheme="purple"
                  leftIcon={loading ? <Spinner size="sm" /> : <Play size={16} />}
                  size="lg"
                >
                  {loading ? "Создание..." : "Создать раунд"}
                </Button>
              </VStack>
            </Card>

            {/* Finish Round Card */}
            <Card minH="400px">
              <CardHeader>
                <HStack spacing={2}>
                  <Square size={20} color="#9945FF" />
                  <CardTitle>Завершить текущий раунд</CardTitle>
                </HStack>
              </CardHeader>
              <VStack spacing={6} align="stretch" p={6} pt={0}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Текущий раунд</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-70">ID раунда:</span>
                        <span className="font-medium">{currentRoundInfo.roundId ?? "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Пот:</span>
                        <span className="font-medium">
                          {currentRoundInfo.pot !== "-" ? `${(Number(currentRoundInfo.pot) / LAMPORTS_PER_SOL).toFixed(4)} SOL` : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Цена билета:</span>
                        <span className="font-medium">
                          {currentRoundInfo.ticketPrice !== "-" ? `${(Number(currentRoundInfo.ticketPrice) / LAMPORTS_PER_SOL).toFixed(6)} SOL` : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Куплено билетов:</span>
                        <span className="font-medium">{currentRoundInfo.totalTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Финиш:</span>
                        <span className="font-medium">
                          {currentRoundInfo.finishTs !== "-" ? new Date(Number(currentRoundInfo.finishTs) * 1000).toLocaleString() : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Text fontSize="sm" color="gray.600">
                      Принудительно завершить текущий активный раунд лотереи
                    </Text>
                    <Divider />
                    <Button
                      onClick={finishRound}
                      disabled={loading || !lottery}
                      colorScheme="red"
                      variant="outline"
                      leftIcon={loading ? <Spinner size="sm" /> : <Square size={16} />}
                      size="lg"
                      width="full"
                    >
                      {loading ? "Завершение..." : "Завершить раунд"}
                    </Button>
                  </div>
                </div>
              </VStack>
            </Card>

            {/* Claim Fees Card */}
            <Card minH="400px">
              <CardHeader>
                <HStack spacing={2}>
                  <DollarSign size={20} color="#9945FF" />
                  <CardTitle>Вывод административных комиссий</CardTitle>
                </HStack>
              </CardHeader>
              <VStack spacing={6} align="stretch" p={6} pt={0}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Доступные комиссии</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-3 bg-green-50 rounded-md">
                        <span className="opacity-70">Накоплено комиссий:</span>
                        <span className="font-bold text-green-600">
                          {feeBalance !== "-" ? `${(Number(feeBalance) / LAMPORTS_PER_SOL).toFixed(6)} SOL` : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                        <span className="opacity-70">В lamports:</span>
                        <span className="font-medium text-gray-600">
                          {feeBalance !== "-" ? `${Number(feeBalance).toLocaleString()}` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Text fontSize="sm" color="gray.600">
                      Вывести накопленные административные комиссии на ваш кошелек
                    </Text>
                    <Divider />
                    <Button
                      onClick={claimFees}
                      disabled={loading || !lottery || feeBalance === "-" || Number(feeBalance) === 0}
                      colorScheme="green"
                      leftIcon={loading ? <Spinner size="sm" /> : <DollarSign size={16} />}
                      size="lg"
                      width="full"
                    >
                      {loading ? "Вывод..." : "Вывести комиссии"}
                    </Button>
                    {feeBalance !== "-" && Number(feeBalance) === 0 && (
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        Нет доступных комиссий для вывода
                      </Text>
                    )}
                  </div>
                </div>
              </VStack>
            </Card>
          </VStack>
        </WalletGate>
      </VStack>
    </Box>
  );
}


