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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [canSend, setCanSend] = useState(false);
  const isUnknownKey = recipientPublicKey === UNKNOWN_PUBLIC_KEY;
  const sendMessage = useCallback(
    async (message: string) => {
      publish(await createMessageEvent(message, publicKey, recipientPublicKey));

      if (inputRef.current?.value) inputRef.current.value = "";

      setCanSend(false);
    },
    [publicKey, publish, recipientPublicKey]
  );
  const updateHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      inputRef.current.style.height = `${Math.max(
        35,
        inputRef.current.scrollHeight + 4
      )}px`;
    }
  }, []);

  return (
    <StyledSendMessage>
      <textarea
        ref={inputRef}
        disabled={isUnknownKey}
        onChange={() => {
          setCanSend(Boolean(inputRef.current?.value));
          updateHeight();
        }}
        onKeyDown={async (event) => {
          const { key, shiftKey } = event;
          const message = inputRef.current?.value.trim();

          if (message && key === "Enter" && !shiftKey) {
            event.preventDefault();
            await sendMessage(message);
          } else setCanSend(Boolean(message));

          updateHeight();
        }}
        placeholder="Type a message..."
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
