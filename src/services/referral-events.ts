import {
  ProfitUpdatedEvent,
  ProfitWithdrawnEvent,
  ReferrerForUserEvent,
  ReferrerProfitViewEvent,
  ReferrerSettingsViewEvent,
  RegistrationStatsViewEvent,
  RoundTotalProfitViewEvent,
} from '@/types/webhook-events';
import { eventBroadcaster } from '@/lib/event-broadcaster';

interface TransactionMetadata {
  signature: string;
  timestamp: number;
  slot: number;
}

type WatcherEventName =
  | 'ProfitUpdated'
  | 'ProfitWithdrawn'
  | 'ReferrerForUser'
  | 'ReferrerProfitView'
  | 'ReferrerSettingsView'
  | 'RegistrationStatsView'
  | 'RoundTotalProfitView';

export async function handleWatcherEvent(
  eventName: WatcherEventName,
  eventData: unknown,
  metadata: TransactionMetadata
): Promise<void> {
  const timestamp = new Date(metadata.timestamp * 1000).toISOString();
  
  switch (eventName) {
    case 'ProfitUpdated':
      await handleProfitUpdated(eventData as ProfitUpdatedEvent, metadata, timestamp);
      break;
    case 'ProfitWithdrawn':
      await handleProfitWithdrawn(eventData as ProfitWithdrawnEvent, metadata, timestamp);
      break;
    case 'ReferrerForUser':
      await handleReferrerForUser(eventData as ReferrerForUserEvent, metadata, timestamp);
      break;
    case 'ReferrerProfitView':
      await handleReferrerProfitView(eventData as ReferrerProfitViewEvent, metadata, timestamp);
      break;
    case 'ReferrerSettingsView':
      await handleReferrerSettingsView(eventData as ReferrerSettingsViewEvent, metadata, timestamp);
      break;
    case 'RegistrationStatsView':
      await handleRegistrationStatsView(eventData as RegistrationStatsViewEvent, metadata, timestamp);
      break;
    case 'RoundTotalProfitView':
      await handleRoundTotalProfitView(eventData as RoundTotalProfitViewEvent, metadata, timestamp);
      break;
    default:
      console.warn(`[WATCHER] Unknown event type: ${eventName}`);
  }
}

async function handleProfitUpdated(
  data: ProfitUpdatedEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'WATCHER',
    event: 'ProfitUpdated',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      player: typeof data.player === 'string' ? data.player : data.player?.toString(),
      roundId: data.round_id,
      amount: data.amount,
      referrerCode: Array.isArray(data.referrer_code) 
        ? Buffer.from(data.referrer_code).toString('hex') 
        : data.referrer_code,
    },
  };
  
  console.log(`[${timestamp}] [WATCHER] [ProfitUpdated]`, JSON.stringify(logEntry, null, 2));
  eventBroadcaster.broadcast({ type: 'watcher', eventName: 'ProfitUpdated', ...logEntry });
}

async function handleProfitWithdrawn(
  data: ProfitWithdrawnEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'WATCHER',
    event: 'ProfitWithdrawn',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      referrer: typeof data.referrer === 'string' ? data.referrer : data.referrer?.toString(),
      roundId: data.round_id,
      amount: data.amount,
    },
  };
  
  console.log(`[${timestamp}] [WATCHER] [ProfitWithdrawn]`, JSON.stringify(logEntry, null, 2));
  eventBroadcaster.broadcast({ type: 'watcher', eventName: 'ProfitWithdrawn', ...logEntry });
}

async function handleReferrerForUser(
  data: ReferrerForUserEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'WATCHER',
    event: 'ReferrerForUser',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      user: typeof data.user === 'string' ? data.user : data.user?.toString(),
      referrer: typeof data.referrer === 'string' ? data.referrer : data.referrer?.toString(),
      codeHash: Array.isArray(data.code_hash) 
        ? Buffer.from(data.code_hash).toString('hex') 
        : data.code_hash,
    },
  };
  
  console.log(`[${timestamp}] [WATCHER] [ReferrerForUser]`, JSON.stringify(logEntry, null, 2));
  eventBroadcaster.broadcast({ type: 'watcher', eventName: 'ReferrerForUser', ...logEntry });
}

async function handleReferrerProfitView(
  data: ReferrerProfitViewEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'WATCHER',
    event: 'ReferrerProfitView',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      referrer: typeof data.referrer === 'string' ? data.referrer : data.referrer?.toString(),
      roundId: data.round_id,
      amount: data.amount,
    },
  };
  
  console.log(`[${timestamp}] [WATCHER] [ReferrerProfitView]`, JSON.stringify(logEntry, null, 2));
}

async function handleReferrerSettingsView(
  data: ReferrerSettingsViewEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'WATCHER',
    event: 'ReferrerSettingsView',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      referrer: typeof data.referrer === 'string' ? data.referrer : data.referrer?.toString(),
      percentageBps: data.percentage_bps,
      customLimit: data.custom_limit,
    },
  };
  
  console.log(`[${timestamp}] [WATCHER] [ReferrerSettingsView]`, JSON.stringify(logEntry, null, 2));
}

async function handleRegistrationStatsView(
  data: RegistrationStatsViewEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'WATCHER',
    event: 'RegistrationStatsView',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      codeHash: Array.isArray(data.code_hash) 
        ? Buffer.from(data.code_hash).toString('hex') 
        : data.code_hash,
      day: data.day,
      count: data.count,
    },
  };
  
  console.log(`[${timestamp}] [WATCHER] [RegistrationStatsView]`, JSON.stringify(logEntry, null, 2));
}

async function handleRoundTotalProfitView(
  data: RoundTotalProfitViewEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'WATCHER',
    event: 'RoundTotalProfitView',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      roundId: data.round_id,
      totalAmount: data.total_amount,
    },
  };
  
  console.log(`[${timestamp}] [WATCHER] [RoundTotalProfitView]`, JSON.stringify(logEntry, null, 2));
}
