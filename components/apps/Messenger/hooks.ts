import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line import/consistent-type-specifier-style
import type { NIP05Result } from "nostr-tools/lib/types/nip05";
import {
  type Filter,
  type Event as NostrEvent,
  type Relay,
  type Sub,
} from "nostr-tools";
import { useHistoryContext } from "components/apps/Messenger/HistoryContext";
import { useMessageContext } from "components/apps/Messenger/MessageContext";
import { useNostr } from "components/apps/Messenger/NostrContext";
import {
  BASE_NIP05_URL,
  METADATA_KIND,
  NOTIFICATION_SOUND,
  SEEN_EVENTS_DEBOUNCE_MS,
} from "components/apps/Messenger/constants";
import {
  dataToProfile,
  descCreatedAt,
  getKeyFromTags,
  getNip05Domain,
  getPublicHexKey,
  maybeGetExistingPublicKey,
  toHexKey,
} from "components/apps/Messenger/functions";
import {
  type Metadata,
  type NostrContacts,
  type NostrProfile,
} from "components/apps/Messenger/types";
import { useProcesses } from "contexts/process";
import directory from "contexts/process/directory";
import { PACKAGE_DATA, PROCESS_DELIMITER } from "utils/constants";

export const useNostrEvents = ({
  enabled = true,
  filter,
  onEvent,
}: {
  enabled?: boolean;
  filter: Filter[];
  onEvent?: (event: NostrEvent) => void;
}): NostrEvent[] => {
  const { connectedRelays } = useNostr();
  const [events, setEvents] = useState<NostrEvent[]>([]);
  const seenEventIds = useRef<Record<string, NostrEvent>>({});
  const filterString = useMemo(() => JSON.stringify(filter), [filter]);
  const seenDebounceTimer = useRef(0);
  const subscribe = useCallback(
    (relay: Relay, subFilter: Filter[]): Sub => {
      const sub = relay.sub(subFilter);

      sub.on("event", (event: NostrEvent) => {
        if (seenEventIds.current[event.id]) return;

        seenEventIds.current[event.id] = event;

        onEvent?.(event);

        if (seenDebounceTimer.current) {
          window.clearTimeout(seenDebounceTimer.current);
        }

        seenDebounceTimer.current = window.setTimeout(
          () => {
            seenDebounceTimer.current = 0;

            setEvents((currentEvents) =>
              currentEvents.some(({ id }) => id === event.id)
                ? currentEvents
                : Object.values(seenEventIds.current)
            );
          },
          seenDebounceTimer.current ? SEEN_EVENTS_DEBOUNCE_MS : 0
        );
      });

      return sub;
    },
    [onEvent]
  );

  useEffect(() => {
    if (!enabled) return;

    const relaySubs = connectedRelays.map((relay) => ({
      relay,
      sub: subscribe(relay, JSON.parse(filterString) as Filter[]),
    }));

    // eslint-disable-next-line consistent-return
    return () => relaySubs.forEach(({ sub }) => sub.unsub());
  }, [connectedRelays, enabled, filterString, subscribe]);

  return events;
};

export const useNip05 = (): NIP05Result => {
  const [nip05, setNip05] = useState<NIP05Result>();
  const updateNip05 = useCallback(async (url: string): Promise<boolean> => {
    const nostrJson = await fetch(url);

    if (nostrJson.ok) {
      const { names = {} } = ((await nostrJson.json()) as NIP05Result) || {};

      setNip05({ names });
    }

    return nostrJson.ok;
  }, []);
  const fetchNip05Json = useCallback(async (): Promise<void> => {
    if (!(await updateNip05(BASE_NIP05_URL))) {
      setNip05({ relays: {} } as NIP05Result);
    }
  }, [updateNip05]);

  useEffect(() => {
    if (!nip05) fetchNip05Json();
  }, [fetchNip05Json, nip05]);

  return nip05 || ({} as NIP05Result);
};

