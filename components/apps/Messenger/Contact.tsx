import { useState, useEffect, useMemo } from "react";
import {
  decryptMessage,
  shortTimeStamp,
} from "components/apps/Messenger/functions";
import { MILLISECONDS_IN_MINUTE } from "utils/constants";
import { nip19, type Event } from "nostr-tools";
import { useNostrProfile } from "components/apps/Messenger/hooks";
import { Avatar } from "components/apps/Messenger/Icons";
import Button from "styles/common/Button";
import { useMenu } from "contexts/menu";

type ContactProps = {
  lastEvent: Event;
  onClick: () => void;
  pubkey: string;
  publicKey: string;
  unreadEvent: boolean;
};

const Contact: FC<ContactProps> = ({
  lastEvent,
  onClick,
  pubkey,
  publicKey,
  unreadEvent,
}) => {
  const {
    content = "",
    created_at = 0,
    id,
    pubkey: eventPubkey,
  } = lastEvent || {};
  const [decryptedContent, setDecryptedContent] = useState("");
  const [timeStamp, setTimeStamp] = useState("");
  const { picture, userName } = useNostrProfile(pubkey);
  const unreadClass = unreadEvent ? "unread" : undefined;
  const { contextMenu } = useMenu();
  const { onContextMenuCapture } = useMemo(
    () =>
      contextMenu?.(() => [
        {
          action: () =>
            navigator.clipboard?.writeText(nip19.npubEncode(pubkey)),
          label: "Copy npub address",
        },
      ]),
    [contextMenu, pubkey]
  );

  useEffect(() => {
    if (content) {
      decryptMessage(id, content, pubkey).then(setDecryptedContent);
    }
  }, [content, id, pubkey]);

  useEffect(() => {
    let interval = 0;

    if (created_at) {
      setTimeStamp(shortTimeStamp(created_at));

      interval = window.setInterval(
        () => setTimeStamp(shortTimeStamp(created_at)),
        MILLISECONDS_IN_MINUTE
      );
    }

    return () => window.clearInterval(interval);
  }, [created_at, lastEvent]);

  return (
    <li className={unreadClass} onContextMenuCapture={onContextMenuCapture}>
      <Button onClick={onClick}>
        <figure>
          {picture ? <img alt={userName} src={picture} /> : <Avatar />}
          <figcaption>
            <span>{userName}</span>
            <div>
              <div className={unreadClass}>
                {eventPubkey === publicKey ? "You: " : ""}
                {decryptedContent || content}
              </div>
              {timeStamp ? "·" : ""}
              <div>{timeStamp}</div>
            </div>
          </figcaption>
        </figure>
      </Button>
    </li>
  );
};

export default Contact;
