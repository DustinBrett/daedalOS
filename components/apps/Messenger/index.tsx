import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { NostrProvider } from "nostr-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getRelayUrls,
  getPublicHexFromNostrAddress,
} from "components/apps/Messenger/functions";
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
import To from "components/apps/Messenger/To";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import type { Event } from "nostr-tools";
import { haltEvent } from "utils/functions";

type NostrChatProps = {
  loginTime: number;
  processId: string;
  publicKey: string;
  wellKnownNames: Record<string, string>;
};

const NostrChat: FC<NostrChatProps> = ({
  processId,
  loginTime,
  publicKey,
  wellKnownNames,
}) => {
  const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
  const [selectedRecipientKey, setSelectedRecipientKey] = useState<string>("");
  const changeRecipient = useCallback(
    (recipientKey: string, currentEvents?: Event[]) =>
      setSelectedRecipientKey((currenRecipientKey: string) => {
        if ((currenRecipientKey || recipientKey) && currentEvents) {
          setSeenEventIds((currentSeenEventIds) => [
            ...new Set([
              ...currentEvents
                .filter(
                  ({ created_at, pubkey }) =>
                    [recipientKey, currenRecipientKey].includes(pubkey) &&
                    created_at > loginTime
                )
                .map(({ id }) => id),
              ...currentSeenEventIds,
            ]),
          ]);
        }

        return recipientKey;
      }),
    [loginTime]
  );
  const { contactKeys, events, lastEvents, unreadEvents } = useNostrContacts(
    publicKey,
    wellKnownNames,
    loginTime,
    seenEventIds
  );
  const setRecipientKey = useCallback(
    (recipientKey: string): boolean => {
      const hexKey = getPublicHexFromNostrAddress(recipientKey);

      if (hexKey) changeRecipient(hexKey);

      return Boolean(hexKey);
    },
    [changeRecipient]
  );

  useUnreadStatus(processId, unreadEvents.length);

  useEffect(() => {
    if (unreadEvents && selectedRecipientKey) {
      unreadEvents
        .filter(({ pubkey }) => pubkey === selectedRecipientKey)
        .forEach(({ id }) =>
          setSeenEventIds((currentSeenEventIds) => [
            ...new Set([id, ...currentSeenEventIds]),
          ])
        );
    }
  }, [selectedRecipientKey, unreadEvents]);

  return (
    <StyledMessenger>
      <ProfileBanner
        goHome={() => changeRecipient("", events)}
        newChat={() => changeRecipient(UNKNOWN_PUBLIC_KEY)}
        publicKey={publicKey}
        selectedRecipientKey={selectedRecipientKey}
      />
      {selectedRecipientKey ? (
        <>
          {selectedRecipientKey === UNKNOWN_PUBLIC_KEY && (
            <To setRecipientKey={setRecipientKey} />
          )}
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
        <StyledContacts onContextMenu={haltEvent}>
          {contactKeys.map((contactKey) => (
            <Contact
              key={contactKey}
              lastEvent={lastEvents[contactKey]}
              onClick={() => changeRecipient(contactKey, events)}
              pubkey={contactKey}
              publicKey={publicKey}
              unreadEvent={unreadEvents.includes(lastEvents[contactKey])}
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
  const initStarted = useRef(false);
  const { names, relays } = useNip05();
  const publicKey = usePublicKey();

  useEffect(() => {
    if (initStarted.current || !publicKey || !relays) return;

    initStarted.current = true;

    getRelayUrls(publicKey, relays).then((foundRelays) => {
      setRelayUrls(foundRelays);
      setLoginTime(Math.floor(Date.now() / 1000));
    });
  }, [publicKey, relays]);

  return publicKey && relayUrls ? (
    <NostrProvider relayUrls={relayUrls}>
      <NostrChat
        loginTime={loginTime}
        processId={id}
        publicKey={publicKey}
        wellKnownNames={names}
      />
    </NostrProvider>
  ) : (
    <> </>
  );
};

export default Messenger;
