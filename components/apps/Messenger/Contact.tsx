import { useEffect, useRef, useState } from "react";
import {
  copyKeyMenuItems,
  shortTimeStamp,
} from "components/apps/Messenger/functions";
import { useNostrProfile } from "components/apps/Messenger/hooks";
import Profile from "components/apps/Messenger/Profile";
import { type DirectMessage } from "components/apps/Messenger/types";
import { useMenuActions } from "contexts/menu";
import { useIsVisible } from "hooks/useIsVisible";
import Button from "styles/common/Button";
import { MENU_SEPERATOR, MILLISECONDS_IN_MINUTE } from "utils/constants";

type ContactProps = {
  block: () => void;
  deleteChat: () => void;
  lastMessage?: DirectMessage;
  onClick: () => void;
  onSelect?: () => void;
  pubkey: string;
  publicKey: string;
  selected?: boolean;
  unread: boolean;
};

const Contact: FC<ContactProps> = ({
  block,
  deleteChat,
  lastMessage,
  onClick,
  onSelect,
  pubkey,
  publicKey,
  selected,
  unread,
}) => {
  const { content = "", created_at = 0, pubkey: sender } = lastMessage || {};
  const [timeStamp, setTimeStamp] = useState("");
  const elementRef = useRef<HTMLLIElement | null>(null);
  const isVisible = useIsVisible(elementRef);
  const { nip05, picture, userName } = useNostrProfile(pubkey, isVisible);
  const unreadClass = unread ? "unread" : undefined;
  const { contextMenu } = useMenuActions();
  const { onContextMenuCapture } = contextMenu(() => [
    {
      action: onClick,
      icon: "🔐",
      label: "Start end-to-end encrypted chat",
    },
    MENU_SEPERATOR,
    ...copyKeyMenuItems(pubkey),
    MENU_SEPERATOR,
    ...(lastMessage ? [{ action: deleteChat, label: "Delete chat" }] : []),
    { action: block, label: "Block" },
  ]);

  useEffect(() => {
    let interval = 0;

    if (created_at) {
      // eslint-disable-next-line react/set-state-in-effect -- The relative timestamp is refreshed on an interval
      setTimeStamp(shortTimeStamp(created_at));

      interval = window.setInterval(
        () => setTimeStamp(shortTimeStamp(created_at)),
        MILLISECONDS_IN_MINUTE
      );
    }

    return () => window.clearInterval(interval);
  }, [created_at]);

  return (
    <li
      ref={elementRef}
      className={unreadClass}
      onContextMenuCapture={onContextMenuCapture}
    >
      {onSelect && (
        <input
          aria-label={`Select ${userName || ""}`}
          checked={selected}
          onChange={onSelect}
          type="checkbox"
        />
      )}
      <Button onClick={onSelect || onClick}>
        <Profile
          nip05={nip05}
          picture={picture}
          pubkey={pubkey}
          userName={userName}
        >
          <div>
            <div className={unreadClass}>
              {sender === publicKey ? "You: " : ""}
              {content}
            </div>
            {timeStamp ? "·" : ""}
            <div>{timeStamp}</div>
          </div>
        </Profile>
      </Button>
    </li>
  );
};

export default Contact;
