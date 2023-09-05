import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { NostrProvider } from "nostr-react";
import { useEffect, useRef, useState } from "react";
import {
  getPublicHexKey,
  getRelayUrls,
  maybeGetExistingPublicKey,
} from "components/apps/Messenger/functions";
import StyledMessenger from "components/apps/Messenger/StyledMessenger";
import Contact from "components/apps/Messenger/Contact";
import SendMessage from "components/apps/Messenger/SendMessage";
import { useNostrContacts } from "components/apps/Messenger/hooks";

const NostrChat = (): JSX.Element => {
  const [publicKey, setPublicKey] = useState<string>("");
  const [selectedRecipientKey, setSelectedRecipientKey] = useState<string>("");
  const loggedInRef = useRef<boolean>(false);
  const { contactKeys, lastEvents } = useNostrContacts(publicKey);

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
            pubkey={pubkey}
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
