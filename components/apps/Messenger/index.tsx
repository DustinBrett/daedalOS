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
import SendMessage from "components/apps/Messenger/SendMessage";

const NostrChat = (): JSX.Element => {
  const [publicKey, setPublicKey] = useState<string>("");
  const [selectedRecipientKey, setSelectedRecipientKey] = useState<string>("");
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
          pubkey === publicKey ? getKeyFromTags(tags) || "" : pubkey
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
      <ol>
        {contactKeys.map((pubkey) => (
          <Contact
            key={pubkey}
            lastEvent={lastEvents[pubkey]}
            onClick={() => setSelectedRecipientKey(pubkey)}
            publicKey={publicKey}
            recipientPublicKey={selectedRecipientKey}
          />
        ))}
      </ol>
      <SendMessage
        publicKey={publicKey}
        recipientPublicKey={selectedRecipientKey}
      />
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
