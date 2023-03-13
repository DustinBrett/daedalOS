import { Send } from "components/apps/Chat/Send";
import StyledChat from "components/apps/Chat/StyledChat";
import StyledWarning from "components/apps/Chat/StyledWarning";
import { inference } from "components/system/AI/inference";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import { PREVENT_SCROLL } from "utils/constants";

type Message = {
  text: string;
  type: "bot" | "user";
  writing?: boolean;
};

const WELCOME_MESSAGE = {
  text: "Hello, I'm an AI assistant. How can I help you?",
  type: "bot",
} as Message;

const MAX_TYPING_SPEED_MS = 15;

const getLetterTypingSpeed = (): number => {
  const randomNumber = Math.random();
  let maxSpeed = MAX_TYPING_SPEED_MS * 2;

  if (randomNumber < 0.5) maxSpeed = MAX_TYPING_SPEED_MS * 3;
  else if (randomNumber < 0.7) maxSpeed = MAX_TYPING_SPEED_MS * 4;
  else maxSpeed = MAX_TYPING_SPEED_MS * 5;

  return Math.floor(
    randomNumber * (maxSpeed - MAX_TYPING_SPEED_MS + 1) + MAX_TYPING_SPEED_MS
  );
};

const Chat: FC<ComponentProcessProps> = () => {
  const AI = inference();
  const messagesRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const initRef = useRef(false);
  const addMessage = useCallback((message: Message) => {
    const { text, type } = message;

    if (!text) return;

    const recurseWrite = (
      [nextLetter, ...remainingText]: string[],
      isFirstLetter = false
    ): void => {
      const isWriting = remainingText.length > 0;

      setMessages((currentMessages) => {
        if (isFirstLetter) {
          return [
            ...currentMessages,
            { text: nextLetter, type, writing: isWriting },
          ];
        }

        const newMessages = [...currentMessages];
        const writingIndex = newMessages.findIndex(({ writing }) => writing);

        newMessages[writingIndex] = {
          text: `${newMessages[writingIndex].text}${nextLetter}`,
          type,
          writing: isWriting,
        };

        return newMessages;
      });

      if (isWriting) {
        setTimeout(() => recurseWrite(remainingText), getLetterTypingSpeed());
      }
    };

    if (type === "bot") {
      recurseWrite([...text], true);
    } else {
      setMessages((currentMessages) => [...currentMessages, message]);
    }
  }, []);
  const sendMessage = useCallback(
    (userMessage: string): void => {
      const [botMessages, userMessages] = messages.reduce(
        ([bots, users], { text, type }) =>
          type === "bot" ? [[...bots, text], users] : [bots, [...users, text]],
        [[] as string[], [] as string[]]
      );

      AI.chat(userMessage, userMessages, botMessages).then((generatedMessage) =>
        addMessage({
          text: generatedMessage,
          type: "bot",
        })
      );
      addMessage({
        text: userMessage,
        type: "user",
      });
    },
    [AI, addMessage, messages]
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
      sendMessage(inputRef.current.value);
      inputRef.current.value = "";
      setInput("");
      updateHeight();
    }
  }, [sendMessage, updateHeight]);
  const canSend = input && !messages.some(({ writing }) => writing);

  useEffect(() => {
    if (messagesRef.current && messages.length > 0) {
      messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
    }
  }, [messages]);

  useEffect(() => {
    if (initRef.current) return;

    initRef.current = true;

    AI.init().then(() => addMessage(WELCOME_MESSAGE));
    inputRef.current?.focus(PREVENT_SCROLL);
  }, [AI, addMessage]);

  return (
    <StyledChat $hideSend={!canSend}>
      {AI.limitReached && (
        <StyledWarning>
          Rate limit reached. Use API token to continue.
        </StyledWarning>
      )}
      <ul ref={messagesRef}>
        {messages.map(({ text, type }, id) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={id} className={type}>
            {text}
          </li>
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
