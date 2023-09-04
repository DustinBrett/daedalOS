import { nip19, nip04, generatePrivateKey, getPublicKey } from "nostr-tools";
import type { Event } from "nostr-tools";
import type {
  Messages,
  Message,
  NostrEvents,
} from "components/apps/Messenger/types";
import {
  BASE_RW_RELAYS,
  MESSAGE_KIND,
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
    /* eslint-disable camelcase */
    .map(({ content, created_at, id, pubkey, tags }) => ({
      content,
      created_at,
      id,
      pubkey:
        pubkey === publicKey
          ? tags?.find(([type]) => type === "p")?.[1] || ""
          : pubkey,
      sent: pubkey === publicKey,
    }));
  /* eslint-enable camelcase */

  return newMessages.length > 0 ? [...messages, ...newMessages] : messages;
};

export const decryptMessage = async (message: Message): Promise<string> => {
  const { content, pubkey } = message;

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
    ...MESSAGE_KIND,
  },
});

export const getSentMessages = (publicKey?: string): NostrEvents => ({
  enabled: !!publicKey,
  filter: {
    authors: publicKey ? [publicKey] : [],
    ...MESSAGE_KIND,
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
