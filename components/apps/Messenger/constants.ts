import {
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_SECOND,
} from "utils/constants";

export const BASE_RW_RELAYS = [
  "wss://ca.relayable.org",
  "wss://la.relayable.org",
  "wss://au.relayable.org",
  "wss://he.relayable.org",
  "wss://relay.damus.io",
  "wss://nos.lol",
];

export const DM_KIND = 4;

export const PRIVATE_KEY_IDB_NAME = "nostr_private_key";
export const PUBLIC_KEY_IDB_NAME = "nostr_public_key";

export const NOTIFICATION_SOUND = "/Program Files/Messenger/notification.mp3";

export const UNKNOWN_PUBLIC_KEY = "?";

export const BASE_NIP05_URL = "/.well-known/nostr.json";

export const GROUP_TIME_GAP_IN_SECONDS =
  (MILLISECONDS_IN_MINUTE / MILLISECONDS_IN_SECOND) * 30;

export const TIME_FORMAT: Partial<Intl.DateTimeFormatOptions> = {
  hour: "numeric",
  hour12: true,
  minute: "numeric",
};
