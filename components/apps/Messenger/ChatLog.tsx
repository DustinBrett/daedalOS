import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import type { Event } from "nostr-tools";
import {
  getKeyFromTags,
  decryptMessage,
  ascCreatedAt,
  descCreatedAt,
} from "components/apps/Messenger/functions";
import StyledChatLog from "components/apps/Messenger/StyledChatLog";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import ChatProfile from "components/apps/Messenger/ChatProfile";

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
      {recipientPublicKey !== UNKNOWN_PUBLIC_KEY && (
        <>
          <ChatProfile publicKey={recipientPublicKey} />
          {chatEvents.sort(ascCreatedAt).map(({ id, pubkey, content }) => (
            <li key={id} className={publicKey === pubkey ? "sent" : "received"}>
              {decryptedContent[id] || content}
            </li>
          ))}
        </>
      )}
    </StyledChatLog>
  );
};

export default ChatLog;
