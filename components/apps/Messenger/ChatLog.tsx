import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { type Event } from "nostr-tools";
import {
  getKeyFromTags,
  decryptMessage,
  ascCreatedAt,
  descCreatedAt,
  convertImageLinksToHtml,
} from "components/apps/Messenger/functions";
import StyledChatLog from "components/apps/Messenger/StyledChatLog";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import ChatProfile from "components/apps/Messenger/ChatProfile";
import { clsx } from "utils/functions";
import { useNostrProfile } from "components/apps/Messenger/hooks";
import { Avatar } from "components/apps/Messenger/Icons";

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
    Record<string, string | false>
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
  const isUnknownKey = recipientPublicKey === UNKNOWN_PUBLIC_KEY;
  const { picture, userName } = useNostrProfile(
    isUnknownKey ? "" : recipientPublicKey
  );

  useEffect(() => {
    if (chatEvents) {
      decryptMessages();
      listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    }
  }, [chatEvents, decryptMessages]);

  return (
    <StyledChatLog ref={listRef}>
      {!isUnknownKey && (
        <>
          <ChatProfile publicKey={recipientPublicKey} />
          {chatEvents.sort(ascCreatedAt).map(({ id, pubkey, content }) => (
            <li
              key={id}
              className={clsx({
                "cant-decrypt": decryptedContent[id] === false,
                received: publicKey !== pubkey,
                sent: publicKey === pubkey,
              })}
            >
              {publicKey !== pubkey && (
                <div className="avatar">
                  {picture ? <img alt={userName} src={picture} /> : <Avatar />}
                </div>
              )}
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: convertImageLinksToHtml(
                    typeof decryptedContent[id] === "string"
                      ? (decryptedContent[id] as string)
                      : content
                  ),
                }}
              />
            </li>
          ))}
        </>
      )}
    </StyledChatLog>
  );
};

export default ChatLog;
