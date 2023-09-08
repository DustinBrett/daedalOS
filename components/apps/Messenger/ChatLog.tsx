import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import type { Event } from "nostr-tools";
import {
  getKeyFromTags,
  decryptMessage,
  ascCreatedAt,
  descCreatedAt,
} from "components/apps/Messenger/functions";
import StyledChatLog from "components/apps/Messenger/StyledChatLog";

const ChatLog: FC<{
  events: Event[];
  publicKey: string;
  recipientPublicKey: string;
}> = ({ events, publicKey, recipientPublicKey }) => {
  const chatEvents = useMemo(
    () =>
      events.filter(({ pubkey, tags }) =>
        [pubkey, getKeyFromTags(tags)].includes(recipientPublicKey)
      ),
    [events, recipientPublicKey]
  );
  const [decryptedContent, setDecryptedContent] = useState<
    Record<string, string>
  >({});
  const decryptMessages = useCallback(
    () =>
      chatEvents.sort(descCreatedAt).forEach(({ content, id }) =>
        decryptMessage(id, content, recipientPublicKey).then((message) =>
          setDecryptedContent((currentDecryptedContent) => ({
            ...currentDecryptedContent,
            [id]: message,
          }))
        )
      ),
    [chatEvents, recipientPublicKey]
  );
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (chatEvents) {
      decryptMessages();
      listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    }
  }, [chatEvents, decryptMessages]);

  return (
    <StyledChatLog ref={listRef}>
      {chatEvents.sort(ascCreatedAt).map(({ id, pubkey, content }) => (
        <li key={id} className={publicKey === pubkey ? "sent" : "received"}>
          {decryptedContent[id] || content}
        </li>
      ))}
    </StyledChatLog>
  );
};

export default ChatLog;