export const useNostrContacts = (
  publicKey: string,
  wellKnownNames: Record<string, string>
): NostrContacts => {
  const globalContacts = useMemo(
    () =>
      [
        ...(PACKAGE_DATA?.author?.npub
          ? new Set([
              toHexKey(PACKAGE_DATA.author.npub),
              ...Object.values(wellKnownNames || {}),
            ])
          : Object.values(wellKnownNames || {})),
      ]
        .filter(Boolean)
        .map((key) => toHexKey(key)),
    [wellKnownNames]
  );
  const { events } = useMessageContext();
  const contactKeys = useMemo(() => {
    const keys = new Set(
      events
        .sort(descCreatedAt)
        .map(({ pubkey, tags }) =>
          pubkey === publicKey ? getKeyFromTags(tags) || "" : pubkey
        )
        .filter((pubkey) => !globalContacts.includes(pubkey))
    );

    return [...globalContacts, ...keys].filter((key) => key !== publicKey);
  }, [events, globalContacts, publicKey]);
  const lastEvents = useMemo(
    () =>
      Object.fromEntries(
        contactKeys.map((pubkey) => [
          pubkey,
          events
            .filter((event) =>
              [event.pubkey, getKeyFromTags(event.tags)].includes(pubkey)
            )
            .sort(descCreatedAt)[0],
        ])
      ),
    [contactKeys, events]
  );
  const { seenEventIds } = useHistoryContext();
  const unreadEvents = useMemo(
    () =>
      events.filter(
        ({ id, pubkey }) => pubkey !== publicKey && !seenEventIds.includes(id)
      ),
    [events, publicKey, seenEventIds]
  );

  return { contactKeys, events, lastEvents, unreadEvents };
};

export const usePublicKey = (): string => {
  const [publicKey, setPublicKey] = useState<string>("");
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    maybeGetExistingPublicKey().then(getPublicHexKey).then(setPublicKey);
  }, []);

  return publicKey;
};

export const useUnreadStatus = (id: string, unreadCount: number): void => {
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);
  const { title } = useProcesses();
  const [pid] = id.split(PROCESS_DELIMITER);

  useEffect(() => {
    title(
      pid,
      `${directory[pid]?.title}${unreadCount > 0 ? ` (${unreadCount})` : ""}`
    );
  }, [pid, title, unreadCount]);

  useEffect(() => {
    if (unreadCount > currentUnreadCount) {
      new Audio(NOTIFICATION_SOUND).play();
    }

    setCurrentUnreadCount(unreadCount);
  }, [currentUnreadCount, unreadCount]);
};

export const useNip05Domain = (nip05?: string, publicKey?: string): string => {
  const [nip05Domain, setNip05Domain] = useState("");

  useEffect(() => {
    getNip05Domain(nip05, publicKey).then(setNip05Domain);
  }, [nip05, publicKey]);

  return nip05Domain;
};

export const useNostrProfile = (
  publicKey: string,
  isVisible = true
): NostrProfile => {
  const { profiles, setProfiles } = useHistoryContext();
  const onEvent = useCallback(
    ({ content, created_at, pubkey }: NostrEvent) => {
      if (
        !publicKey ||
        publicKey !== pubkey ||
        (profiles?.[publicKey]?.created_at as number) >= created_at
      ) {
        return;
      }

      try {
        const metadata = JSON.parse(content) as Metadata;

        if (metadata) {
          setProfiles((currentProfiles) => ({
            ...currentProfiles,
            [publicKey]: dataToProfile(publicKey, metadata, created_at),
          }));
        }
      } catch {
        // Ignore errors parsing profile data
      }
    },
    [profiles, publicKey, setProfiles]
  );
  const profileFilter = useMemo(
    () => ({
      enabled: !!publicKey && isVisible,
      filter: [
        {
          authors: [publicKey],
          kinds: [METADATA_KIND],
        },
      ],
      onEvent,
    }),
    [isVisible, onEvent, publicKey]
  );

  useNostrEvents(profileFilter);

  return publicKey ? profiles[publicKey] || dataToProfile(publicKey) : {};
};
