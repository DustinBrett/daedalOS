import { useCallback, useRef } from "react";
import StyledSendMessage from "components/apps/Messenger/StyledSendMessage";
import Button from "styles/common/Button";
import { useNostr } from "nostr-react";
import { createMessageEvent } from "components/apps/Messenger/functions";
import { Send } from "components/apps/Messenger/Icons";
import { haltEvent } from "utils/functions";
import { UNKNOWN_PUBLIC_KEY } from "./constants";

type SendMessageProps = { publicKey: string; recipientPublicKey: string };

const SendMessage: FC<SendMessageProps> = ({
  publicKey,
  recipientPublicKey,
}) => {
  const { publish } = useNostr();
  const inputRef = useRef<HTMLInputElement>(null);
  const isUnknownKey = recipientPublicKey === UNKNOWN_PUBLIC_KEY;
  const sendMessage = useCallback(async () => {
    const message = inputRef.current?.value;

    if (message) {
      publish(await createMessageEvent(message, publicKey, recipientPublicKey));

      inputRef.current.value = "";
    }
  }, [publicKey, publish, recipientPublicKey]);

  return (
    <StyledSendMessage>
      <input
        ref={inputRef}
        disabled={isUnknownKey}
        onKeyDown={({ key }) => {
          if (key === "Enter") sendMessage();
        }}
        placeholder="Type a message..."
        type="text"
        autoFocus
      />
      <Button
        disabled={isUnknownKey}
        onClick={sendMessage}
        onContextMenuCapture={haltEvent}
      >
        <Send />
      </Button>
    </StyledSendMessage>
  );
};

export default SendMessage;
