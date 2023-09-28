import { type Metadata } from "nostr-react";
import type { Event, Filter } from "nostr-tools";

type RelayPolicy = { read: boolean; write: boolean };

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      getRelays: () => Promise<Record<string, RelayPolicy>>;
      nip04: {
        decrypt: (publicKey: string, cipherText: string) => Promise<string>;
        encrypt: (publicKey: string, plainText: string) => Promise<string>;
      };
      signEvent: (event: Event) => Promise<Event>;
    };
  }
}

export type NostrEvents = {
  enabled: boolean;
  filter: Filter;
};

export type NostrContacts = {
  contactKeys: string[];
  events: Event[];
  lastEvents: Record<string, Event>;
  unreadEvents: Event[];
};

export type ProfileData = Metadata & { npub?: string };

export type NostrProfile = {
  about?: string;
  banner?: string;
  created_at?: number;
  data?: ProfileData;
  nip05?: string;
  picture?: string;
  userName?: string;
  website?: string;
};

export type ChatEvents = [string, Event[]][];

export type DecryptedContent = Record<string, string | false>;
