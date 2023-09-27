import { Send } from "components/apps/Messenger/Icons";
import { useMessageContext } from "components/apps/Messenger/MessageContext";
import StyledSendMessage from "components/apps/Messenger/StyledSendMessage";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import { createMessageEvent } from "components/apps/Messenger/functions";
import { useNostr } from "nostr-react";
import { useCallback, useRef, useState } from "react";
import Button from "styles/common/Button";
import { haltEvent } from "utils/functions";

const SendMessage: FC<{ recipientPublicKey: string }> = ({
  recipientPublicKey,
}) => {
  const { publicKey, sendingEvent } = useMessageContext();
  const { publish } = useNostr();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [canSend, setCanSend] = useState(false);
  const isUnknownKey = recipientPublicKey === UNKNOWN_PUBLIC_KEY;
  const sendMessage = useCallback(
    async (message: string) => {
      const event = await createMessageEvent(
        message,
        publicKey,
        recipientPublicKey
      );

      sendingEvent(event);

      try {
        publish(event);
      } catch {
        // Ignore error during publish
      }

      if (inputRef.current?.value) inputRef.current.value = "";

      setCanSend(false);
    },
    [publicKey, publish, recipientPublicKey, sendingEvent]
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
