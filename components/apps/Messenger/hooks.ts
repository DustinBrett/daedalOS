import { type Filter } from "nostr-tools/filter";
import { Contacts, Metadata } from "nostr-tools/kinds";
import { type Event } from "nostr-tools/pure";
import { type Relay } from "nostr-tools/relay";
import { useEffect, useRef, useState } from "react";
import {
  BASE_NIP05_URL,
  NOTIFICATION_SOUND,
} from "components/apps/Messenger/constants";
import {
  dataToProfile,
  decodePublicKey,
  descCreatedAt,
  fetchNip05Json,
  findSpamKeys,
  getContactKey,
  getNip05Domain,
} from "components/apps/Messenger/functions";
import { useHistoryContext } from "components/apps/Messenger/HistoryContext";
import { useMessageContext } from "components/apps/Messenger/MessageContext";
import { useNostr } from "components/apps/Messenger/NostrContext";
import {
  type DirectMessage,
  type NostrContacts,
  type NostrProfile,
  type ProfileData,
  type Signer,
} from "components/apps/Messenger/types";
import { useProcessesActions } from "contexts/process";
import directory from "contexts/process/directory";
import { PACKAGE_DATA, PROCESS_DELIMITER } from "utils/constants";
import { toSorted } from "utils/functions";

const subscribe = (
  relay: Relay,
  filters: Filter[],
  onevent: (event: Event) => void,
  signer: Signer
): (() => void) => {
  let closed = false;
  let subscription = relay.subscribe(filters, {
    onclose: (reason) => {
      // Relays may refuse DM queries until the NIP-42 AUTH they asked for
      if (!closed && reason.includes("auth-required")) {
        relay
          .auth(signer.signEvent)
          .then(() => {
            if (!closed) subscription = relay.subscribe(filters, { onevent });
          })
          // eslint-disable-next-line unicorn/no-useless-undefined
          .catch(() => undefined);
      }
    },
    onevent,
  });

  return () => {
    closed = true;
    subscription.close();
  };
};

export const useNostrEvents = ({
  enabled = true,
  filter,
  onEvent,
}: {
  enabled?: boolean;
  filter: Filter[];
  onEvent: (event: Event) => void;
}): void => {
  const { relays, signer } = useNostr();
  const filterString = JSON.stringify(filter);
  const onEventRef = useRef(onEvent);
  const subscriptions = useRef({
    closers: new Map<Relay, () => void>(),
    key: "",
    seenIds: new Set<string>(),
  });

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const { current } = subscriptions;
    const key = enabled ? filterString : "";

    if (current.key !== key) {
      current.closers.forEach((close) => close());
      current.closers.clear();
      current.key = key;
    }

    current.closers.forEach((close, relay) => {
      if (!relays.includes(relay)) {
        close();
        current.closers.delete(relay);
      }
    });

    if (!key) return;

    const filters = JSON.parse(key) as Filter[];

    relays.forEach((relay) => {
      if (current.closers.has(relay)) return;

      current.closers.set(
        relay,
        subscribe(
          relay,
          filters,
          (event) => {
            if (current.seenIds.has(event.id)) return;

            current.seenIds.add(event.id);
            onEventRef.current(event);
          },
          signer
        )
      );
    });
  }, [enabled, filterString, relays, signer]);

  useEffect(() => {
    const { current } = subscriptions;

    return () => {
      current.closers.forEach((close) => close());
      current.closers.clear();
      current.key = "";
    };
  }, []);
};

export const useWellKnownNames = (): Record<string, string> => {
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchNip05Json(BASE_NIP05_URL).then(({ names: wellKnownNames = {} }) =>
      setNames(wellKnownNames)
    );
  }, []);

  return names;
};

