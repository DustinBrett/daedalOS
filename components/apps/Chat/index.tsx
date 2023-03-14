import { useInference } from "components/apps/Chat/AI/useInference";
import { WELCOME_MESSAGE } from "components/apps/Chat/config";
import { getLetterTypingSpeed } from "components/apps/Chat/functions";
import { Send } from "components/apps/Chat/Send";
import StyledChat from "components/apps/Chat/StyledChat";
import StyledMessage from "components/apps/Chat/StyledMessage";
import StyledWarning from "components/apps/Chat/StyledWarning";
import type { Message } from "components/apps/Chat/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import { PREVENT_SCROLL } from "utils/constants";

const Chat: FC<ComponentProcessProps> = () => {
  const { engine: AI, error: aiError } = useInference();
  const messagesRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const initRef = useRef(false);
  const recurseWrite = useCallback(
    ([nextLetter, ...remainingText]: string[], isFirstLetter = false): void => {
      const isWriting = remainingText.length > 0;

      setMessages((currentMessages) => {
        if (isFirstLetter) {
          return [
            ...currentMessages,
            { text: nextLetter, type: "bot", writing: isWriting },
          ];
        }

        const newMessages = [...currentMessages];
        const writingIndex = newMessages.findIndex(({ writing }) => writing);

        newMessages[writingIndex] = {
          text: `${newMessages[writingIndex].text}${nextLetter}`,
          type: "bot",
          writing: isWriting,
        };

        return newMessages;
      });

      if (isWriting) {
        setTimeout(() => recurseWrite(remainingText), getLetterTypingSpeed());
      }
    },
    []
  );
  const addMessage = useCallback(
    (message: Message) => {
      const { text, type } = message;

      if (!text) return;

      if (type === "bot") {
        recurseWrite([...text], true);
      } else {
        setMessages((currentMessages) => [...currentMessages, message]);
      }
    },
    [recurseWrite]
  );
  const sendMessage = useCallback(
    (userMessage: string): void => {
      const [botMessages, userMessages] = messages.reduce(
        ([bots, users], { text, type }) =>
          type === "bot" ? [[...bots, text], users] : [bots, [...users, text]],
        [[] as string[], [] as string[]]
      );
      const message = userMessage.trim();

      AI?.chat(message, userMessages, botMessages).then((generatedMessage) =>
        addMessage({
          text: generatedMessage.trim(),
          type: "bot",
        })
      );
      addMessage({
        text: message,
        type: "user",
      });
    },
    [AI, addMessage, messages]
  );
  const translateText = useCallback(
    (text: string, originalCommand: string) => {
      addMessage({
        text: originalCommand,
        type: "user",
      });
      AI?.translation(text).then((translatedText) =>
        addMessage({
          text: `TRANSLATED: ${translatedText.trim()}`,
          type: "bot",
        })
      );
    },
    [AI, addMessage]
  );
  const updateHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      inputRef.current.style.height = `${Math.max(
        40,
        inputRef.current.scrollHeight + 10
      )}px`;
    }
  }, []);
  const onSend = useCallback(() => {
    if (inputRef.current) {
      if (inputRef.current.value.startsWith("/")) {
        const [command, ...text] = inputRef.current.value.split(" ");

        // eslint-disable-next-line sonarjs/no-small-switch
        switch (command.replace("/", "")) {
          case "translate":
            translateText(text.join(" "), inputRef.current.value);
            break;
          default:
            break;
        }
      } else {
        sendMessage(inputRef.current.value);
      }

      inputRef.current.value = "";
      setInput("");
      updateHeight();
    }
  }, [sendMessage, translateText, updateHeight]);
  const canSend = input && !messages.some(({ writing }) => writing);

  useEffect(() => {
    if (messagesRef.current && messages.length > 0) {
      messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
    }
  }, [messages]);

  useEffect(() => {
    if (initRef.current) return;

    initRef.current = true;

    AI?.init().then(() => addMessage(WELCOME_MESSAGE));
    inputRef.current?.focus(PREVENT_SCROLL);
  }, [AI, addMessage]);

  return (
    <StyledChat $hideSend={!canSend}>
      {Boolean(aiError) && (
        <StyledWarning>
          {aiError === 429
            ? "Rate limit reached. Use API token to continue."
            : ""}
        </StyledWarning>
      )}
      <ul ref={messagesRef}>
        {messages.map(({ text, type, writing }, id) => (
          // eslint-disable-next-line react/no-array-index-key
          <StyledMessage key={id} $type={type} $writing={writing}>
            {text}
          </StyledMessage>
        ))}
      </ul>
      <div>
        <textarea
          ref={inputRef}
          onInput={updateHeight}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          onKeyUp={(event) => {
            const { key, target } = event;

            if (!(target instanceof HTMLTextAreaElement)) return;

            if (key === "Enter" && target.value) {
              if (canSend) onSend();
            } else {
              setInput(target.value);
            }
          }}
          placeholder="Ask me anything..."
        />
        <Button onClick={onSend}>
          <Send />
        </Button>
      </div>
    </StyledChat>
  );
};

export default Chat;
