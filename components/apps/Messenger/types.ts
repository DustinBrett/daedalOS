import { type WindowNostr } from "nostr-tools/nip07";
import { type EventTemplate, type VerifiedEvent } from "nostr-tools/pure";

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}

export type Signer = {
  decrypt: (
    pubkey: string,
    payload: string,
    legacy?: boolean
  ) => Promise<string>;
  encrypt: (
    pubkey: string,
    plaintext: string,
    legacy?: boolean
  ) => Promise<string>;
  publicKey: string;
  secretKey?: Uint8Array;
  signEvent: (event: EventTemplate) => Promise<VerifiedEvent>;
};

export type RelayStatus = "connected" | "connecting";

export type DirectMessage = {
  content: string;
  created_at: number;
  id: string;
  legacy?: boolean;
  pubkey: string;
  recipient: string;
  status?: "failed" | "sending";
};

export type NostrContacts = {
  chatKeys: string[];
  lastMessages: Record<string, DirectMessage>;
  requestKeys: string[];
  spamKeys: string[];
  unreadMessages: DirectMessage[];
};

export type Nip05Json = {
  names?: Record<string, string>;
  relays?: Record<string, string[]>;
};

export type ProfileData = {
  about?: string;
  banner?: string;
  display_name?: string;
  name?: string;
  nip05?: string;
  picture?: string;
  username?: string;
  website?: string;
};

export type NostrProfile = {
  about?: string;
  banner?: string;
  created_at?: number;
  data?: ProfileData;
  nip05?: string;
  npub?: string;
  picture?: string;
  userName?: string;
  website?: string;
};

export type ChatMessages = [string, DirectMessage[]][];
