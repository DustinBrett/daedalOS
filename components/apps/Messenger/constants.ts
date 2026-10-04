import { type MotionProps } from "motion/react";
import {
  HOME,
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_SECOND,
} from "utils/constants";

export const BASE_RW_RELAYS = [
  "wss://nos.lol",
  "wss://nostr.mom",
  "wss://offchain.pub",
  "wss://relay.damus.io",
  "wss://relay.primal.net",
];

export const PRIVATE_KEY_IDB_NAME = "nostr_private_key";
export const USE_EXTENSION_IDB_NAME = "nostr_use_extension";
export const BLOCKED_KEYS_IDB_NAME = "nostr_blocked_keys";
export const DELETED_CHATS_IDB_NAME = "nostr_deleted_chats";

// Short greetings repeat naturally, longer identical messages are blasts
export const MIN_DUPLICATE_SPAM_LENGTH = 20;

export const MAX_SUGGESTIONS = 8;

export const NOTIFICATION_SOUND = "/Program Files/Messenger/notification.mp3";

export const UNKNOWN_PUBLIC_KEY = "?";

export const BASE_NIP05_URL = "/.well-known/nostr.json";

export const SEEN_EVENT_IDS_PATH = `${HOME}/seenEvents.json`;

// NIP-17 seals and gift wraps are backdated by up to two days
export const MAX_GIFT_WRAP_AGE_IN_SECONDS =
  (MILLISECONDS_IN_DAY * 2) / MILLISECONDS_IN_SECOND;

export const RELAY_TIMEOUT_MS = 5 * MILLISECONDS_IN_SECOND;

export const RECONNECT_DELAYS_MS = [5, 15, 30, 60].map(
  (seconds) => seconds * MILLISECONDS_IN_SECOND
);

export const GROUP_TIME_GAP_IN_SECONDS =
  (MILLISECONDS_IN_MINUTE / MILLISECONDS_IN_SECOND) * 30;

export const TIME_FORMAT: Partial<Intl.DateTimeFormatOptions> = {
  hour: "numeric",
  hour12: true,
  minute: "numeric",
};

const enterExitTransition = { bounce: 0, duration: 0.3, type: "spring" };

export const inLeftOutRight: MotionProps = {
  animate: { transform: "translateX(0%)" },
  exit: { transform: "translateX(100%)" },
  initial: { transform: "translateX(100%)" },
  ...enterExitTransition,
};

export const inRightOutLeft: MotionProps = {
  animate: { transform: "translateX(0%)" },
  exit: { transform: "translateX(-100%)" },
  initial: { transform: "translateX(-100%)" },
  ...enterExitTransition,
};

export const MESSAGES_DEBOUNCE_MS = 16; // 60 FPS == Math.floor(1000 / 60)
