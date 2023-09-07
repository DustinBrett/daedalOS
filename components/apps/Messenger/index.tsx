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
  useUnreadStatus,
} from "components/apps/Messenger/hooks";
import StyledContacts from "components/apps/Messenger/StyledContacts";
import ProfileBanner from "components/apps/Messenger/ProfileBanner";
import ChatLog from "components/apps/Messenger/ChatLog";

const NostrChat: FC<{
  id: string;
  loginTime: number;
  publicKey: string;
  wellKnownNames: Record<string, string>;
}> = ({ id, loginTime, publicKey, wellKnownNames }) => {
  const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
  const [selectedRecipientKey, setSelectedRecipientKey] = useState<string>("");
  const { contactKeys, events, lastEvents, unreadEvents } = useNostrContacts(
    publicKey,
    wellKnownNames,
    loginTime,
    seenEventIds
  );

  useUnreadStatus(id, unreadEvents.length);

  return (
    <StyledMessenger>
      <ProfileBanner
        goHome={() => setSelectedRecipientKey("")}
        // TODO: Show chat with "To: ..."
        newChat={() => setSelectedRecipientKey("")}
        publicKey={publicKey}
        selectedRecipientKey={selectedRecipientKey}
      />
      {selectedRecipientKey ? (
        <>
          <ChatLog
            events={events}
            publicKey={publicKey}
            recipientPublicKey={selectedRecipientKey}
          />
          <SendMessage
            publicKey={publicKey}
            recipientPublicKey={selectedRecipientKey}
          />
        </>
      ) : (
        <StyledContacts>
          {contactKeys.map((pubkey) => (
            <Contact
              key={pubkey}
              lastEvent={lastEvents[pubkey]}
              onClick={() => {
                setSeenEventIds((currentSeenEventIds) => [
                  ...new Set([lastEvents[pubkey]?.id, ...currentSeenEventIds]),
                ]);
                setSelectedRecipientKey(pubkey);
              }}
              pubkey={pubkey}
              publicKey={publicKey}
              unreadEvent={unreadEvents.includes(lastEvents[pubkey])}
            />
          ))}
        </StyledContacts>
      )}
    </StyledMessenger>
  );
};

const Messenger: FC<ComponentProcessProps> = ({ id }) => {
  const [loginTime, setLoginTime] = useState<number>(0);
  const [relayUrls, setRelayUrls] = useState<string[] | undefined>();
  const { names, relays } = useNip05();
  const publicKey = usePublicKey();

  useEffect(() => {
    if (!publicKey || !relays) return;

    getRelayUrls(publicKey, relays).then((foundRelays) => {
      setRelayUrls(foundRelays);
      setLoginTime(Math.floor(Date.now() / 1000));
    });
  }, [publicKey, relays]);

  return publicKey && relayUrls ? (
    <NostrProvider relayUrls={relayUrls}>
      <NostrChat
        id={id}
        loginTime={loginTime}
        publicKey={publicKey}
        wellKnownNames={names}
      />
    </NostrProvider>
  ) : (
    <> </>
  );
};

export default Messenger;
