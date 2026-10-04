import {
  EncryptedDirectMessage,
  Metadata,
  PrivateDirectMessage,
  Seal,
} from "nostr-tools/kinds";
import {
  decrypt as nip04Decrypt,
  encrypt as nip04Encrypt,
} from "nostr-tools/nip04";
import { type WindowNostr } from "nostr-tools/nip07";
import { decode, npubEncode, nsecEncode } from "nostr-tools/nip19";
import {
  getConversationKey,
  decrypt as nip44Decrypt,
  encrypt as nip44Encrypt,
} from "nostr-tools/nip44";
import { createWrap } from "nostr-tools/nip59";
import {
  type Event,
  finalizeEvent,
  generateSecretKey,
  getEventHash,
  getPublicKey,
  type UnsignedEvent,
  verifyEvent,
} from "nostr-tools/pure";
import { bytesToHex, hexToBytes } from "nostr-tools/utils";
import {
  BASE_NIP05_URL,
  GROUP_TIME_GAP_IN_SECONDS,
  MAX_GIFT_WRAP_AGE_IN_SECONDS,
  MIN_DUPLICATE_SPAM_LENGTH,
  PRIVATE_KEY_IDB_NAME,
  TIME_FORMAT,
  USE_EXTENSION_IDB_NAME,
} from "components/apps/Messenger/constants";
import {
  type ChatMessages,
  type DirectMessage,
  type Nip05Json,
  type NostrProfile,
  type ProfileData,
  type RelayStatus,
  type Signer,
} from "components/apps/Messenger/types";
import { type MenuItem } from "contexts/menu/useMenuContextState";
import { MILLISECONDS_IN_DAY, MILLISECONDS_IN_SECOND } from "utils/constants";
import { toSorted, writeTextToClipboard } from "utils/functions";

const HEX_KEY = /^[\da-f]{64}$/i;

export const NIP05_ADDRESS = /^(?:[\w.+-]+@)?[\w-]+(?:\.[\w-]+)+$/;

const isHexKey = (key: string): boolean => HEX_KEY.test(key);

export const getUnixTime = (): number =>
  Math.floor(Date.now() / MILLISECONDS_IN_SECOND);

const parseSecretKey = (key: string): Uint8Array | undefined => {
  const trimmedKey = key.trim();

  if (isHexKey(trimmedKey)) return hexToBytes(trimmedKey);

  try {
    const { data, type } = decode(trimmedKey);

    return type === "nsec" ? data : undefined;
  } catch {
    return undefined;
  }
};

const localSigner = (secretKey: Uint8Array): Signer => ({
  decrypt: (pubkey, payload, legacy) =>
    Promise.resolve(
      legacy
        ? nip04Decrypt(secretKey, pubkey, payload)
        : nip44Decrypt(payload, getConversationKey(secretKey, pubkey))
    ),
  encrypt: (pubkey, plaintext, legacy) =>
    Promise.resolve(
      legacy
        ? nip04Encrypt(secretKey, pubkey, plaintext)
        : nip44Encrypt(plaintext, getConversationKey(secretKey, pubkey))
    ),
  publicKey: getPublicKey(secretKey),
  secretKey,
  signEvent: (event) => Promise.resolve(finalizeEvent(event, secretKey)),
});

const extensionSigner = (nostr: WindowNostr, publicKey: string): Signer => {
  const cipher = (
    legacy?: boolean
  ): NonNullable<WindowNostr["nip44"]> | undefined =>
    legacy ? nostr.nip04 : nostr.nip44;

  return {
    decrypt: async (pubkey, payload, legacy) => {
      const nip = cipher(legacy);

      if (!nip) throw new Error("Unsupported by extension");

      return nip.decrypt(pubkey, payload);
    },
    encrypt: async (pubkey, plaintext, legacy) => {
      const nip = cipher(legacy);

      if (!nip) throw new Error("Unsupported by extension");

      return nip.encrypt(pubkey, plaintext);
    },
    publicKey,
    signEvent: (event) => nostr.signEvent(event),
  };
};

