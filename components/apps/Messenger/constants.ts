import { type MotionProps } from "motion/react";
import {
  HOME,
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_SECOND,
} from "utils/constants";

export const BASE_RW_RELAYS = [
  "wss://nos.lol",
  "wss://nostr.mom",
  "wss://public.relaying.io",
  "wss://relay1.nostrchat.io",
  "wss://relayable.org",
];

export const METADATA_KIND = 0;
export const DM_KIND = 4;

export const PRIVATE_KEY_IDB_NAME = "nostr_private_key";
export const PUBLIC_KEY_IDB_NAME = "nostr_public_key";

export const NOTIFICATION_SOUND = "/Program Files/Messenger/notification.mp3";

export const UNKNOWN_PUBLIC_KEY = "?";

export const BASE_NIP05_URL = "/.well-known/nostr.json";

export const SEEN_EVENT_IDS_PATH = `${HOME}/seenEvents.json`;

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

export const SEEN_EVENTS_DEBOUNCE_MS = 16; // 60 FPS == Math.floor(1000 / 60)
