import { useState, useEffect } from "react";
import {
  decryptMessage,
  shortTimeStamp,
} from "components/apps/Messenger/functions";
import { FOCUSABLE_ELEMENT, MILLISECONDS_IN_MINUTE } from "utils/constants";
import { useProfile } from "nostr-react";
import { nip19, type Event } from "nostr-tools";
import { ANON_AVATAR } from "components/apps/Messenger/constants";

type ContactProps = {
  lastEvent: Event;
  onClick: () => void;
  pubkey: string;
  publicKey: string;
  recipientPublicKey: string;
};

const Contact: FC<ContactProps> = ({
  lastEvent,
  onClick,
  pubkey,
  publicKey,
  recipientPublicKey,
}) => {
  const { content = "", created_at = 0, pubkey: eventPubkey } = lastEvent || {};
  const [decryptedContent, setDecryptedContent] = useState("");
  const [timeStamp, setTimeStamp] = useState("");
  const { data: { display_name, name, npub, picture, username } = {} } =
    useProfile({ pubkey });
  const userName =
    display_name ||
    name ||
    username ||
    (npub || nip19.npubEncode(pubkey)).slice(0, 12);

  useEffect(() => {
    if (content) {
      decryptMessage(content, pubkey).then(setDecryptedContent);
    }
  }, [content, pubkey]);

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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <li
      className={recipientPublicKey === pubkey ? "selected" : undefined}
      {...FOCUSABLE_ELEMENT}
      onClick={onClick}
    >
      <figure>
        <img alt={userName} src={picture || ANON_AVATAR} />
        <figcaption>
          <span>{userName}</span>
          <div>
            <div>
              {eventPubkey === publicKey ? "You: " : ""}
              {decryptedContent || content}
            </div>
            {timeStamp ? "·" : ""}
            <div>{timeStamp}</div>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

export default Contact;
