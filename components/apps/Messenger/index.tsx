import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Event } from "nostr-tools";
import { AnimatePresence } from "motion/react";
import ChatLog from "components/apps/Messenger/ChatLog";
import Contact from "components/apps/Messenger/Contact";
import GetMoreMessages from "components/apps/Messenger/GetMoreMessages";
import {
  HistoryProvider,
  useHistoryContext,
} from "components/apps/Messenger/HistoryContext";
import { MessageProvider } from "components/apps/Messenger/MessageContext";
import { NostrProvider } from "components/apps/Messenger/NostrContext";
import ProfileBanner from "components/apps/Messenger/ProfileBanner";
import SendMessage from "components/apps/Messenger/SendMessage";
import StyledChatContainer from "components/apps/Messenger/StyledChatContainer";
import StyledContacts from "components/apps/Messenger/StyledContacts";
import StyledMessenger from "components/apps/Messenger/StyledMessenger";
import To from "components/apps/Messenger/To";
import {
  UNKNOWN_PUBLIC_KEY,
  inLeftOutRight,
  inRightOutLeft,
} from "components/apps/Messenger/constants";
import {
  getPublicHexFromNostrAddress,
  getRelayUrls,
  toHexKey,
} from "components/apps/Messenger/functions";
import {
  useNip05,
  useNostrContacts,
  usePublicKey,
  useUnreadStatus,
} from "components/apps/Messenger/hooks";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import { MILLISECONDS_IN_DAY, MILLISECONDS_IN_SECOND } from "utils/constants";
import { haltEvent } from "utils/functions";

type NostrChatProps = {
  processId: string;
  publicKey: string;
  relayUrls: string[];
  setSince: React.Dispatch<React.SetStateAction<number>>;
  wellKnownNames: Record<string, string>;
};

const NostrChat: FC<NostrChatProps> = ({
  processId,
  publicKey,
  relayUrls,
  setSince,
  wellKnownNames,
}) => {
  const { setSeenEventIds } = useHistoryContext();
  const [selectedRecipientKey, setSelectedRecipientKey] = useState<string>("");
  const [hideReadMessages, setHideReadMessages] = useState<boolean>(false);
  const changeRecipient = useCallback(
    (recipientKey: string, currentEvents?: Event[]) =>
      setSelectedRecipientKey((currenRecipientKey: string) => {
        if ((currenRecipientKey || recipientKey) && currentEvents) {
          setSeenEventIds((currentSeenEventIds) => [
            ...new Set([
              ...currentEvents
                .filter(({ pubkey }) =>
                  [recipientKey, currenRecipientKey].includes(pubkey)
                )
                .map(({ id }) => id),
              ...currentSeenEventIds,
            ]),
          ]);
        }

        return recipientKey;
      }),
    [setSeenEventIds]
  );
  const { contactKeys, events, lastEvents, unreadEvents } = useNostrContacts(
    publicKey,
    wellKnownNames
  );
  const setRecipientKey = useCallback(
    (recipientKey: string): boolean => {
      const hexKey = getPublicHexFromNostrAddress(recipientKey);

      if (hexKey) changeRecipient(hexKey);

      return Boolean(hexKey);
    },
    [changeRecipient]
  );
  const {
    processes: { [processId]: process },
    url: setUrl,
  } = useProcesses();
  const { url } = process || {};

  useUnreadStatus(
    processId,
    contactKeys.filter((contactKey) =>
      unreadEvents.includes(lastEvents[contactKey])
    ).length
  );

  useEffect(() => {
    if (
      !url ||
      (!url.startsWith("nostr:npub") && !url.startsWith("nostr:nprofile"))
    ) {
      return;
    }

    const [, key] = url.split("nostr:");

    if (key) {
      const hexKey = toHexKey(key);

      if (key !== hexKey) {
        setSelectedRecipientKey(hexKey);
        setUrl(processId, "");
      }
    }
  }, [processId, setUrl, url]);

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
  }, [selectedRecipientKey, setSeenEventIds, unreadEvents]);

  return (
    <StyledMessenger>
      <ProfileBanner
        goHome={() => changeRecipient("", events)}
        hideReadMessages={hideReadMessages}
        newChat={() => changeRecipient(UNKNOWN_PUBLIC_KEY)}
        publicKey={publicKey}
        relayUrls={relayUrls}
        selectedRecipientKey={selectedRecipientKey}
        setHideReadMessages={setHideReadMessages}
      />
      <div>
        <AnimatePresence initial={false} presenceAffectsLayout={false}>
          {selectedRecipientKey ? (
            <StyledChatContainer key="chat" {...inRightOutLeft}>
              {selectedRecipientKey === UNKNOWN_PUBLIC_KEY && (
                <To setRecipientKey={setRecipientKey} />
              )}
              <ChatLog recipientPublicKey={selectedRecipientKey} />
              <SendMessage recipientPublicKey={selectedRecipientKey} />
            </StyledChatContainer>
          ) : (
            <StyledContacts
              key="contacts"
              onContextMenu={haltEvent}
              {...inLeftOutRight}
            >
              {contactKeys
                .filter(
                  (contactKey) =>
                    !hideReadMessages ||
                    unreadEvents.includes(lastEvents[contactKey])
                )
                .map((contactKey) => (
                  <Contact
                    key={contactKey}
                    lastEvent={lastEvents[contactKey]}
                    onClick={() => changeRecipient(contactKey, events)}
                    pubkey={contactKey}
                    publicKey={publicKey}
                    unreadEvent={
                      hideReadMessages ||
                      unreadEvents.includes(lastEvents[contactKey])
                    }
                  />
                ))}
              <GetMoreMessages setSince={setSince} />
            </StyledContacts>
          )}
        </AnimatePresence>
      </div>
    </StyledMessenger>
  );
};

const Messenger: FC<ComponentProcessProps> = ({ id }) => {
  const [since, setSince] = useState(() => MILLISECONDS_IN_DAY);
  const timeSince = useMemo(
    () => Math.floor((Date.now() - since) / MILLISECONDS_IN_SECOND),
    [since]
  );
  const [relayUrls, setRelayUrls] = useState<string[] | undefined>();
  const initStarted = useRef(false);
  const { names } = useNip05();
  const publicKey = usePublicKey();

  useEffect(() => {
    if (initStarted.current || !publicKey) return;

    initStarted.current = true;

    getRelayUrls().then(setRelayUrls);
  }, [publicKey]);

  return publicKey && relayUrls ? (
    <NostrProvider relayUrls={relayUrls}>
      <HistoryProvider>
        <MessageProvider publicKey={publicKey} since={timeSince}>
          <NostrChat
            processId={id}
            publicKey={publicKey}
            relayUrls={relayUrls}
            setSince={setSince}
            wellKnownNames={names}
          />
        </MessageProvider>
      </HistoryProvider>
    </NostrProvider>
  ) : (
    <> </>
  );
};

export default memo(Messenger);
