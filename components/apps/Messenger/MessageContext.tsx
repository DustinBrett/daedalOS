import {
  DirectMessageRelaysList,
  EncryptedDirectMessage,
  GiftWrap,
} from "nostr-tools/kinds";
import { type Event } from "nostr-tools/pure";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BASE_RW_RELAYS,
  MAX_GIFT_WRAP_AGE_IN_SECONDS,
  MESSAGES_DEBOUNCE_MS,
} from "components/apps/Messenger/constants";
import {
  createMessage,
  descCreatedAt,
  getContactKey,
  getUnixTime,
  groupMessages,
  unwrapMessage,
} from "components/apps/Messenger/functions";
import {
  type TimeScale,
  useHistoryContext,
} from "components/apps/Messenger/HistoryContext";
import { useNostrEvents } from "components/apps/Messenger/hooks";
import { useNostr } from "components/apps/Messenger/NostrContext";
import {
  type ChatMessages,
  type DirectMessage,
} from "components/apps/Messenger/types";
import { MILLISECONDS_IN_DAY, MILLISECONDS_IN_SECOND } from "utils/constants";
import { toSorted } from "utils/functions";

const TIME_SCALE_DAYS: Record<TimeScale, number> = {
  infinite: 0,
  month: 30,
  trimester: 90,
  week: 7,
};

type MessagesState = {
  messages: DirectMessage[];
  publicKey: string;
  sendMessage: (
    recipient: string,
    content: string,
    legacy: boolean
  ) => Promise<void>;
};

const MessageContext = createContext({} as MessagesState);

export const useMessageContext = (): MessagesState =>
  useContext(MessageContext);

export const useMessages = (recipientPublicKey: string): ChatMessages => {
  const { messages, publicKey } = useMessageContext();

  return useMemo(
    () =>
      groupMessages(
        messages.filter(({ pubkey, recipient }) =>
          recipientPublicKey === publicKey
            ? pubkey === publicKey && recipient === publicKey
            : pubkey === recipientPublicKey || recipient === recipientPublicKey
        )
      ),
    [messages, publicKey, recipientPublicKey]
  );
};

// Reply with NIP-04 only to people whose client still sends it
export const useIsLegacyChat = (recipientPublicKey: string): boolean => {
  const { messages } = useMessageContext();

  return useMemo(() => {
    const [lastReceived] = toSorted(
      messages.filter(({ pubkey }) => pubkey === recipientPublicKey),
      descCreatedAt
    );

    return lastReceived?.legacy === true;
  }, [messages, recipientPublicKey]);
};

export const MessageProvider = memo<FC>(({ children }) => {
  const { publish, query, signer } = useNostr();
  const { publicKey } = signer;
  const [messagesById, setMessagesById] = useState<
    Record<string, DirectMessage>
  >({});
  const { blockedKeys, deletedChats, timeScale } = useHistoryContext();
  const since = useMemo(
    () =>
      TIME_SCALE_DAYS[timeScale]
        ? getUnixTime() -
          (TIME_SCALE_DAYS[timeScale] * MILLISECONDS_IN_DAY) /
            MILLISECONDS_IN_SECOND
        : 0,
    [timeScale]
  );
  const pendingMessages = useRef<DirectMessage[]>([]);
  const flushTimer = useRef(0);
  const dmRelays = useRef<Record<string, Promise<string[]>>>({});
  const filter = useMemo(
    () => [
      {
        "#p": [publicKey],
        kinds: [GiftWrap],
        since: Math.max(0, since - MAX_GIFT_WRAP_AGE_IN_SECONDS),
      },
      { "#p": [publicKey], kinds: [EncryptedDirectMessage], since },
      { authors: [publicKey], kinds: [EncryptedDirectMessage], since },
    ],
    [publicKey, since]
  );
  const onEvent = useCallback(
    (event: Event) =>
      unwrapMessage(signer, event).then((message) => {
        if (!message) return;

        pendingMessages.current.push(message);
        flushTimer.current ||= window.setTimeout(() => {
          const newMessages = pendingMessages.current.splice(0);

          flushTimer.current = 0;
          setMessagesById((currentMessages) => {
            const updatedMessages = { ...currentMessages };

            newMessages.forEach((newMessage) => {
              updatedMessages[newMessage.id] ||= newMessage;
            });

            return updatedMessages;
          });
        }, MESSAGES_DEBOUNCE_MS);
      }),
    [signer]
  );
  const getDmRelays = useCallback(
    (recipient: string): Promise<string[]> => {
      dmRelays.current[recipient] ||= query({
        authors: [recipient],
        kinds: [DirectMessageRelaysList],
      }).then((events) => {
        const [latest] = toSorted(events, descCreatedAt);
        const urls = (latest?.tags || [])
          .filter(([tag, url]) => tag === "relay" && url?.startsWith("wss://"))
          .map(([, url]) => url);

        return urls.length > 0 ? urls : BASE_RW_RELAYS;
      });

      return dmRelays.current[recipient];
    },
    [query]
  );
  const sendMessage = useCallback(
    async (recipient: string, content: string, legacy: boolean) => {
      const { message, recipientEvent, selfEvent } = await createMessage(
        signer,
        recipient,
        content,
        legacy
      );
      const setStatus = (status?: DirectMessage["status"]): void =>
        setMessagesById((currentMessages) => ({
          ...currentMessages,
          [message.id]: { ...message, status },
        }));

      setStatus("sending");

      (async () => {
        const [sent] = await Promise.all([
          publish(
            recipientEvent,
            legacy ? BASE_RW_RELAYS : await getDmRelays(recipient)
          ),
          selfEvent && publish(selfEvent),
        ]);

        setStatus(sent ? undefined : "failed");
      })();
    },
    [getDmRelays, publish, signer]
  );

  useNostrEvents({ filter, onEvent });

  return (
    <MessageContext
      value={useMemo(
        () => ({
          messages: Object.values(messagesById).filter((message) => {
            const key = getContactKey(message, publicKey);

            return (
              !blockedKeys.includes(key) &&
              (deletedChats[key] ?? -1) < message.created_at
            );
          }),
          publicKey,
          sendMessage,
        }),
        [blockedKeys, deletedChats, messagesById, publicKey, sendMessage]
      )}
    >
      {children}
    </MessageContext>
  );
});
