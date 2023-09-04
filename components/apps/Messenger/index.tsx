import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { NostrProvider, useNostrEvents } from "nostr-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Messages } from "components/apps/Messenger/types";
import {
  getPublicHexKey,
  getReceivedMessages,
  getRelayUrls,
  getSentMessages,
  maybeGetExistingPublicKey,
  processMessages,
  toHexKey,
} from "components/apps/Messenger/functions";
import StyledMessenger from "components/apps/Messenger/StyledMessenger";
import Message from "components/apps/Messenger/Message";

const NostrChat = (): JSX.Element => {
  const [publicKey, setPublicKey] = useState<string>("");
  const loggedInRef = useRef<boolean>(false);
  const receivedEvents = useNostrEvents(getReceivedMessages(publicKey));
  const sentEvents = useNostrEvents(getSentMessages(publicKey));
  const events = useMemo(
    () => [...receivedEvents.events, ...sentEvents.events],
    [receivedEvents, sentEvents]
  );
  const [messages, setMessages] = useState<Messages>([]);

  useEffect(() => {
    if (publicKey || loggedInRef.current) return;

    loggedInRef.current = true;

    maybeGetExistingPublicKey().then(getPublicHexKey).then(setPublicKey);
  }, [publicKey]);

  useEffect(() => {
    if (events.length > 0 && events.length !== messages.length) {
      setMessages(processMessages(events, messages, toHexKey(publicKey)));
    }
  }, [events, messages, publicKey]);

  return (
    <StyledMessenger>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
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
