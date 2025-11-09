"use client";

import { useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
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
  Divider,
} from "@chakra-ui/react";
import { Settings, Play, Square, DollarSign } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Randomness,
  ON_DEMAND_DEVNET_QUEUE_PDA,
  ON_DEMAND_DEVNET_PID,
} from "@switchboard-xyz/on-demand";

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
    isFinished: false,
  });
  const [canFinishRound, setCanFinishRound] = useState(false);
  const [timeUntilFinish, setTimeUntilFinish] = useState<string>("");

  // Загрузка информации о комиссиях и текущем раунде
  useEffect(() => {
    const loadAdminInfo = async () => {
      if (!lottery) return;
      try {
        // Загружаем информацию о комиссиях
        const [lotteryState] = PublicKey.findProgramAddressSync(
          [Buffer.from("lottery_state")],
          lottery.programId
        );
        const state = await lottery.account.lotteryState.fetch(lotteryState);
        setFeeBalance((state.feeBalance as anchor.BN).toString());

        // Загружаем информацию о текущем раунде
        const currentRoundId = state.latestRoundId.toNumber();
        if (currentRoundId > 0) {
          const [roundPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from("round"),
              new anchor.BN(currentRoundId).toArrayLike(Buffer, "le", 8),
            ],
            lottery.programId
          );
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
            timeUntilFinishText = `${minutes}:${seconds
              .toString()
              .padStart(2, "0")}`;
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
            isFinished,
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
        setTimeUntilFinish(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        setCanFinishRound(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    currentRoundInfo.roundId,
    currentRoundInfo.finishTs,
    currentRoundInfo.isFinished,
  ]);

  const createRound = async () => {
    if (!lottery) return;
    try {
      setLoading(true);
      setError(null);
      const [lotteryState] = PublicKey.findProgramAddressSync(
        [Buffer.from("lottery_state")],
        lottery.programId
      );
      const state = await lottery.account.lotteryState.fetch(lotteryState);
      const newRoundId = state.latestRoundId.toNumber() + 1;
      const [roundPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("round"),
          new anchor.BN(newRoundId).toArrayLike(Buffer, "le", 8),
        ],
        lottery.programId
      );
      const [roundEscrowPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("round_escrow"),
          new anchor.BN(newRoundId).toArrayLike(Buffer, "le", 8),
        ],
        lottery.programId
      );
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
        .initializeRound(
          new anchor.BN(startTs),
          new anchor.BN(finishTs),
          parseInt(feeBps, 10),
          1,
          [10000],
          new anchor.BN(ticketPrice)
        )
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

    console.log("🎢 Начинаем процесс завершения раунда...");

    try {
      setLoading(true);
      setError(null);

      const [lotteryState] = PublicKey.findProgramAddressSync(
        [Buffer.from("lottery_state")],
        lottery.programId
      );
      const state = await lottery.account.lotteryState.fetch(lotteryState);
      const roundId = state.latestRoundId.toNumber();
      const [roundPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("round"),
          new anchor.BN(roundId).toArrayLike(Buffer, "le", 8),
        ],
        lottery.programId
      );

      // Проверяем состояние раунда
      const round = await lottery.account.round.fetch(roundPda);
      console.log("Состояние раунда:", {
        isFinished: round.isFinished,
        purchaseCount: round.purchaseCount?.toString(),
        totalTickets: round.totalTickets?.toString(),
        pot: round.pot?.toString(),
      });

      if (round.isFinished) {
        throw new Error("Раунд уже завершен");
      }

      // Проверяем, что время раунда истекло
      const currentTime = Math.floor(Date.now() / 1000);
      const finishTime = round.finishTimestamp.toNumber();
      if (currentTime < finishTime) {
        const remainingSeconds = finishTime - currentTime;
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        throw new Error(
          `Раунд еще не завершился. Осталось: ${remainingMinutes} минут (${remainingSeconds} секунд)`
        );
      }

      console.log("Создаем Switchboard On-Demand randomness account...");

      // Шаг 1: Создаем randomness account через Switchboard SDK
      const randomnessKeypair = Keypair.generate();

      // Создаем Switchboard program для On-Demand
      const switchboardProgram = await anchor.Program.at(
        ON_DEMAND_DEVNET_PID,
        lottery.provider
      );

      // Создаем randomness account через Switchboard SDK
      const [randomness, createIx] = await Randomness.create(
        switchboardProgram,
        randomnessKeypair,
        ON_DEMAND_DEVNET_QUEUE_PDA
      );

      // Выполняем создание randomness account
      const createTx = new anchor.web3.Transaction().add(createIx);

      if (lottery.provider.sendAndConfirm) {
        await lottery.provider.sendAndConfirm(createTx, [randomnessKeypair]);
      } else {
        throw new Error("Метод sendAndConfirm недоступен");
      }
      console.log(
        "Randomness account создан:",
        randomnessKeypair.publicKey.toBase58()
      );

      // Шаг 2: Commit к randomness account (реальный Switchboard VRF)
      console.log("Выполняем commit к Switchboard randomness account...");

      const commitIx = await randomness.commitIx(ON_DEMAND_DEVNET_QUEUE_PDA);
      const commitTx = new anchor.web3.Transaction().add(commitIx);

      if (lottery.provider.sendAndConfirm) {
        await lottery.provider.sendAndConfirm(commitTx, []);
      } else {
        throw new Error("Метод sendAndConfirm недоступен");
      }

      console.log("✅ Commit выполнен");

      // Сохраняем ссылку на randomness account в нашем контракте
      const [vrfStatePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vrf_client"),
          new anchor.BN(roundId).toArrayLike(Buffer, "le", 8),
        ],
        lottery.programId
      );

      const requestAccounts = {
        round: roundPda,
        vrfState: vrfStatePda,
        randomnessAccount: randomnessKeypair.publicKey,
        payer: lottery.provider.publicKey!,
        systemProgram: anchor.web3.SystemProgram.programId,
      };

      await lottery.methods
        .requestOnDemandRandomness(new anchor.BN(roundId))
        .accounts(requestAccounts as never)
        .rpc();

      console.log("✅ Ссылка на randomness account сохранена");

      console.log("Случайность запрошена, ожидаем получение...");

      // Шаг 3: Ждем следующий слот для reveal
      console.log("Ожидаем следующий слот для reveal...");
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Ждем ~3 секунды

      // Шаг 4: Reveal randomness
      console.log("Выполняем reveal randomness...");

      const revealIx = await randomness.revealIx();
      const revealTx = new anchor.web3.Transaction().add(revealIx);

      if (lottery.provider.sendAndConfirm) {
        await lottery.provider.sendAndConfirm(revealTx, []);
      } else {
        throw new Error("Метод sendAndConfirm недоступен");
      }

      console.log("✅ Reveal выполнен, проверяем готовность randomness...");

      // Проверяем что randomness готов
      let randomnessReady = false;
      const maxAttempts = 15;

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          const randomnessData = await randomness.loadData();
          console.log(`Попытка ${i + 1}: randomnessData:`, randomnessData);

          if (randomnessData && randomnessData.value) {
            console.log("Value type:", typeof randomnessData.value);
            console.log(
              "Value array check:",
              Array.isArray(randomnessData.value)
            );

            if (
              Array.isArray(randomnessData.value) &&
              randomnessData.value.length === 32 &&
              !randomnessData.value.every((byte: number) => byte === 0)
            ) {
              randomnessReady = true;
              const hexValue = randomnessData.value
                .slice(0, 8)
                .map((b: number) => b.toString(16).padStart(2, "0"))
                .join("");
              console.log("✅ Randomness получен:", hexValue);
              break;
            } else if (
              randomnessData.value &&
              !Array.isArray(randomnessData.value)
            ) {
              console.log(
                "⚠️ Неожиданный формат value:",
                typeof randomnessData.value,
                randomnessData.value
              );
            }
          }
        } catch (error) {
          console.log(`Попытка ${i + 1}: ошибка загрузки randomness:`, error);
        }
      }

      if (!randomnessReady) {
        throw new Error(
          "Switchboard randomness не готов после reveal. Попробуйте позже."
        );
      }

      // Находим владельцев билетов для выплат
      const purchaseCount = round.purchaseCount
        ? (round.purchaseCount as anchor.BN).toNumber()
        : 0;
      const purchases: PublicKey[] = [];
      const payees: PublicKey[] = [];

      console.log("Покупок в раунде:", purchaseCount);

      // Получаем все покупки для передачи в контракт
      for (let i = 0; i < purchaseCount; i++) {
        const purchasePda = PublicKey.findProgramAddressSync(
          [
            Buffer.from("purchase"),
            new anchor.BN(roundId).toArrayLike(Buffer, "le", 8),
            new anchor.BN(i).toArrayLike(Buffer, "le", 8),
          ],
          lottery.programId
        )[0];

        try {
          const p = await lottery.account.purchase.fetch(purchasePda);
          purchases.push(purchasePda);
          payees.push(p.user as PublicKey);
        } catch {
          // Если покупка не существует, пропускаем
        }
      }

      // Получаем правильные PDA для referral программы
      const watcherProgramId = new PublicKey(
        "j9RyfMTz4dc9twnFCUZLJzMmhacUqTFHQkCXr7uDpQf"
      );
      const [referralEscrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("referral_escrow")],
        watcherProgramId
      );
      const [roundTotalProfitPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("round_profit"),
          new anchor.BN(roundId).toArrayLike(Buffer, "le", 8),
        ],
        watcherProgramId
      );
      const [roundEscrowPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("round_escrow"),
          new anchor.BN(roundId).toArrayLike(Buffer, "le", 8),
        ],
        lottery.programId
      );

      // Проверяем что у нас есть покупки
      console.log("Найдено покупок:", purchases.length);

      const remainingAccounts = [
        // Правильные PDA от referral программы
        { pubkey: referralEscrowPda, isSigner: false, isWritable: true },
        { pubkey: roundTotalProfitPda, isSigner: false, isWritable: false },
        // Добавляем все покупки и получателей (с защитой)
        ...(purchases && purchases.length > 0
          ? purchases.flatMap((pk, i) => [
              { pubkey: pk, isSigner: false, isWritable: false },
              {
                pubkey: payees[i] || anchor.web3.SystemProgram.programId,
                isSigner: false,
                isWritable: true,
              },
            ])
          : []),
      ];

      // Шаг 4: Завершаем раунд с использованием revealed randomness
      console.log("Завершаем раунд с распределением призов...");

      const settleAccounts = {
        lotteryState,
        round: roundPda,
        roundEscrow: roundEscrowPda,
        randomnessAccount: randomnessKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      };

      console.log("Завершаем раунд с VRF randomness...");

      await lottery.methods
        .settleOnDemandRandomness(new anchor.BN(roundId))
        .accounts(settleAccounts as never)
        .remainingAccounts(remainingAccounts)
        .rpc();

      toast({
        title: "Раунд завершен",
        description: `Раунд #${roundId} успешно завершен с использованием Switchboard On-Demand VRF`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Обновляем состояние страницы
      window.location.reload();
    } catch (e) {
      const err = e as Error & { message?: string; stack?: string };
      const errorMsg = err.message || "Ошибка завершения раунда";
      setError(errorMsg);

      // Подробное логирование ошибки
      console.error("❌ Ошибка завершения раунда:");
      console.error("Message:", err.message);
      console.error("Stack:", err.stack);
      console.error("Full error:", e);

      toast({
        title: "Ошибка",
        description: errorMsg,
        status: "error",
        duration: 10000,
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
      const [lotteryState] = PublicKey.findProgramAddressSync(
        [Buffer.from("lottery_state")],
        lottery.programId
      );
      await lottery.methods.claimAdminFees().accounts({ lotteryState }).rpc();
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
            <Heading size="lg" color="gray.800">
              Админ панель
            </Heading>
          </HStack>
          <HStack spacing={3}>
            <Link href="/">
              <Button colorScheme="purple" size="md">
                На главную
              </Button>
            </Link>
            <WalletMultiButton />
          </HStack>
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
                    <Label mb={2} display="block">
                      Цена билета (lamports)
                    </Label>
                    <Input
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      placeholder="10000000"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {ticketPrice
                        ? `${(Number(ticketPrice) / 1000000000).toFixed(6)} SOL`
                        : ""}
                    </Text>
                  </Box>

                  <Box>
                    <Label mb={2} display="block">
                      Длительность (секунды)
                    </Label>
                    <Input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="3600"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {duration
                        ? `${Math.floor(Number(duration) / 60)} минут`
                        : ""}
                    </Text>
                  </Box>

                  <Box>
                    <Label mb={2} display="block">
                      Комиссия (базисные пункты)
                    </Label>
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
                  leftIcon={
                    loading ? <Spinner size="sm" /> : <Play size={16} />
                  }
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
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Текущий раунд
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="opacity-70">ID раунда:</span>
                        <span className="font-medium">
                          {currentRoundInfo.roundId ?? "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Пот:</span>
                        <span className="font-medium">
                          {currentRoundInfo.pot !== "-"
                            ? `${(
                                Number(currentRoundInfo.pot) / LAMPORTS_PER_SOL
                              ).toFixed(4)} SOL`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Цена билета:</span>
                        <span className="font-medium">
                          {currentRoundInfo.ticketPrice !== "-"
                            ? `${(
                                Number(currentRoundInfo.ticketPrice) /
                                LAMPORTS_PER_SOL
                              ).toFixed(6)} SOL`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Куплено билетов:</span>
                        <span className="font-medium">
                          {currentRoundInfo.totalTickets}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Финиш:</span>
                        <span className="font-medium">
                          {currentRoundInfo.finishTs !== "-"
                            ? new Date(
                                Number(currentRoundInfo.finishTs) * 1000
                              ).toLocaleString()
                            : "-"}
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
                        <Text fontSize="sm" color="gray.600">
                          Статус раунда:
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={canFinishRound ? "green.600" : "orange.600"}
                        >
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
                      disabled={
                        loading ||
                        !lottery ||
                        !canFinishRound ||
                        currentRoundInfo.isFinished
                      }
                      colorScheme={
                        canFinishRound && !currentRoundInfo.isFinished
                          ? "purple"
                          : "gray"
                      }
                      leftIcon={
                        loading ? <Spinner size="sm" /> : <Square size={16} />
                      }
                      size="lg"
                      width="full"
                    >
                      {loading
                        ? "Завершение..."
                        : currentRoundInfo.isFinished
                        ? "Раунд завершен"
                        : canFinishRound
                        ? "Завершить раунд"
                        : "Ожидание окончания времени"}
                    </Button>
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      Раунд будет завершен с использованием Switchboard
                      On-Demand VRF для честной генерации победителей
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
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Доступные комиссии
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-3 bg-green-50 rounded-md">
                        <span className="opacity-70">Накоплено комиссий:</span>
                        <span className="font-bold text-green-600">
                          {feeBalance !== "-"
                            ? `${(
                                Number(feeBalance) / LAMPORTS_PER_SOL
                              ).toFixed(6)} SOL`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                        <span className="opacity-70">В lamports:</span>
                        <span className="font-medium text-gray-600">
                          {feeBalance !== "-"
                            ? `${Number(feeBalance).toLocaleString()}`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Text fontSize="sm" color="gray.600">
                      Вывести накопленные административные комиссии на ваш
                      кошелек
                    </Text>
                    <Divider />
                    <Button
                      onClick={claimFees}
                      disabled={
                        loading ||
                        !lottery ||
                        feeBalance === "-" ||
                        Number(feeBalance) === 0
                      }
                      colorScheme="green"
                      leftIcon={
                        loading ? (
                          <Spinner size="sm" />
                        ) : (
                          <DollarSign size={16} />
                        )
                      }
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
