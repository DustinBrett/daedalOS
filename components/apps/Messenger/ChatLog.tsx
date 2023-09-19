import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { type Event } from "nostr-tools";
import {
  getKeyFromTags,
  decryptMessage,
  convertImageLinksToHtml,
  groupChatEvents,
  prettyChatTimestamp,
} from "components/apps/Messenger/functions";
import StyledChatLog from "components/apps/Messenger/StyledChatLog";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import ChatProfile from "components/apps/Messenger/ChatProfile";
import { clsx } from "utils/functions";
import { Avatar } from "components/apps/Messenger/Icons";
import { useNostrProfile } from "components/apps/Messenger/ProfileContext";
import type { DecryptedContent } from "components/apps/Messenger/types";
import * as DOMPurify from "dompurify";

const ChatLog: FC<{
  events: Event[];
  publicKey: string;
  recipientPublicKey: string;
}> = ({ events, publicKey, recipientPublicKey }) => {
  const chatEvents = useMemo(
    () =>
      groupChatEvents(
        events.filter(({ pubkey, tags }) => {
          const isSender = pubkey === recipientPublicKey;
          const isRecipient = getKeyFromTags(tags) === recipientPublicKey;

          return recipientPublicKey === publicKey
            ? isSender && isRecipient
            : isSender || isRecipient;
        })
      ),
    [events, publicKey, recipientPublicKey]
  );
  const [decryptedContent, setDecryptedContent] = useState<DecryptedContent>(
    {}
  );
  const decryptMessages = useCallback(
    () =>
      [...chatEvents].reverse().forEach(([, eventGroup]) =>
        [...eventGroup].reverse().forEach(({ content, id }) =>
          decryptMessage(id, content, recipientPublicKey).then((message) =>
            setDecryptedContent((currentDecryptedContent) => ({
              ...currentDecryptedContent,
              [id]: message || false,
            }))
          )
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
          {chatEvents.map(([timestamp, eventGroup]) =>
            eventGroup.map(({ created_at, id, pubkey, content }, index) => (
              <li
                key={id}
                className={clsx({
                  "cant-decrypt": decryptedContent[id] === false,
                  received: publicKey !== pubkey,
                  sent: publicKey === pubkey,
                })}
                data-timestamp={index === 0 ? timestamp : undefined}
                title={prettyChatTimestamp(created_at)}
              >
                {publicKey !== pubkey && (
                  <div className="avatar">
                    {picture ? (
                      <img alt={userName} src={picture} />
                    ) : (
                      <Avatar />
                    )}
                  </div>
                )}
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      convertImageLinksToHtml(
                        typeof decryptedContent[id] === "string"
                          ? (decryptedContent[id] as string)
                          : content
                      ),
                      { USE_PROFILES: { html: false } }
                    ),
                  }}
                />
              </li>
            ))
          )}
        </>
      )}
    </StyledChatLog>
  );
};

export default ChatLog;
