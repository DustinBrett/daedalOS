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

export type Message = {
  content: string;
  created_at: number;
  id: string;
  pubkey: string;
  sent?: boolean;
};

export type Messages = Message[];

export type NostrEvents = {
  enabled: boolean;
  filter: Filter;
};

export type NostrContacts = {
  contactKeys: string[];
  events: Event[];
  lastEvents: Record<string, Event>;
};

export type NostrProfile = {
  about?: string;
  banner?: string;
  picture?: string;
  userName?: string;
  website?: string;
};
