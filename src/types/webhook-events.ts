// Auto-generated webhook event types
// Generated from Anchor IDL files
// Run: tsx scripts/generate-event-types.ts

import { PublicKey } from '@solana/web3.js';

// Auto-generated from Lottery IDL
// DO NOT EDIT MANUALLY

export interface NewRoundInitializedEvent {
  round_id: number;
  start_timestamp: number;
  finish_timestamp: number;
  ticket_price: number;
}

export interface RandomnessRequestedEvent {
  round_id: number;
  randomness_account: PublicKey;
}

export interface RandomnessSettledEvent {
  round_id: number;
  winning_tickets: number[];
}

export interface RoundCanceledEvent {
  round_id: number;
}

export interface RoundFinishedEvent {
  round_id: number;
  pot: number;
}

export interface TicketPurchasedEvent {
  round_id: number;
  start_ticket: number;
  end_ticket: number;
  ticket_count: number;
  user: PublicKey;
}

export type LotteryEvent =  | { discriminator: [20, 177, 197, 31, 194, 14, 225, 254]; data: NewRoundInitializedEvent }
  | { discriminator: [10, 64, 183, 29, 104, 63, 90, 149]; data: RandomnessRequestedEvent }
  | { discriminator: [219, 235, 45, 239, 116, 19, 92, 74]; data: RandomnessSettledEvent }
  | { discriminator: [183, 233, 3, 121, 24, 77, 193, 199]; data: RoundCanceledEvent }
  | { discriminator: [219, 203, 57, 176, 225, 115, 234, 93]; data: RoundFinishedEvent }
  | { discriminator: [108, 59, 246, 95, 84, 145, 13, 71]; data: TicketPurchasedEvent };

export function getLotteryEventName(discriminator: number[]): string | null {
  const discStr = discriminator.join(',');
  if (discStr === '20,177,197,31,194,14,225,254') return 'NewRoundInitialized';
  if (discStr === '10,64,183,29,104,63,90,149') return 'RandomnessRequested';
  if (discStr === '219,235,45,239,116,19,92,74') return 'RandomnessSettled';
  if (discStr === '183,233,3,121,24,77,193,199') return 'RoundCanceled';
  if (discStr === '219,203,57,176,225,115,234,93') return 'RoundFinished';
  if (discStr === '108,59,246,95,84,145,13,71') return 'TicketPurchased';
  return null;
}

// Auto-generated from Watcher IDL
// DO NOT EDIT MANUALLY

export interface ProfitUpdatedEvent {
  referrer_code: number[];
  player: PublicKey;
  round_id: number;
  amount: number;
}

export interface ProfitWithdrawnEvent {
  referrer: PublicKey;
  round_id: number;
  amount: number;
}

export interface ReferrerForUserEvent {
  user: PublicKey;
  referrer: PublicKey;
  code_hash: number[];
}

export interface ReferrerProfitViewEvent {
  referrer: PublicKey;
  round_id: number;
  amount: number;
}

export interface ReferrerSettingsViewEvent {
  referrer: PublicKey;
  percentage_bps: number;
  custom_limit: number;
}

export interface RegistrationStatsViewEvent {
  code_hash: number[];
  day: number;
  count: number;
}

export interface RoundTotalProfitViewEvent {
  round_id: number;
  total_amount: number;
}

export type WatcherEvent =  | { discriminator: [168, 129, 145, 65, 168, 45, 68, 14]; data: ProfitUpdatedEvent }
  | { discriminator: [165, 15, 185, 73, 134, 218, 84, 78]; data: ProfitWithdrawnEvent }
  | { discriminator: [186, 121, 215, 89, 142, 238, 123, 52]; data: ReferrerForUserEvent }
  | { discriminator: [198, 218, 119, 140, 160, 238, 200, 141]; data: ReferrerProfitViewEvent }
  | { discriminator: [130, 13, 56, 133, 66, 148, 232, 89]; data: ReferrerSettingsViewEvent }
  | { discriminator: [8, 210, 73, 59, 179, 48, 151, 5]; data: RegistrationStatsViewEvent }
  | { discriminator: [4, 125, 224, 21, 245, 59, 62, 3]; data: RoundTotalProfitViewEvent };

export function getWatcherEventName(discriminator: number[]): string | null {
  const discStr = discriminator.join(',');
  if (discStr === '168,129,145,65,168,45,68,14') return 'ProfitUpdated';
  if (discStr === '165,15,185,73,134,218,84,78') return 'ProfitWithdrawn';
  if (discStr === '186,121,215,89,142,238,123,52') return 'ReferrerForUser';
  if (discStr === '198,218,119,140,160,238,200,141') return 'ReferrerProfitView';
  if (discStr === '130,13,56,133,66,148,232,89') return 'ReferrerSettingsView';
  if (discStr === '8,210,73,59,179,48,151,5') return 'RegistrationStatsView';
  if (discStr === '4,125,224,21,245,59,62,3') return 'RoundTotalProfitView';
  return null;
}

// Helius Webhook Payload Types

export interface HeliusWebhookTransaction {
  signature: string;
  timestamp: number;
  slot: number;
  type: 'enhanced' | 'raw';
  accountData?: unknown[];
  nativeTransfers?: unknown[];
  tokenTransfers?: unknown[];
  events?: {
    [programId: string]: unknown[];
  };
}

export interface HeliusWebhookPayload {
  webhookID: string;
  webhookType: string;
  transactions: HeliusWebhookTransaction[];
}

// Program IDs
export const LOTTERY_PROGRAM_ID = 'AHw5KYiCeU2Bj2KvQR6YcCAcQcqusp58mz3MRyiT61M9' as const;
export const WATCHER_PROGRAM_ID = 'j9RyfMTz4dc9twnFCUZLJzMmhacUqTFHQkCXr7uDpQf' as const;

// Event decoder helper
export function decodeEvent(
  programId: string,
  discriminator: number[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _data: Buffer
): LotteryEvent | WatcherEvent | null {
  if (programId === LOTTERY_PROGRAM_ID) {
    const eventName = getLotteryEventName(discriminator);
    if (!eventName) return null;
    // TODO: Implement actual decoding using Anchor or borsh
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { discriminator, data: {} as any };
  }
  if (programId === WATCHER_PROGRAM_ID) {
    const eventName = getWatcherEventName(discriminator);
    if (!eventName) return null;
    // TODO: Implement actual decoding using Anchor or borsh
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { discriminator, data: {} as any };
  }
  return null;
}
