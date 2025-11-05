import { NextRequest, NextResponse } from 'next/server';
import {
  HeliusWebhookPayload,
  LOTTERY_PROGRAM_ID,
  WATCHER_PROGRAM_ID,
  getLotteryEventName,
  getWatcherEventName,
} from '@/types/webhook-events';
import { handleLotteryEvent } from '@/services/lottery-events';
import { handleWatcherEvent } from '@/services/referral-events';

const LOTTERY_EVENT_NAMES = ['NewRoundInitialized', 'TicketPurchased', 'RandomnessRequested', 'RandomnessSettled', 'RoundFinished', 'RoundCanceled'] as const;
const WATCHER_EVENT_NAMES = ['ProfitUpdated', 'ProfitWithdrawn', 'ReferrerForUser', 'ReferrerProfitView', 'ReferrerSettingsView', 'RegistrationStatsView', 'RoundTotalProfitView'] as const;

function isLotteryEventName(name: string): name is typeof LOTTERY_EVENT_NAMES[number] {
  return LOTTERY_EVENT_NAMES.includes(name as typeof LOTTERY_EVENT_NAMES[number]);
}

function isWatcherEventName(name: string): name is typeof WATCHER_EVENT_NAMES[number] {
  return WATCHER_EVENT_NAMES.includes(name as typeof WATCHER_EVENT_NAMES[number]);
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Опциональная валидация auth header
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.HELIUS_WEBHOOK_AUTH;
    
    if (expectedAuth && authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload: HeliusWebhookPayload = await request.json();

    if (!payload.transactions || !Array.isArray(payload.transactions)) {
      return NextResponse.json(
        { error: 'Invalid payload: transactions array required' },
        { status: 400 }
      );
    }

    console.log(`[WEBHOOK] Received ${payload.transactions.length} transactions from Helius`);

    // Обработка каждой транзакции
    for (const tx of payload.transactions) {
      try {
        await processTransaction(tx);
      } catch (error) {
        console.error(`[WEBHOOK] Error processing transaction ${tx.signature}:`, error);
        // Продолжаем обработку других транзакций
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processTransaction(tx: HeliusWebhookPayload['transactions'][0]) {
  const { signature, timestamp, slot, events } = tx;

  if (!events) {
    return;
  }

  // Проверяем события для каждой программы
  for (const [programId, programEvents] of Object.entries(events)) {
    if (!Array.isArray(programEvents)) {
      continue;
    }

    for (const event of programEvents) {
      try {
        // Извлекаем discriminator и данные события
        // Helius может предоставлять события в разных форматах
        // Проверяем наличие discriminator в разных возможных местах
        let discriminator: number[] | undefined;
        let eventData: unknown;

        if (typeof event === 'object' && event !== null && 'discriminator' in event) {
          const eventObj = event as { discriminator?: number[]; data?: unknown; nativeTransfer?: unknown; tokenTransfer?: unknown };
          if (eventObj.discriminator) {
            discriminator = eventObj.discriminator;
            eventData = eventObj.data || event;
          } else if (eventObj.nativeTransfer) {
            // Нативные переводы SOL - пропускаем
            continue;
          } else if (eventObj.tokenTransfer) {
            // Токен переводы - пропускаем
            continue;
          }
        } else if (Array.isArray(event) && event.length >= 8) {
          // Возможно, discriminator в первых 8 байтах
          discriminator = event.slice(0, 8) as number[];
          eventData = event.slice(8);
        }

        if (!discriminator || discriminator.length !== 8) {
          continue;
        }

        // Определяем тип события по программе
        if (programId === LOTTERY_PROGRAM_ID) {
          const eventName = getLotteryEventName(discriminator);
          if (eventName && isLotteryEventName(eventName)) {
            await handleLotteryEvent(eventName, eventData, {
              signature,
              timestamp,
              slot,
            });
          }
        } else if (programId === WATCHER_PROGRAM_ID) {
          const eventName = getWatcherEventName(discriminator);
          if (eventName && isWatcherEventName(eventName)) {
            await handleWatcherEvent(eventName, eventData, {
              signature,
              timestamp,
              slot,
            });
          }
        }
      } catch (error) {
        console.error(`[WEBHOOK] Error parsing event in tx ${signature}:`, error);
      }
    }
  }

  // Также проверяем accountData для событий, если Helius предоставляет их там
  if (tx.accountData && Array.isArray(tx.accountData)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _accountChange of tx.accountData) {
      try {
        // Здесь можно обработать изменения аккаунтов
        // Например, отслеживать изменения состояния раундов
        // TODO: Реализовать обработку изменений аккаунтов
      } catch (error) {
        console.error(`[WEBHOOK] Error processing account change in tx ${signature}:`, error);
      }
    }
  }
}
