import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import ChatLog from "components/apps/Messenger/ChatLog";
import {
  inLeftOutRight,
  inRightOutLeft,
  UNKNOWN_PUBLIC_KEY,
} from "components/apps/Messenger/constants";
import Contact from "components/apps/Messenger/Contact";
import ContactsToolbar from "components/apps/Messenger/ContactsToolbar";
import {
  decodePublicKey,
  getSigner,
  getUnixTime,
} from "components/apps/Messenger/functions";
import GetMoreMessages from "components/apps/Messenger/GetMoreMessages";
import {
  HistoryProvider,
  useHistoryContext,
} from "components/apps/Messenger/HistoryContext";
import {
  useNostrContacts,
  useUnreadStatus,
  useWellKnownNames,
} from "components/apps/Messenger/hooks";
import {
  MessageProvider,
  useMessageContext,
} from "components/apps/Messenger/MessageContext";
import { NostrProvider } from "components/apps/Messenger/NostrContext";
import ProfileBanner from "components/apps/Messenger/ProfileBanner";
import SendMessage from "components/apps/Messenger/SendMessage";
import StyledChatContainer from "components/apps/Messenger/StyledChatContainer";
import StyledContacts from "components/apps/Messenger/StyledContacts";
import StyledListButton from "components/apps/Messenger/StyledListButton";
import StyledMessenger from "components/apps/Messenger/StyledMessenger";
import To from "components/apps/Messenger/To";
import { type Signer } from "components/apps/Messenger/types";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcess, useProcessesActions } from "contexts/process";
import Button from "styles/common/Button";
import { haltEvent } from "utils/functions";

type View = "chats" | "requests" | "spam";

const VIEW_TITLES: Record<View, string> = {
  chats: "Chats",
  requests: "Message requests",
  spam: "Spam",
};

type NostrChatProps = {
  processId: string;
  setSigner: (signer: Signer) => void;
  wellKnownNames: Record<string, string>;
};