export const useNostrContacts = (
  publicKey: string,
  wellKnownNames: Record<string, string>
): NostrContacts => {
  const { messages } = useMessageContext();
  const { blockedKeys, seenEventIds } = useHistoryContext();
  const globalKeys = [
    ...new Set(
      [PACKAGE_DATA.author.npub, ...Object.values(wellKnownNames)].map(
        decodePublicKey
      )
    ),
  ].filter((key) => key && key !== publicKey && !blockedKeys.includes(key));
  const lastMessages: Record<string, DirectMessage> = {};
  const repliedKeys = new Set<string>();
  const seenIds = new Set(seenEventIds);

  toSorted(messages, descCreatedAt).forEach((message) => {
    const key = getContactKey(message, publicKey);

    if (message.pubkey === publicKey) repliedKeys.add(key);
    if (key !== publicKey && !lastMessages[key]) lastMessages[key] = message;
  });

  const strangerKeys = Object.keys(lastMessages).filter(
    (key) => !globalKeys.includes(key) && !repliedKeys.has(key)
  );
  const spamKeys = findSpamKeys(
    messages.filter(({ pubkey }) => strangerKeys.includes(pubkey))
  );

  return {
    chatKeys: [
      ...globalKeys,
      ...Object.keys(lastMessages).filter(
        (key) => !globalKeys.includes(key) && repliedKeys.has(key)
      ),
    ],
    lastMessages,
    requestKeys: strangerKeys.filter((key) => !spamKeys.has(key)),
    spamKeys: strangerKeys.filter((key) => spamKeys.has(key)),
    unreadMessages: messages.filter(
      ({ id, pubkey }) => pubkey !== publicKey && !seenIds.has(id)
    ),
  };
};

export const useFollows = (): string[] => {
  const { query, signer } = useNostr();
  const [follows, setFollows] = useState<string[]>([]);

  useEffect(() => {
    query({ authors: [signer.publicKey], kinds: [Contacts] }).then((events) => {
      const [latest] = toSorted(events, descCreatedAt);

      setFollows([
        ...new Set(
          (latest?.tags || [])
            .filter(([tag]) => tag === "p")
            .map(([, key = ""]) => decodePublicKey(key))
            .filter(Boolean)
        ),
      ]);
    });
  }, [query, signer.publicKey]);

  return follows;
};

const mergeProfile =
  ({ content, created_at, pubkey }: Event) =>
  (currentProfiles: Record<string, NostrProfile>) => {
    if ((currentProfiles[pubkey]?.created_at ?? 0) >= created_at) {
      return currentProfiles;
    }

    try {
      return {
        ...currentProfiles,
        [pubkey]: dataToProfile(
          pubkey,
          JSON.parse(content) as ProfileData,
          created_at
        ),
      };
    } catch {
      return currentProfiles;
    }
  };

export const useProfiles = (publicKeys: string[]): void => {
  const { query } = useNostr();
  const { profiles, setProfiles } = useHistoryContext();
  const requestedKeys = useRef(new Set<string>());
  const missingKeysString = publicKeys
    .filter((key) => !profiles[key])
    .join(",");

  useEffect(() => {
    const authors = missingKeysString
      .split(",")
      .filter((key) => key && !requestedKeys.current.has(key));

    if (authors.length === 0) return;

    authors.forEach((key) => requestedKeys.current.add(key));
    query({ authors, kinds: [Metadata] }).then((events) =>
      events.forEach((event) => setProfiles(mergeProfile(event)))
    );
  }, [missingKeysString, query, setProfiles]);
};

export const useUnreadStatus = (id: string, unreadCount: number): void => {
  const currentUnreadCount = useRef(unreadCount);
  const { title } = useProcessesActions();
  const [pid] = id.split(PROCESS_DELIMITER);

  useEffect(() => {
    title(
      pid,
      `${directory[pid]?.title}${unreadCount > 0 ? ` (${unreadCount})` : ""}`
    );
  }, [pid, title, unreadCount]);

  useEffect(() => {
    if (unreadCount > currentUnreadCount.current) {
      new Audio(NOTIFICATION_SOUND).play();
    }

    currentUnreadCount.current = unreadCount;
  }, [unreadCount]);
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
  const profileFilter = {
    enabled: Boolean(publicKey) && isVisible,
    filter: [{ authors: [publicKey], kinds: [Metadata] }],
    onEvent: (event: Event) => {
      if (event.pubkey === publicKey) setProfiles(mergeProfile(event));
    },
  };

  useNostrEvents(profileFilter);

  return publicKey ? profiles[publicKey] || dataToProfile(publicKey) : {};
};
