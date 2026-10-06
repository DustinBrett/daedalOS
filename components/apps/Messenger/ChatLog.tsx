import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import ChatProfile from "components/apps/Messenger/ChatProfile";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import { prettyChatTimestamp } from "components/apps/Messenger/functions";
import { useNostrProfile } from "components/apps/Messenger/hooks";
import {
  Avatar,
  CheckCircle,
  CheckFullCircle,
} from "components/apps/Messenger/Icons";
import {
  useMessageContext,
  useMessages,
} from "components/apps/Messenger/MessageContext";
import StyledChatLog from "components/apps/Messenger/StyledChatLog";
import { clsx } from "utils/functions";

const SanitizedContent = dynamic(
  () => import("components/apps/Messenger/SanitizedContent")
);

const STATUS_LABELS = { failed: "Not sent", sending: "Sending" };

const ChatLog: FC<{ recipientPublicKey: string }> = ({
  recipientPublicKey,
}) => {
  const { publicKey } = useMessageContext();
  const messages = useMessages(recipientPublicKey);
  const listRef = useRef<HTMLOListElement>(null);
  const isUnknownKey = recipientPublicKey === UNKNOWN_PUBLIC_KEY;
  const { picture, userName } = useNostrProfile(
    isUnknownKey ? "" : recipientPublicKey
  );

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    }
  }, [messages]);

  return (
    <StyledChatLog ref={listRef} aria-label="Messages" aria-live="polite">
      {!isUnknownKey && (
        <>
          <ChatProfile publicKey={recipientPublicKey} />
          {messages.map(([timestamp, group], groupIndex) =>
            group.map(
              ({ content, created_at, id, pubkey, status }, messageIndex) => (
                <li
                  key={id}
                  className={clsx({
                    failed: status === "failed",
                    received: publicKey !== pubkey,
                    sent: publicKey === pubkey,
                  })}
                  data-timestamp={messageIndex === 0 ? timestamp : undefined}
                  title={prettyChatTimestamp(created_at)}
                >
                  {publicKey !== pubkey && (
                    <div className="avatar">
                      {picture ? (
                        <img alt={userName} decoding="async" src={picture} />
                      ) : (
                        <Avatar />
                      )}
                    </div>
                  )}
                  <SanitizedContent content={content} />
                  {publicKey === pubkey &&
                    (status ||
                      (groupIndex === messages.length - 1 &&
                        messageIndex === group.length - 1)) && (
                      <div
                        className="status"
                        title={status ? STATUS_LABELS[status] : "Sent"}
                      >
                        {status ? <CheckCircle /> : <CheckFullCircle />}
                      </div>
                    )}
                </li>
              )
            )
          )}
        </>
      )}
    </StyledChatLog>
  );
};

export default ChatLog;
