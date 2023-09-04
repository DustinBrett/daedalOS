import { nip19, nip04, generatePrivateKey, getPublicKey } from "nostr-tools";
import type { Event } from "nostr-tools";
import type { Messages, NostrEvents } from "components/apps/Messenger/types";
import {
  BASE_RW_RELAYS,
  DM_EVENTS,
  PRIVATE_KEY_IDB_NAME,
  PUBLIC_KEY_IDB_NAME,
} from "components/apps/Messenger/constants";

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
      pubkey:
        pubkey === publicKey
          ? tags?.find(([tag]) => tag === "p")?.[1] || ""
          : pubkey,
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

export const getReceivedMessages = (publicKey?: string): NostrEvents => ({
  enabled: !!publicKey,
  filter: {
    "#p": publicKey ? [publicKey] : [],
    ...DM_EVENTS,
  },
});

export const getSentMessages = (publicKey?: string): NostrEvents => ({
  enabled: !!publicKey,
  filter: {
    authors: publicKey ? [publicKey] : [],
    ...DM_EVENTS,
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
