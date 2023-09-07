import { useMemo, useCallback, useEffect, useRef, useState } from "react";
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
  const decryptMessages = useCallback(
    async (): Promise<void> =>
      setDecryptedContent(
        Object.fromEntries(
          await Promise.all(
            chatEvents.map<Promise<[string, string]>>(
              async ({ content, id }) => [
                id,
                await decryptMessage(id, content, recipientPublicKey),
              ]
            )
          )
        )
      ),
    [chatEvents, recipientPublicKey]
  );
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (chatEvents) {
      decryptMessages().then(() => {
        if (listRef.current) {
          listRef.current.scrollTo(0, listRef.current.scrollHeight);
        }
      });
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
