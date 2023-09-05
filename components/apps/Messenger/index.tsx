import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { NostrProvider, useNostrEvents } from "nostr-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  descCreatedAt,
  getKeyFromTags,
  getPublicHexKey,
  getReceivedMessages,
  getRelayUrls,
  getSentMessages,
  maybeGetExistingPublicKey,
} from "components/apps/Messenger/functions";
import StyledMessenger from "components/apps/Messenger/StyledMessenger";
import Contact from "components/apps/Messenger/Contact";

const NostrChat = (): JSX.Element => {
  const [publicKey, setPublicKey] = useState<string>("");
  const loggedInRef = useRef<boolean>(false);
  const receivedEvents = useNostrEvents(getReceivedMessages(publicKey));
  const sentEvents = useNostrEvents(getSentMessages(publicKey));
  const events = useMemo(
    () => [...receivedEvents.events, ...sentEvents.events],
    [receivedEvents, sentEvents]
  );
  const contactKeys = useMemo(
    () => [
      ...new Set(
        events.map(({ pubkey, tags }) =>
          pubkey === publicKey
            ? tags?.find(([tag]) => tag === "p")?.[1] || ""
            : pubkey
        )
      ),
    ],
    [events, publicKey]
  );
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

  useEffect(() => {
    if (publicKey || loggedInRef.current) return;

    loggedInRef.current = true;

    maybeGetExistingPublicKey().then(getPublicHexKey).then(setPublicKey);
  }, [publicKey]);

  return (
    <StyledMessenger>
      {contactKeys.map((pubkey) => (
        <Contact
          key={pubkey}
          lastEvent={lastEvents[pubkey]}
          publicKey={publicKey}
        />
      ))}
    </StyledMessenger>
  );
};

const Messenger: FC<ComponentProcessProps> = () => {
  const [relayUrls, setRelayUrls] = useState<string[] | undefined>();

  useEffect(() => {
    if (!relayUrls) getRelayUrls().then(setRelayUrls);
  }, [relayUrls]);

  return relayUrls ? (
    <NostrProvider relayUrls={relayUrls}>
      <NostrChat />
    </NostrProvider>
  ) : (
    <> </>
  );
};

export default Messenger;
