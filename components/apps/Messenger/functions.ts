import {
  nip19,
  nip04,
  generatePrivateKey,
  getPublicKey,
  getEventHash,
  getSignature,
} from "nostr-tools";
import type { Event } from "nostr-tools";
import type { Messages, NostrEvents } from "components/apps/Messenger/types";
import {
  BASE_RW_RELAYS,
  DM_KIND,
  PRIVATE_KEY_IDB_NAME,
  PUBLIC_KEY_IDB_NAME,
} from "components/apps/Messenger/constants";
import { MILLISECONDS_IN_SECOND } from "utils/constants";
import { dateToUnix } from "nostr-react";

export const getRelayUrls = async (): Promise<string[]> =>
  window.nostr?.getRelays
    ? [
        ...new Set([
          ...BASE_RW_RELAYS,
          ...Object.entries(await window.nostr.getRelays())
            .filter(([, { read, write }]) => read && write)
            .map(([url]) => url),
        ]),
      ]
    : BASE_RW_RELAYS;

export const toHexKey = (key: string): string => {
  if (key.startsWith("npub") || key.startsWith("nsec")) {
    const { data } = nip19.decode(key);

    if (typeof data === "string") return data;
  }

  return key;
};

const getPrivateKey = (): string =>
  localStorage.getItem(PRIVATE_KEY_IDB_NAME) || "";

export const maybeGetExistingPublicKey = async (): Promise<string> =>
  (await window.nostr?.getPublicKey()) ||
  localStorage.getItem(PUBLIC_KEY_IDB_NAME) ||
  "";

export const getKeyFromTags = (tags: string[][] = []): string => {
  const [, key = ""] = tags.find(([tag]) => tag === "p") || [];

  return key;
};

export const processMessages = (
  events: Event[],
  messages: Messages,
  publicKey: string
): Messages => {
  const messageIds = new Set(messages.map(({ id }) => id));
  const newMessages = events
    .filter(({ id }) => !messageIds.has(id))
    .map(({ content, created_at, id, pubkey, tags }) => ({
      content,
      created_at,
      id,
      pubkey: pubkey === publicKey ? getKeyFromTags(tags) || "" : pubkey,
      sent: pubkey === publicKey,
    }));

  return newMessages.length > 0 ? [...messages, ...newMessages] : messages;
};

export const decryptMessage = async (
  content: string,
  pubkey: string
): Promise<string> => {
  try {
    return await (window.nostr?.nip04
      ? window.nostr.nip04.decrypt(pubkey, content)
      : nip04.decrypt(toHexKey(getPrivateKey()), pubkey, content));
  } catch {
    // Ignore failure to decrypt
  }

  return "";
};

export const encryptMessage = async (
  content: string,
  pubkey: string
): Promise<string> => {
  try {
    return await (window.nostr?.nip04
      ? window.nostr.nip04.encrypt(pubkey, content)
      : nip04.encrypt(toHexKey(getPrivateKey()), pubkey, content));
  } catch {
    // Ignore failure to decrypt
  }

  return "";
};

export const getReceivedMessages = (publicKey?: string): NostrEvents => ({
  enabled: !!publicKey,
  filter: {
    "#p": publicKey ? [publicKey] : [],
    kinds: [DM_KIND],
  },
});

export const getSentMessages = (publicKey?: string): NostrEvents => ({
  enabled: !!publicKey,
  filter: {
    authors: publicKey ? [publicKey] : [],
    kinds: [DM_KIND],
  },
});

export const getPublicHexKey = (existingPublicKey?: string): string => {
  if (existingPublicKey) return toHexKey(existingPublicKey);

  const newPrivateKey = generatePrivateKey();
  const newPublicKey = getPublicKey(newPrivateKey);

  localStorage.setItem(PUBLIC_KEY_IDB_NAME, newPublicKey);
  localStorage.setItem(PRIVATE_KEY_IDB_NAME, newPrivateKey);

  return toHexKey(newPublicKey);
};

export const descCreatedAt = (a: Event, b: Event): number =>
  b.created_at - a.created_at;

export const shortTimeStamp = (timestamp: number): string => {
  const now = Date.now();
  const time = new Date(timestamp * MILLISECONDS_IN_SECOND).getTime();
  const diff = now - time;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks}w`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  if (seconds < 10) return "now";

  return `${seconds}s`;
};

export const createMessageEvent = async (
  message: string,
  publicKey: string,
  recipientPublicKey: string
): Promise<Event> => {
  let event = {
    content: await encryptMessage(message, recipientPublicKey),
    created_at: dateToUnix(),
    kind: DM_KIND,
    pubkey: publicKey,
    tags: [["p", recipientPublicKey]],
  } as Event;

  event.id = getEventHash(event);

  if (window.nostr?.signEvent) {
    event = await window.nostr.signEvent(event);
  } else {
    event.sig = getSignature(event, publicKey);
  }

  return event;
};
