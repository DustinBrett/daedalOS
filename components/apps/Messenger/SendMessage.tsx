import { useCallback, useRef, useState } from "react";
import StyledSendMessage from "components/apps/Messenger/StyledSendMessage";
import Button from "styles/common/Button";
import { useNostr } from "nostr-react";
import { createMessageEvent } from "components/apps/Messenger/functions";
import { Send } from "components/apps/Messenger/Icons";
import { haltEvent } from "utils/functions";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";

type SendMessageProps = { publicKey: string; recipientPublicKey: string };

const SendMessage: FC<SendMessageProps> = ({
  publicKey,
  recipientPublicKey,
}) => {
  const { publish } = useNostr();
  const inputRef = useRef<HTMLInputElement>(null);
  const [canSend, setCanSend] = useState(false);
  const isUnknownKey = recipientPublicKey === UNKNOWN_PUBLIC_KEY;
  const sendMessage = useCallback(
    async (message: string) =>
      publish(await createMessageEvent(message, publicKey, recipientPublicKey)),
    [publicKey, publish, recipientPublicKey]
  );

  return (
    <StyledSendMessage>
      <input
        ref={inputRef}
        disabled={isUnknownKey}
        onChange={() => setCanSend(Boolean(inputRef.current?.value))}
        onKeyDown={({ key }) => {
          const message = inputRef.current?.value;

          if (message && key === "Enter") {
            sendMessage(message);
            inputRef.current.value = "";
          }

          setCanSend(Boolean(message));
        }}
        placeholder="Type a message..."
        type="text"
        autoFocus
      />
      <Button
        disabled={isUnknownKey || !canSend}
        onClick={() =>
          inputRef.current?.value && sendMessage(inputRef.current.value)
        }
        onContextMenuCapture={haltEvent}
      >
        <Send />
      </Button>
    </StyledSendMessage>
  );
};

export default SendMessage;
