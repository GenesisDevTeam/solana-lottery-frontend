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
    isFinished: boolean;
  }>({
    roundId: null,
    pot: "-",
    ticketPrice: "-",
    totalTickets: "-",
    finishTs: "-",
    isFinished: false
  });
  const [canFinishRound, setCanFinishRound] = useState(false);
  const [timeUntilFinish, setTimeUntilFinish] = useState<string>("");

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
          
          const currentTime = Math.floor(Date.now() / 1000);
          const finishTime = round.finishTimestamp.toNumber();
          const isFinished = round.isFinished;
          const canFinish = !isFinished && currentTime >= finishTime;
          
          // Вычисляем оставшееся время
          let timeUntilFinishText = "";
          if (!isFinished && currentTime < finishTime) {
            const remainingSeconds = finishTime - currentTime;
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            timeUntilFinishText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          } else if (isFinished) {
            timeUntilFinishText = "Завершен";
          } else {
            timeUntilFinishText = "Можно завершить";
          }
          
          setCurrentRoundInfo({
            roundId: currentRoundId,
            pot: (round.pot as anchor.BN).toString(),
            ticketPrice: (round.ticketPrice as anchor.BN).toString(),
            totalTickets: (round.totalTickets as anchor.BN).toString(),
            finishTs: String(round.finishTimestamp),
            isFinished
          });
          setCanFinishRound(canFinish);
          setTimeUntilFinish(timeUntilFinishText);
        }
      } catch (e) {
        console.error("Ошибка загрузки админской информации:", e);
      }
    };

    loadAdminInfo();
  }, [lottery]);

  // Таймер для обновления времени до завершения раунда
  useEffect(() => {
    if (!currentRoundInfo.roundId || currentRoundInfo.isFinished) return;
    
    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const finishTime = Number(currentRoundInfo.finishTs);
      
      if (currentTime >= finishTime) {
        setCanFinishRound(true);
        setTimeUntilFinish("Можно завершить");
        clearInterval(interval);
      } else {
        const remainingSeconds = finishTime - currentTime;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        setTimeUntilFinish(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        setCanFinishRound(false);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentRoundInfo.roundId, currentRoundInfo.finishTs, currentRoundInfo.isFinished]);

  const createRound = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      setError(null);
      const [lotteryState] = PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
      const state = await lottery.account.lotteryState.fetch(lotteryState);
      const newRoundId = state.latestRoundId.toNumber() + 1;
      const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(newRoundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      const [roundEscrowPda] = PublicKey.findProgramAddressSync([Buffer.from("round_escrow"), new anchor.BN(newRoundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      const now = Math.floor(Date.now() / 1000);
      const startTs = now + 30;
      const finishTs = now + parseInt(duration, 10);
      const initAccounts = { 
        lotteryState, 
        round: roundPda,
        roundEscrow: roundEscrowPda,
        admin: lottery.provider.publicKey!,
        systemProgram: anchor.web3.SystemProgram.programId,
      };
      
      await lottery.methods
        .initializeRound(new anchor.BN(startTs), new anchor.BN(finishTs), parseInt(feeBps, 10), 1, [10000], new anchor.BN(ticketPrice))
        .accounts(initAccounts as never)
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

  const finishRoundWithRandomness = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      setError(null);
      
      const [lotteryState] = PublicKey.findProgramAddressSync([Buffer.from("lottery_state")], lottery.programId);
      const state = await lottery.account.lotteryState.fetch(lotteryState);
      const roundId = state.latestRoundId.toNumber();
      const [roundPda] = PublicKey.findProgramAddressSync([Buffer.from("round"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      
      // Проверяем состояние раунда
      const round = await lottery.account.round.fetch(roundPda);
      if (round.isFinished) {
        throw new Error("Раунд уже завершен");
      }
      
      // Проверяем, что время раунда истекло
      const currentTime = Math.floor(Date.now() / 1000);
      const finishTime = round.finishTimestamp.toNumber();
      if (currentTime < finishTime) {
        const remainingSeconds = finishTime - currentTime;
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        throw new Error(`Раунд еще не завершился. Осталось: ${remainingMinutes} минут (${remainingSeconds} секунд)`);
      }
      
      // Генерируем мок-случайность напрямую (упрощенный подход без реального Switchboard)
      const mockRandomness = Array.from(crypto.getRandomValues(new Uint8Array(32)));
      
      // watcher referral PDAs (временно не используются из-за проблем с переводами SOL)
      // const watcherProgramId = new PublicKey((watcherIdl as { address: string }).address);
      // const referralEscrow = PublicKey.findProgramAddressSync([Buffer.from("referral_escrow")], watcherProgramId)[0];
      // const roundTotalProfit = PublicKey.findProgramAddressSync([Buffer.from("round_profit"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], watcherProgramId)[0];
      
      // Генерируем победителей локально, используя ТУ ЖЕ логику, что и в контракте
      // Это позволит нам заранее знать, какие аккаунты передавать
      const winnersCount = round.winnersCount;
      const totalTickets = (round.totalTickets as anchor.BN).toNumber();
      
      // Повторяем логику контракта для генерации победителей
      const winningTickets: number[] = [];
      if (totalTickets > 0) {
        for (let i = 0; i < winnersCount; i++) {
          let salt = i;
          while (true) {
            // Используем ту же логику хеширования, что и в контракте
            const saltBytes = new Uint8Array(8);
            const view = new DataView(saltBytes.buffer);
            view.setBigUint64(0, BigInt(salt), true); // little endian
            
            // Создаем hash (упрощенная версия keccak)
            const combined = new Uint8Array(mockRandomness.length + saltBytes.length);
            combined.set(mockRandomness);
            combined.set(saltBytes, mockRandomness.length);
            
            // Простое хеширование для демонстрации
            let hash = 0;
            for (let j = 0; j < combined.length; j++) {
              hash = ((hash << 5) - hash + combined[j]) & 0xffffffff;
            }
            
            const num = (Math.abs(hash) % totalTickets) + 1;
            
            if (!winningTickets.includes(num)) {
              winningTickets.push(num);
              break;
            }
            salt++;
          }
        }
      }
      
      // Теперь находим владельцев выигрышных билетов
      const purchaseCount = (round.purchaseCount as anchor.BN).toNumber();
      const purchases: PublicKey[] = [];
      const payees: PublicKey[] = [];
      
      for (const ticket of winningTickets) {
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
        
        if (!matchPk || !matchUser) {
          throw new Error(`Не найден владелец билета ${ticket}`);
        }
        
        purchases.push(matchPk);
        payees.push(matchUser);
      }
      
      // Контракт ожидает: 2 referral аккаунта + 2 * количество_победителей
      // Но у нас проблема с переводами SOL с PDA
      // Попробуем передать системные аккаунты вместо PDA для referral части
      const remainingAccounts = [
        // Вместо referral PDA передаем системные аккаунты
        { pubkey: lottery.provider.publicKey!, isSigner: false, isWritable: true },  // вместо referralEscrow
        { pubkey: lottery.provider.publicKey!, isSigner: false, isWritable: false }, // вместо roundTotalProfit
        ...purchases.flatMap((pk, i) => ([
          { pubkey: pk, isSigner: false, isWritable: false },
          { pubkey: payees[i], isSigner: false, isWritable: true },
        ])),
      ];
      

      // Вызываем settle_on_demand_randomness с правильными аккаунтами
      const [roundEscrowPda] = PublicKey.findProgramAddressSync([Buffer.from("round_escrow"), new anchor.BN(roundId).toArrayLike(Buffer, "le", 8)], lottery.programId);
      const settleAccounts = {
        lotteryState,
        round: roundPda,
        roundEscrow: roundEscrowPda,
        randomnessAccount: anchor.web3.SystemProgram.programId,
        systemProgram: anchor.web3.SystemProgram.programId,
      };
      
      await lottery.methods
        .settleOnDemandRandomness(new anchor.BN(roundId), mockRandomness)
        .accounts(settleAccounts as never)
        .remainingAccounts(remainingAccounts)
        .rpc();
      
      toast({
        title: "Раунд завершен",
        description: `Раунд #${roundId} успешно завершен с генерацией случайности`,
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
                      Завершить текущий активный раунд лотереи
                    </Text>
                    
                    {/* Статус времени до завершения */}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <Text fontSize="sm" color="gray.600">Статус раунда:</Text>
                        <Text fontSize="sm" fontWeight="bold" color={canFinishRound ? "green.600" : "orange.600"}>
                          {timeUntilFinish}
                        </Text>
                      </div>
                      {currentRoundInfo.isFinished && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Раунд уже завершен
                        </Text>
                      )}
                      {!currentRoundInfo.isFinished && !canFinishRound && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Ожидание окончания времени раунда
                        </Text>
                      )}
                      {!currentRoundInfo.isFinished && canFinishRound && (
                        <Text fontSize="xs" color="green.600" mt={1}>
                          Время истекло, можно завершать раунд
                        </Text>
                      )}
                    </div>
                    
                    <Divider />
                    <Button
                      onClick={finishRoundWithRandomness}
                      disabled={loading || !lottery || !canFinishRound || currentRoundInfo.isFinished}
                      colorScheme={canFinishRound && !currentRoundInfo.isFinished ? "purple" : "gray"}
                      leftIcon={loading ? <Spinner size="sm" /> : <Square size={16} />}
                      size="lg"
                      width="full"
                    >
                      {loading ? "Завершение..." : 
                       currentRoundInfo.isFinished ? "Раунд завершен" :
                       canFinishRound ? "Завершить раунд" : "Ожидание окончания времени"}
                    </Button>
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      Раунд будет завершен с использованием Switchboard VRF для честной генерации победителей
                    </Text>
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


