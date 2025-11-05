import {
  NewRoundInitializedEvent,
  TicketPurchasedEvent,
  RandomnessRequestedEvent,
  RandomnessSettledEvent,
  RoundFinishedEvent,
  RoundCanceledEvent,
} from '@/types/webhook-events';

interface TransactionMetadata {
  signature: string;
  timestamp: number;
  slot: number;
}

type LotteryEventName =
  | 'NewRoundInitialized'
  | 'TicketPurchased'
  | 'RandomnessRequested'
  | 'RandomnessSettled'
  | 'RoundFinished'
  | 'RoundCanceled';

export async function handleLotteryEvent(
  eventName: LotteryEventName,
  eventData: unknown,
  metadata: TransactionMetadata
): Promise<void> {
  const timestamp = new Date(metadata.timestamp * 1000).toISOString();
  
  switch (eventName) {
    case 'NewRoundInitialized':
      await handleNewRoundInitialized(eventData as NewRoundInitializedEvent, metadata, timestamp);
      break;
    case 'TicketPurchased':
      await handleTicketPurchased(eventData as TicketPurchasedEvent, metadata, timestamp);
      break;
    case 'RandomnessRequested':
      await handleRandomnessRequested(eventData as RandomnessRequestedEvent, metadata, timestamp);
      break;
    case 'RandomnessSettled':
      await handleRandomnessSettled(eventData as RandomnessSettledEvent, metadata, timestamp);
      break;
    case 'RoundFinished':
      await handleRoundFinished(eventData as RoundFinishedEvent, metadata, timestamp);
      break;
    case 'RoundCanceled':
      await handleRoundCanceled(eventData as RoundCanceledEvent, metadata, timestamp);
      break;
    default:
      console.warn(`[LOTTERY] Unknown event type: ${eventName}`);
  }
}

async function handleNewRoundInitialized(
  data: NewRoundInitializedEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'LOTTERY',
    event: 'NewRoundInitialized',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      roundId: data.round_id,
      startTimestamp: new Date(data.start_timestamp * 1000).toISOString(),
      finishTimestamp: new Date(data.finish_timestamp * 1000).toISOString(),
      ticketPrice: data.ticket_price,
    },
  };
  
  console.log(`[${timestamp}] [LOTTERY] [NewRoundInitialized]`, JSON.stringify(logEntry, null, 2));
}

async function handleTicketPurchased(
  data: TicketPurchasedEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'LOTTERY',
    event: 'TicketPurchased',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      roundId: data.round_id,
      user: typeof data.user === 'string' ? data.user : data.user?.toString(),
      ticketCount: data.ticket_count,
      startTicket: data.start_ticket,
      endTicket: data.end_ticket,
    },
  };
  
  console.log(`[${timestamp}] [LOTTERY] [TicketPurchased]`, JSON.stringify(logEntry, null, 2));
}

async function handleRandomnessRequested(
  data: RandomnessRequestedEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'LOTTERY',
    event: 'RandomnessRequested',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      roundId: data.round_id,
      randomnessAccount: typeof data.randomness_account === 'string' 
        ? data.randomness_account 
        : data.randomness_account?.toString(),
    },
  };
  
  console.log(`[${timestamp}] [LOTTERY] [RandomnessRequested]`, JSON.stringify(logEntry, null, 2));
}

async function handleRandomnessSettled(
  data: RandomnessSettledEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'LOTTERY',
    event: 'RandomnessSettled',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      roundId: data.round_id,
      winningTickets: data.winning_tickets,
      winnersCount: data.winning_tickets?.length || 0,
    },
  };
  
  console.log(`[${timestamp}] [LOTTERY] [RandomnessSettled]`, JSON.stringify(logEntry, null, 2));
}

async function handleRoundFinished(
  data: RoundFinishedEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'LOTTERY',
    event: 'RoundFinished',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      roundId: data.round_id,
      pot: data.pot,
    },
  };
  
  console.log(`[${timestamp}] [LOTTERY] [RoundFinished]`, JSON.stringify(logEntry, null, 2));
}

async function handleRoundCanceled(
  data: RoundCanceledEvent,
  metadata: TransactionMetadata,
  timestamp: string
): Promise<void> {
  const logEntry = {
    timestamp,
    program: 'LOTTERY',
    event: 'RoundCanceled',
    signature: metadata.signature,
    slot: metadata.slot,
    data: {
      roundId: data.round_id,
    },
  };
  
  console.log(`[${timestamp}] [LOTTERY] [RoundCanceled]`, JSON.stringify(logEntry, null, 2));
}
