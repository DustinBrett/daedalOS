import { useState, useEffect } from "react";
import type { Message as MessageType } from "components/apps/Messenger/types";
import { decryptMessage } from "components/apps/Messenger/functions";
import { MILLISECONDS_IN_SECOND } from "utils/constants";
import { useProfile } from "nostr-react";

const Message: FC<{ message: MessageType }> = ({ message }) => {
  const [decryptedContent, setDecryptedContent] = useState("");
  const { data: userData } = useProfile({
    pubkey: message.pubkey,
  });

  // return (
  //   <>
  //     <p>Name: {userData?.name}</p>
  //     <p>Public key: {userData?.npub}</p>
  //     <p>Picture URL: {userData?.picture}</p>
  //   </>
  // )

  useEffect(() => {
    if (!decryptedContent) {
      decryptMessage(message).then(setDecryptedContent);
    }
  }, [decryptedContent, message]);

  return (
    <li className={message.sent ? "sent" : "received"}>
      {decryptedContent || message.content}
      <span>
        {new Date(message.created_at * MILLISECONDS_IN_SECOND).toLocaleString()}
      </span>
      <span>{userData?.name || message.pubkey.slice(0, 8)}</span>
    </li>
  );
};

export default Message;