const saveSecretKey = (secretKey: Uint8Array): Signer => {
  localStorage.setItem(PRIVATE_KEY_IDB_NAME, bytesToHex(secretKey));

  return localSigner(secretKey);
};

export const importSecretKey = (key: string): Signer | undefined => {
  const secretKey = parseSecretKey(key);

  return secretKey ? saveSecretKey(secretKey) : undefined;
};

export const getSigner = async (): Promise<Signer> => {
  if (localStorage.getItem(USE_EXTENSION_IDB_NAME) && window.nostr) {
    try {
      return extensionSigner(window.nostr, await window.nostr.getPublicKey());
    } catch {
      localStorage.removeItem(USE_EXTENSION_IDB_NAME);
    }
  }

  return saveSecretKey(
    parseSecretKey(localStorage.getItem(PRIVATE_KEY_IDB_NAME) || "") ||
      generateSecretKey()
  );
};

export const decodePublicKey = (address: string): string => {
  const key = address.trim().replace(/^nostr:/, "");

  if (isHexKey(key)) return key.toLowerCase();

  try {
    const { data, type } = decode(key);

    if (type === "npub") return data;
    if (type === "nprofile") return data.pubkey;
  } catch {
    // Not a NIP-19 address
  }

  return "";
};

export const shortNpub = (publicKey: string): string => {
  const npub = npubEncode(publicKey);

  return `${npub.slice(0, 10)}…${npub.slice(-4)}`;
};

export const fetchNip05Json = async (url: string): Promise<Nip05Json> => {
  try {
    const response = await fetch(url);

    return response.ok ? ((await response.json()) as Nip05Json) : {};
  } catch {
    return {};
  }
};

const nip05Lookups: Record<string, Promise<string>> = {};

const lookupNip05 = (address: string): Promise<string> => {
  if (!NIP05_ADDRESS.test(address)) return Promise.resolve("");

  const [name, domain] = address.includes("@")
    ? address.split("@")
    : ["_", address];

  nip05Lookups[address] ||= fetchNip05Json(
    `https://${domain}${BASE_NIP05_URL}?name=${encodeURIComponent(name)}`
  ).then(({ names = {} }) => {
    const [, key = ""] =
      Object.entries(names).find(
        ([userName]) => userName.toLowerCase() === name.toLowerCase()
      ) || [];

    return isHexKey(key) ? key.toLowerCase() : "";
  });

  return nip05Lookups[address];
};

export const getNip05Domain = async (
  nip05?: string,
  pubkey?: string
): Promise<string> =>
  nip05 && pubkey && (await lookupNip05(nip05)) === pubkey
    ? nip05.split("@").pop() || ""
    : "";

export const resolveAddress = async (
  address: string,
  knownKeys: string[]
): Promise<string> => {
  const input = address.trim();
  const publicKey = decodePublicKey(input);

  if (publicKey) return publicKey;
  if (NIP05_ADDRESS.test(input)) return lookupNip05(input);

  // Contacts without a name are shown as a shortened npub
  const [, prefix = "", suffix = ""] =
    /^(npub1\w{5,})(?:(?:…|\.{3})(\w+))?$/.exec(input) || [];
  const matches = prefix
    ? knownKeys.filter((key) => {
        const npub = npubEncode(key);

        return npub.startsWith(prefix) && npub.endsWith(suffix);
      })
    : [];

  return matches.length === 1 ? matches[0] : "";
};

const getKeyFromTags = (tags: string[][] = []): string => {
  const [, key = ""] = tags.find(([tag]) => tag === "p") || [];

  return key;
};

export const getContactKey = (
  { pubkey, recipient }: DirectMessage,
  publicKey: string
): string => (pubkey === publicKey ? recipient : pubkey);

const LINK = /https?:\/\/|www\.|nostr:|\b(?:naddr|nevent|note|nprofile|npub)1/i;

const normalizeText = (content: string): string => content.trim().toLowerCase();

