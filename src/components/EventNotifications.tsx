"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { explorerTxUrl } from "@/lib/utils";

interface LotteryEventData {
  type: 'lottery';
  eventName: string;
  signature: string;
  data: Record<string, unknown>;
}

interface WatcherEventData {
  type: 'watcher';
  eventName: string;
  signature: string;
  data: Record<string, unknown>;
}

type EventData = LotteryEventData | WatcherEventData | { type: 'connected' };

export function EventNotifications() {
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data) as EventData;
        
        if (eventData.type === 'connected') {
          console.log('[EventNotifications] Connected to event stream');
          return;
        }

        handleEvent(eventData);
      } catch (error) {
        console.error('[EventNotifications] Error parsing event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[EventNotifications] SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return null;
}

function handleEvent(event: LotteryEventData | WatcherEventData) {
  const explorerUrl = explorerTxUrl(event.signature);

  if (event.type === 'lottery') {
    handleLotteryEvent(event, explorerUrl);
  } else if (event.type === 'watcher') {
    handleWatcherEvent(event, explorerUrl);
  }
}

function handleLotteryEvent(event: LotteryEventData, explorerUrl: string) {
  switch (event.eventName) {
    case 'NewRoundInitialized':
      toast.success('🎰 Новый раунд запущен', {
        description: `Раунд #${event.data.roundId || 'N/A'}`,
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    case 'TicketPurchased':
      toast.info('🎫 Билет куплен', {
        description: `${event.data.ticketCount || 0} билет(ов) в раунде #${event.data.roundId || 'N/A'}`,
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    case 'RandomnessRequested':
      toast('🎲 Запрос случайности', {
        description: `Раунд #${event.data.roundId || 'N/A'} - ожидание VRF`,
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    case 'RandomnessSettled':
      toast.success('✨ Случайность получена', {
        description: `Раунд #${event.data.roundId || 'N/A'} - выбрано ${event.data.winnersCount || 0} победителей`,
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    case 'RoundFinished':
      toast.success('🏆 Раунд завершен', {
        description: `Раунд #${event.data.roundId || 'N/A'} - призовой фонд: ${Number(event.data.pot || 0) / 1e9} SOL`,
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    case 'RoundCanceled':
      toast.warning('❌ Раунд отменен', {
        description: `Раунд #${event.data.roundId || 'N/A'}`,
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    default:
      console.log('[EventNotifications] Unknown lottery event:', event.eventName);
  }
}

function handleWatcherEvent(event: WatcherEventData, explorerUrl: string) {
  switch (event.eventName) {
    case 'ProfitUpdated':
      toast.info('💰 Реферальная прибыль обновлена', {
        description: `Раунд #${event.data.roundId || 'N/A'} - ${Number(event.data.amount || 0) / 1e9} SOL`,
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    case 'ProfitWithdrawn':
      toast.success('💸 Прибыль выведена', {
        description: `${Number(event.data.amount || 0) / 1e9} SOL из раунда #${event.data.roundId || 'N/A'}`,
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    case 'ReferrerForUser':
      toast('🤝 Новая реферальная связь', {
        description: 'Пользователь зарегистрирован по реферальному коду',
        action: {
          label: 'Транзакция',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      break;

    default:
      // Пропускаем view события (они не важны для уведомлений)
      if (!event.eventName.endsWith('View')) {
        console.log('[EventNotifications] Unknown watcher event:', event.eventName);
      }
  }
}

