import { useEffect, useRef, useState } from "react";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import { Send } from "components/apps/Messenger/Icons";
import {
  useIsLegacyChat,
  useMessageContext,
} from "components/apps/Messenger/MessageContext";
import StyledSendMessage from "components/apps/Messenger/StyledSendMessage";
import Button from "styles/common/Button";
import { PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";
import { isComposingKey, whenFocusLost } from "utils/keyboard";

const SendMessage: FC<{ recipientPublicKey: string }> = ({
  recipientPublicKey,
}) => {
  const { sendMessage } = useMessageContext();
  const legacy = useIsLegacyChat(recipientPublicKey);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [canSend, setCanSend] = useState(false);
  const isUnknownKey = recipientPublicKey === UNKNOWN_PUBLIC_KEY;
  const updateHeight = (): void => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      inputRef.current.style.height = `${Math.max(
        35,
        inputRef.current.scrollHeight + 4
      )}px`;
    }
  };

  useEffect(() => {
    // Picking a recipient removes the To box that had focus
    if (!isUnknownKey) {
      whenFocusLost(() => inputRef.current?.focus(PREVENT_SCROLL));
    }
  }, [isUnknownKey]);

  const send = async (): Promise<void> => {
    const input = inputRef.current;
    const message = input?.value.trim();

    if (!input || !message) return;

    // Clear first so a slow extension signature can't be sent twice
    input.value = "";
    setCanSend(false);
    updateHeight();

    try {
      await sendMessage(recipientPublicKey, message, legacy);
    } catch {
      input.value = message;
      setCanSend(true);
      updateHeight();
    }
  };

  return (
    <StyledSendMessage>
      <textarea
        ref={inputRef}
        aria-label="Type a message"
        disabled={isUnknownKey}
        onChange={() => {
          setCanSend(Boolean(inputRef.current?.value.trim()));
          updateHeight();
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !isComposingKey(event.nativeEvent)
          ) {
            event.preventDefault();
            send();
          }
        }}
        placeholder="Type a message..."
        autoFocus
      />
      <Button
        aria-label="Send"
        disabled={isUnknownKey || !canSend}
        onClick={send}
        onContextMenuCapture={haltEvent}
      >
        <Send />
      </Button>
    </StyledSendMessage>
  );
};

export default SendMessage;