export const findSpamKeys = (
  strangerMessages: DirectMessage[]
): Set<string> => {
  const sendersByText: Record<string, Set<string>> = {};

  strangerMessages.forEach(({ content, pubkey }) => {
    const text = normalizeText(content);

    if (text.length >= MIN_DUPLICATE_SPAM_LENGTH) {
      (sendersByText[text] ||= new Set()).add(pubkey);
    }
  });

  return new Set(
    strangerMessages
      .filter(
        ({ content }) =>
          LINK.test(content) ||
          (sendersByText[normalizeText(content)]?.size ?? 0) > 1
      )
      .map(({ pubkey }) => pubkey)
  );
};

const createGiftWrap = async (
  signer: Signer,
  rumor: UnsignedEvent & { id: string },
  recipient: string
): Promise<Event> =>
  createWrap(
    await signer.signEvent({
      content: await signer.encrypt(recipient, JSON.stringify(rumor)),
      created_at:
        getUnixTime() -
        Math.floor(Math.random() * MAX_GIFT_WRAP_AGE_IN_SECONDS),
      kind: Seal,
      tags: [],
    }),
    recipient
  );

export const createMessage = async (
  signer: Signer,
  recipient: string,
  content: string,
  legacy = false
): Promise<{
  message: DirectMessage;
  recipientEvent: Event;
  selfEvent?: Event;
}> => {
  const { publicKey } = signer;
  const created_at = getUnixTime();
  const tags = [["p", recipient]];

  if (legacy) {
    const event = await signer.signEvent({
      content: await signer.encrypt(recipient, content, true),
      created_at,
      kind: EncryptedDirectMessage,
      tags,
    });

    return {
      message: {
        content,
        created_at,
        id: event.id,
        legacy,
        pubkey: publicKey,
        recipient,
      },
      recipientEvent: event,
    };
  }

  const rumor = {
    content,
    created_at,
    kind: PrivateDirectMessage,
    pubkey: publicKey,
    tags,
  };
  const sealedRumor = { ...rumor, id: getEventHash(rumor) };

  return {
    message: {
      content,
      created_at,
      id: sealedRumor.id,
      pubkey: publicKey,
      recipient,
    },
    recipientEvent: await createGiftWrap(signer, sealedRumor, recipient),
    selfEvent:
      recipient === publicKey
        ? undefined
        : await createGiftWrap(signer, sealedRumor, publicKey),
  };
};

export const unwrapMessage = async (
  signer: Signer,
  event: Event
): Promise<DirectMessage | undefined> => {
  const { publicKey } = signer;

  try {
    if (event.kind === EncryptedDirectMessage) {
      const recipient = getKeyFromTags(event.tags);

      return {
        content: await signer.decrypt(
          event.pubkey === publicKey ? recipient : event.pubkey,
          event.content,
          true
        ),
        created_at: event.created_at,
        id: event.id,
        legacy: true,
        pubkey: event.pubkey,
        recipient,
      };
    }

    const seal = JSON.parse(
      await signer.decrypt(event.pubkey, event.content)
    ) as Event;

    if (seal.kind !== Seal || !verifyEvent(seal)) return undefined;

    const rumor = JSON.parse(
      await signer.decrypt(seal.pubkey, seal.content)
    ) as Event;
    const recipients = rumor.tags.filter(([tag]) => tag === "p");
    const [[, recipient = ""] = []] = recipients;

    // Without these checks anyone could impersonate any sender
    if (
      rumor.kind !== PrivateDirectMessage ||
      rumor.pubkey !== seal.pubkey ||
      rumor.id !== getEventHash(rumor) ||
      recipients.length !== 1 ||
      (rumor.pubkey !== publicKey && recipient !== publicKey)
    ) {
      return undefined;
    }

    return {
      content: rumor.content,
      created_at: rumor.created_at,
      id: rumor.id,
      pubkey: rumor.pubkey,
      recipient,
    };
  } catch {
    return undefined;
  }
};

