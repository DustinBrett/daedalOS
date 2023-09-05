import { useNostrEvents } from "nostr-react";
import { useMemo } from "react";
import {
  getReceivedMessages,
  getSentMessages,
  getKeyFromTags,
  descCreatedAt,
} from "components/apps/Messenger/functions";
import type { Event } from "nostr-tools";
import { useSession } from "contexts/session";

type NostrContacts = {
  contactKeys: string[];
  lastEvents: Record<string, Event>;
};

export const useNostrContacts = (publicKey: string): NostrContacts => {
  const { nostrGlobalContacts } = useSession();
  const receivedEvents = useNostrEvents(getReceivedMessages(publicKey));
  const sentEvents = useNostrEvents(getSentMessages(publicKey));
  const events = useMemo(
    () => [...receivedEvents.events, ...sentEvents.events],
    [receivedEvents, sentEvents]
  );
  const contactKeys = useMemo(() => {
    const keys = new Set(
      events
        .map(({ pubkey, tags }) =>
          pubkey === publicKey ? getKeyFromTags(tags) || "" : pubkey
        )
        .filter((pubkey) => !nostrGlobalContacts.includes(pubkey))
    );

    return nostrGlobalContacts.includes(publicKey)
      ? [...keys]
      : [...nostrGlobalContacts, ...keys];
  }, [events, nostrGlobalContacts, publicKey]);

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

  return { contactKeys, lastEvents };
};
