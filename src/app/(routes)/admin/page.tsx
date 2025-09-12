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
  useToast
} from "@chakra-ui/react";
import { Settings, Play, Square, DollarSign } from "lucide-react";

export default function AdminPage() {
  const { lottery } = useAnchor();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [ticketPrice, setTicketPrice] = useState("10000000");
  const [duration, setDuration] = useState("3600");
  const [feeBps, setFeeBps] = useState("500");
  const [error, setError] = useState<string | null>(null);

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
      await lottery.methods
        .finishRound(new anchor.BN(roundId))
        .accounts({ lotteryState, round: roundPda })
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
            <Card minH="300px">
              <CardHeader>
                <HStack spacing={2}>
                  <Square size={20} color="#9945FF" />
                  <CardTitle>Завершить текущий раунд</CardTitle>
                </HStack>
              </CardHeader>
              <VStack spacing={6} align="stretch" p={6} pt={0}>
                <Text fontSize="sm" color="gray.600">
                  Принудительно завершить текущий активный раунд лотереи
                </Text>
                <Separator />
                <Button
                  onClick={finishRound}
                  disabled={loading || !lottery}
                  colorScheme="red"
                  variant="outline"
                  leftIcon={loading ? <Spinner size="sm" /> : <Square size={16} />}
                  size="lg"
                >
                  {loading ? "Завершение..." : "Завершить раунд"}
                </Button>
              </VStack>
            </Card>

            {/* Claim Fees Card */}
            <Card minH="300px">
              <CardHeader>
                <HStack spacing={2}>
                  <DollarSign size={20} color="#9945FF" />
                  <CardTitle>Вывод административных комиссий</CardTitle>
                </HStack>
              </CardHeader>
              <VStack spacing={6} align="stretch" p={6} pt={0}>
                <Text fontSize="sm" color="gray.600">
                  Вывести накопленные административные комиссии на ваш кошелек
                </Text>
                <Separator />
                <Button
                  onClick={claimFees}
                  disabled={loading || !lottery}
                  colorScheme="green"
                  leftIcon={loading ? <Spinner size="sm" /> : <DollarSign size={16} />}
                  size="lg"
                >
                  {loading ? "Вывод..." : "Вывести комиссии"}
                </Button>
              </VStack>
            </Card>
          </VStack>
        </WalletGate>
      </VStack>
    </Box>
  );
}


