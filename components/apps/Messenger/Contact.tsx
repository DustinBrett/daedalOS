import { useState, useEffect } from "react";
import {
  decryptMessage,
  getKeyFromTags,
} from "components/apps/Messenger/functions";
import {
  FOCUSABLE_ELEMENT,
  MILLISECONDS_IN_MINUTE,
  MILLISECONDS_IN_SECOND,
} from "utils/constants";
import { useProfile } from "nostr-react";
import { nip19, type Event } from "nostr-tools";
import { ANON_AVATAR } from "components/apps/Messenger/constants";

const shortTimeStamp = (timestamp: number): string => {
  const now = Date.now();
  const time = new Date(timestamp * MILLISECONDS_IN_SECOND).getTime();
  const diff = now - time;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks}w`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;

  return `${seconds}s`;
};

const Contact: FC<{ lastEvent: Event; publicKey: string }> = ({
  lastEvent,
  publicKey,
}) => {
  const { content, created_at, pubkey: eventPubkey, tags } = lastEvent;
  const sent = eventPubkey === publicKey;
  const pubkey = sent ? getKeyFromTags(tags) : eventPubkey;
  const [decryptedContent, setDecryptedContent] = useState("");
  const [timeStamp, setTimeStamp] = useState(() => shortTimeStamp(created_at));
  const profile = useProfile({ pubkey });
  const { data: { display_name, name, npub, picture, username } = {} } =
    profile;
  const userName =
    display_name ||
    name ||
    username ||
    (npub || nip19.npubEncode(pubkey)).slice(0, 12);

  useEffect(() => {
    if (!decryptedContent) {
      decryptMessage(content, pubkey).then(setDecryptedContent);
    }
  }, [content, decryptedContent, pubkey]);

  useEffect(() => {
    let interval = 0;

    if (created_at) {
      interval = window.setInterval(
        () => setTimeStamp(shortTimeStamp(created_at)),
        MILLISECONDS_IN_MINUTE
      );
    }

    return () => window.clearInterval(interval);
  }, [created_at]);

  return (
    <li {...FOCUSABLE_ELEMENT}>
      <figure>
        <img alt={userName} src={picture || ANON_AVATAR} />
        <figcaption>
          <span>{userName}</span>
          <div>
            <div>
              {sent ? "You: " : ""}
              {decryptedContent || content}
            </div>
            ·<div>{timeStamp}</div>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

export default Contact;