export const descCreatedAt = (
  a: Pick<DirectMessage, "created_at">,
  b: Pick<DirectMessage, "created_at">
): number => b.created_at - a.created_at;

export const shortTimeStamp = (timestamp: number): string => {
  const now = Date.now();
  const time = new Date(timestamp * MILLISECONDS_IN_SECOND).getTime();
  const diff = now - time;
  const seconds = Math.floor(diff / MILLISECONDS_IN_SECOND);
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

export const copyKeyMenuItems = (
  hexKey: string,
  secretKey?: Uint8Array
): MenuItem[] => [
  {
    action: () => writeTextToClipboard(npubEncode(hexKey)),
    label: "Copy npub address",
  },
  secretKey
    ? {
        action: () => writeTextToClipboard(nsecEncode(secretKey)),
        label: "Copy nsec address",
      }
    : {
        action: () => writeTextToClipboard(hexKey),
        label: "Copy hex address",
      },
];

export const createProfileEvent = (
  signer: Signer,
  profile: ProfileData
): Promise<Event> =>
  signer.signEvent({
    content: JSON.stringify(profile),
    created_at: getUnixTime(),
    kind: Metadata,
    tags: [],
  });

const VALID_PICTURE_PROTOCOLS = new Set(["http", "https", "data"]);

export const dataToProfile = (
  publicKey: string,
  data?: ProfileData,
  created_at?: number
): NostrProfile => {
  const {
    about,
    banner,
    display_name,
    name,
    nip05,
    picture,
    username,
    website,
  } = data || {};
  const [protocol = ""] = picture?.split(":") || [];

  return {
    about,
    banner,
    created_at,
    data,
    nip05,
    npub: npubEncode(publicKey),
    picture: VALID_PICTURE_PROTOCOLS.has(protocol) ? picture : undefined,
    userName: display_name || name || username || shortNpub(publicKey),
    website,
  };
};

export const getWebSocketStatusIcon = (status?: RelayStatus): string => {
  switch (status) {
    case "connected":
      return "🟢";
    case "connecting":
      return "🟡";
    default:
      return "🔴";
  }
};

export const convertImageLinksToHtml = (content: string): string =>
  content.replace(
    /https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp)/gi,
    (match) =>
      `<img alt="Shared image" decoding="async" loading="lazy" src="${match}" />`
  );

export const convertNewLinesToBreaks = (content: string): string =>
  content.replace(/\n/g, "<br />");

export const prettyChatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * MILLISECONDS_IN_SECOND);
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  ).getTime();
  const dateTimestamp = date.getTime();
  const datePretty = date.toLocaleString("en-US", TIME_FORMAT);

  if (dateTimestamp > today) return datePretty;
  if (dateTimestamp > yesterday) return `Yesterday at ${datePretty}`;
  if (dateTimestamp > today - 6 * MILLISECONDS_IN_DAY) {
    return date.toLocaleString("en-US", {
      ...TIME_FORMAT,
      weekday: "long",
    });
  }

  return date.toLocaleString("en-US", {
    ...TIME_FORMAT,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const groupMessages = (messages: DirectMessage[]): ChatMessages => {
  if (messages.length === 0) return [];

  const [oldestMessage, ...remainingMessages] = toSorted(messages, (a, b) =>
    descCreatedAt(b, a)
  );
  const groupedMessages: ChatMessages = [
    [prettyChatTimestamp(oldestMessage.created_at), [oldestMessage]],
  ];

  remainingMessages.forEach((message) => {
    const { created_at } = message;
    const [, lastGroup] = groupedMessages[groupedMessages.length - 1];
    const { created_at: last_created_at } = lastGroup[lastGroup.length - 1];

    if (Math.abs(created_at - last_created_at) < GROUP_TIME_GAP_IN_SECONDS) {
      lastGroup.push(message);
    } else {
      groupedMessages.push([prettyChatTimestamp(created_at), [message]]);
    }
  });

  return groupedMessages;
};
