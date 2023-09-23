import { useMessageContext } from "components/apps/Messenger/MessageContext";
import {
  BASE_NIP05_URL,
  NOTIFICATION_SOUND,
} from "components/apps/Messenger/constants";
import {
  descCreatedAt,
  getKeyFromTags,
  getNip05Domain,
  getPublicHexKey,
  maybeGetExistingPublicKey,
  toHexKey,
} from "components/apps/Messenger/functions";
import type { NostrContacts } from "components/apps/Messenger/types";
import { useProcesses } from "contexts/process";
import directory from "contexts/process/directory";
import type { NIP05Result } from "nostr-tools/lib/nip05";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PACKAGE_DATA, PROCESS_DELIMITER } from "utils/constants";

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
  wellKnownNames: Record<string, string>,
  loginTime: number,
  seenEventIds: string[]
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
  const unreadEvents = useMemo(
    () =>
      events.filter(
        ({ created_at, id, pubkey }) =>
          pubkey !== publicKey &&
          created_at > loginTime &&
          !seenEventIds.includes(id)
      ),
    [events, loginTime, publicKey, seenEventIds]
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
