import { useState, useEffect } from "react";
import type { Message as MessageType } from "components/apps/Messenger/types";
import { decryptMessage } from "components/apps/Messenger/functions";
import { MILLISECONDS_IN_SECOND } from "utils/constants";
import { useProfile } from "nostr-react";

const Message: FC<{ message: MessageType }> = ({ message }) => {
  const { content, created_at, pubkey, sent } = message;
  const [decryptedContent, setDecryptedContent] = useState("");
  const { data: { name } = {} } = useProfile({ pubkey });

  useEffect(() => {
    if (!decryptedContent) {
      decryptMessage(content, pubkey).then(setDecryptedContent);
    }
  }, [content, decryptedContent, pubkey]);

  return (
    <li className={sent ? "sent" : "received"}>
      {decryptedContent || content}
      <span>
        {new Date(created_at * MILLISECONDS_IN_SECOND).toLocaleString()}
      </span>
      <span>{name || pubkey.slice(0, 8)}</span>
    </li>
  );
};

export default Message;
