import { useHistoryContext } from "components/apps/Messenger/HistoryContext";
import {
  getKeyFromTags,
  getMessages,
  groupChatEvents,
} from "components/apps/Messenger/functions";
import type { ChatEvents } from "components/apps/Messenger/types";
import { useNostrEvents } from "nostr-react";
import type { Event } from "nostr-tools";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

type MessageData = {
  allEventsReceived: boolean;
  messages: ChatEvents;
};

type MessagesState = {
  events: Event[];
  publicKey: string;
  sendingEvent: (event: Event) => void;
};

const MessageContext = createContext({
  events: [],
  publicKey: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  sendingEvent: () => {},
} as MessagesState);

export const useMessageContext = (): MessagesState =>
  useContext(MessageContext);

export const useMessages = (recipientPublicKey: string): MessageData => {
  const { outgoingEvents } = useHistoryContext();
  const { events, publicKey } = useMessageContext();
  const receivedEvents = useNostrEvents(
    getMessages(recipientPublicKey, publicKey)
  );
  const sentEvents = useNostrEvents(getMessages(publicKey, recipientPublicKey));
  const [messages, setMessages] = useState<ChatEvents>([]);

  useEffect(() => {
    const filteredEvents = [
      ...receivedEvents.events,
      ...sentEvents.events,
      ...events.filter(({ pubkey, tags }) => {
        const isSender = pubkey === recipientPublicKey;
        const isRecipient = getKeyFromTags(tags) === recipientPublicKey;

        return recipientPublicKey === publicKey
          ? isSender && isRecipient
          : isSender || isRecipient;
      }),
    ].filter(
      (event, index, currentEvents) =>
        currentEvents.findIndex(({ id }) => id === event.id) === index
    );
    const currentMessages = groupChatEvents(filteredEvents);

    if (
      currentMessages.length !== messages.length ||
      filteredEvents.length !==
        messages.reduce<Event[]>(
          (allMessages, [, moreMessages]) => [...allMessages, ...moreMessages],
          []
        ).length
    ) {
      setMessages(currentMessages);
    }
  }, [
    events,
    messages,
    publicKey,
    receivedEvents.events,
    recipientPublicKey,
    sentEvents.events,
  ]);

  return {
    allEventsReceived: useMemo(
      () =>
        !outgoingEvents.some(
          ({ tags }) => getKeyFromTags(tags) === recipientPublicKey
        ),
      [outgoingEvents, recipientPublicKey]
    ),
    messages,
  };
};

type MessageProviderProps = {
  publicKey: string;
  since?: number;
};

export const MessageProvider = memo<FC<MessageProviderProps>>(
  ({ children, publicKey, since }) => {
    const receivedEvents = useNostrEvents(getMessages("", publicKey, since));
    const sentEvents = useNostrEvents(getMessages(publicKey, "", since));
    const { outgoingEvents, setOutgoingEvents } = useHistoryContext();
    const sendingEvent = useCallback(
      (event: Event) =>
        setOutgoingEvents((currentOutgoingEvents) => [
          ...currentOutgoingEvents,
          event,
        ]),
      [setOutgoingEvents]
    );
    const chatEvents = useMemo(
      () => [...receivedEvents.events, ...sentEvents.events],
      [receivedEvents.events, sentEvents.events]
    );
    const [events, setEvents] = useState<Event[]>(chatEvents);
    const cleanOutgoingEventsTimerRef = useRef(0);

    useEffect(() => {
      const currentEvents = [
        ...chatEvents,
        ...outgoingEvents.filter(
          (event) => !sentEvents.events.some(({ id }) => id === event.id)
        ),
      ];

      if (currentEvents.length !== events.length) setEvents(currentEvents);
    }, [chatEvents, events, outgoingEvents, sentEvents.events]);

    useEffect(() => {
      if (cleanOutgoingEventsTimerRef.current) {
        window.clearTimeout(cleanOutgoingEventsTimerRef.current);
      }

      cleanOutgoingEventsTimerRef.current = window.setTimeout(
        () =>
          outgoingEvents.forEach((message) => {
            if (chatEvents.some(({ id }) => id === message.id)) {
              setOutgoingEvents((currentOutgoingEvents) =>
                currentOutgoingEvents.filter(({ id }) => id !== message.id)
              );
            }
          }),
        MILLISECONDS_IN_SECOND / 2
      );
    }, [chatEvents, outgoingEvents, setOutgoingEvents]);

    return (
      <MessageContext.Provider
        value={useMemo(
          () => ({
            events,
            publicKey,
            sendingEvent,
          }),
          [events, publicKey, sendingEvent]
        )}
      >
        {children}
      </MessageContext.Provider>
    );
  }
);
