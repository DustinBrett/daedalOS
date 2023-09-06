import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { NostrProvider } from "nostr-react";
import { useEffect, useState } from "react";
import { getRelayUrls } from "components/apps/Messenger/functions";
import StyledMessenger from "components/apps/Messenger/StyledMessenger";
import Contact from "components/apps/Messenger/Contact";
import SendMessage from "components/apps/Messenger/SendMessage";
import {
  useNostrContacts,
  usePublicKey,
  useNip05,
} from "components/apps/Messenger/hooks";
import StyledContacts from "components/apps/Messenger/StyledContacts";
import ProfileBanner from "components/apps/Messenger/ProfileBanner";

const NostrChat: FC<{
  publicKey: string;
  wellKnownNames: Record<string, string>;
}> = ({ publicKey, wellKnownNames }) => {
  const [selectedRecipientKey, setSelectedRecipientKey] = useState<string>("");
  const { contactKeys, lastEvents } = useNostrContacts(
    publicKey,
    wellKnownNames
  );

  return (
    <StyledMessenger>
      <ProfileBanner
        goHome={() => setSelectedRecipientKey("")}
        publicKey={publicKey}
        selectedRecipientKey={selectedRecipientKey}
      />
      {selectedRecipientKey ? (
        <SendMessage
          publicKey={publicKey}
          recipientPublicKey={selectedRecipientKey}
        />
      ) : (
        <StyledContacts>
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
        </StyledContacts>
      )}
    </StyledMessenger>
  );
};

const Messenger: FC<ComponentProcessProps> = () => {
  const [relayUrls, setRelayUrls] = useState<string[] | undefined>();
  const { names, relays } = useNip05();
  const publicKey = usePublicKey();

  useEffect(() => {
    if (!publicKey || !relays) return;

    getRelayUrls(publicKey, relays).then(setRelayUrls);
  }, [publicKey, relays]);

  return publicKey && relayUrls ? (
    <NostrProvider relayUrls={relayUrls}>
      <NostrChat publicKey={publicKey} wellKnownNames={names} />
    </NostrProvider>
  ) : (
    <> </>
  );
};

export default Messenger;
