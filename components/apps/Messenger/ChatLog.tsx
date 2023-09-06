import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import type { Event } from "nostr-tools";
import {
  getKeyFromTags,
  decryptMessage,
  ascCreatedAt,
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
  const decryptMessages = useCallback((): void => {
    chatEvents.forEach(async ({ content, id }) => {
      if (decryptedContent[id]) return;

      const message = await decryptMessage(content, recipientPublicKey);

      setDecryptedContent((currentDecryptedContent) => ({
        ...currentDecryptedContent,
        [id]: message,
      }));
    });
  }, [chatEvents, decryptedContent, recipientPublicKey]);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (chatEvents) decryptMessages();
  }, [chatEvents, decryptMessages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0, listRef.current.scrollHeight);
    }
  }, [decryptedContent]);

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