const NostrChat: FC<NostrChatProps> = ({
  processId,
  setSigner,
  wellKnownNames,
}) => {
  const { publicKey } = useMessageContext();
  const { setBlockedKeys, setDeletedChats, setSeenEventIds } =
    useHistoryContext();
  const [selectedRecipientKey, setSelectedRecipientKey] = useState("");
  const [hideReadMessages, setHideReadMessages] = useState(false);
  const [view, setView] = useState<View>("chats");
  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  const { chatKeys, lastMessages, requestKeys, spamKeys, unreadMessages } =
    useNostrContacts(publicKey, wellKnownNames);
  const unreadIds = new Set(unreadMessages.map(({ id }) => id));
  const unreadKeys = new Set(
    [...chatKeys, ...requestKeys, ...spamKeys].filter((key) =>
      unreadIds.has(lastMessages[key]?.id)
    )
  );
  const listKeys = { chats: chatKeys, requests: requestKeys, spam: spamKeys }[
    view
  ].filter((key) => !hideReadMessages || unreadKeys.has(key));
  const { url: setUrl } = useProcessesActions();
  const { url } = useProcess(processId);
  const markRead = (keys: string[]): void => {
    const ids = unreadMessages
      .filter(({ pubkey }) => keys.includes(pubkey))
      .map(({ id }) => id);

    if (ids.length > 0) {
      setSeenEventIds((currentSeenEventIds) => [
        ...new Set([...ids, ...currentSeenEventIds]),
      ]);
    }
  };
  const deleteChats = (keys: string[]): void => {
    setDeletedChats((currentDeletedChats) => ({
      ...currentDeletedChats,
      ...Object.fromEntries(
        keys.map((key) => [
          key,
          Math.max(getUnixTime(), lastMessages[key]?.created_at ?? 0),
        ])
      ),
    }));
    setSelectedRecipientKey("");
  };
  const blockKeys = (keys: string[]): void => {
    setBlockedKeys((currentBlockedKeys) => [
      ...new Set([...currentBlockedKeys, ...keys]),
    ]);
    setSelectedRecipientKey("");
  };
  const changeView = (newView: View): void => {
    setView(newView);
    setSelectedKeys(undefined);
  };

  // Requests don't ring or count as unread until they are replied to
  useUnreadStatus(
    processId,
    chatKeys.filter((key) => unreadKeys.has(key)).length
  );

  useEffect(() => {
    if (!url?.startsWith("nostr:")) return;

    const key = decodePublicKey(url);

    // eslint-disable-next-line react/set-state-in-effect -- Opens the chat a nostr: url points to
    if (key) setSelectedRecipientKey(key);

    setUrl(processId, "");
  }, [processId, setUrl, url]);

  useEffect(() => {
    if (selectedRecipientKey) markRead([selectedRecipientKey]);
  }, [markRead, selectedRecipientKey]);

  return (
    <StyledMessenger>
      <ProfileBanner
        block={(key) => blockKeys([key])}
        deleteChat={(key) => deleteChats([key])}
        goBack={
          selectedRecipientKey || view !== "chats"
            ? () =>
                selectedRecipientKey
                  ? setSelectedRecipientKey("")
                  : changeView("chats")
            : undefined
        }
        hideReadMessages={hideReadMessages}
        newChat={() => setSelectedRecipientKey(UNKNOWN_PUBLIC_KEY)}
        selectedRecipientKey={selectedRecipientKey}
        setHideReadMessages={setHideReadMessages}
        setSigner={setSigner}
      />
      <div>
        <AnimatePresence initial={false} presenceAffectsLayout={false}>
          {selectedRecipientKey ? (
            <StyledChatContainer key="chat" {...inRightOutLeft}>
              {selectedRecipientKey === UNKNOWN_PUBLIC_KEY && (
                <To
                  knownKeys={[...chatKeys, ...requestKeys]}
                  setRecipientKey={setSelectedRecipientKey}
                />
              )}
              <ChatLog recipientPublicKey={selectedRecipientKey} />
              <SendMessage recipientPublicKey={selectedRecipientKey} />
            </StyledChatContainer>
          ) : (
            <StyledContacts
              key="contacts"
              aria-label={VIEW_TITLES[view]}
              onContextMenu={haltEvent}
              {...inLeftOutRight}
            >
              <ContactsToolbar
                actions={[
                  ["Mark read", markRead],
                  ["Delete", deleteChats],
                  ["Block", blockKeys],
                ]}
                keys={listKeys}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
                title={VIEW_TITLES[view]}
              />
              {listKeys.map((key) => (
                <Contact
                  key={key}
                  block={() => blockKeys([key])}
                  deleteChat={() => deleteChats([key])}
                  lastMessage={lastMessages[key]}
                  onClick={() => setSelectedRecipientKey(key)}
                  onSelect={
                    selectedKeys
                      ? () =>
                          setSelectedKeys((currentKeys = []) =>
                            currentKeys.includes(key)
                              ? currentKeys.filter(
                                  (currentKey) => currentKey !== key
                                )
                              : [...currentKeys, key]
                          )
                      : undefined
                  }
                  pubkey={key}
                  publicKey={publicKey}
                  selected={selectedKeys?.includes(key)}
                  unread={unreadKeys.has(key)}
                />
              ))}
              {view === "chats" &&
                (
                  [
                    ["requests", requestKeys],
                    ["spam", spamKeys],
                  ] as const
                ).map(
                  ([otherView, keys]) =>
                    keys.length > 0 && (
                      <StyledListButton key={otherView}>
                        <Button onClick={() => changeView(otherView)}>
                          {`${VIEW_TITLES[otherView]} (${keys.length})`}
                        </Button>
                      </StyledListButton>
                    )
                )}
              <GetMoreMessages />
            </StyledContacts>
          )}
        </AnimatePresence>
      </div>
    </StyledMessenger>
  );
};

const Messenger: FC<ComponentProcessProps> = ({ id }) => {
  const [signer, setSigner] = useState<Signer>();
  const initStarted = useRef(false);
  const wellKnownNames = useWellKnownNames();

  useEffect(() => {
    if (initStarted.current) return;

    initStarted.current = true;

    getSigner().then(setSigner);
  }, []);

  return signer ? (
    <NostrProvider key={signer.publicKey} signer={signer}>
      <HistoryProvider>
        <MessageProvider>
          <NostrChat
            processId={id}
            setSigner={setSigner}
            wellKnownNames={wellKnownNames}
          />
        </MessageProvider>
      </HistoryProvider>
    </NostrProvider>
  ) : (
    <> </>
  );
};

export default Messenger;
