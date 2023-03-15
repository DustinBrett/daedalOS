import { commandEmoji, EngineErrorMessage } from "components/apps/Chat/config";
import { getLetterTypingSpeed } from "components/apps/Chat/functions";
import { Send } from "components/apps/Chat/Send";
import StyledChat from "components/apps/Chat/StyledChat";
import StyledMessage from "components/apps/Chat/StyledMessage";
import StyledWarning from "components/apps/Chat/StyledWarning";
import type { Message } from "components/apps/Chat/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { useInference } from "hooks/useInference/useInference";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "styles/common/Button";
import { PREVENT_SCROLL } from "utils/constants";
import { bufferToUrl } from "utils/functions";

const Chat: FC<ComponentProcessProps> = ({ id }) => {
  const { aiApi } = useSession();
  const { title } = useProcesses();
  const [engine, apiKey] = useMemo(() => aiApi.split(":"), [aiApi]);
  const { engine: AI, error: aiError, resetError } = useInference(engine);
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
            { text: nextLetter, type: "assistant", writing: isWriting },
          ];
        }

        const newMessages = [...currentMessages];
        const writingIndex = newMessages.findIndex(({ writing }) => writing);

        newMessages[writingIndex] = {
          text: `${newMessages[writingIndex].text}${nextLetter}`,
          type: "assistant",
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
      const { image, text, type } = message;

      if (!text) return;

      if (type === "assistant" && !image) {
        recurseWrite([...text], true);
      } else {
        setMessages((currentMessages) => [...currentMessages, message]);
      }
    },
    [recurseWrite]
  );
  const sendMessage = useCallback(
    (userMessage: string): void => {
      const [botMessages, userMessages] = messages
        .map((message) => {
          if (message.command && message.type === "user") {
            return {
              ...message,
              text: `${message.command.replace("/", "").toUpperCase()}: ${
                message.text
              }`,
            };
          }

          if (message.image && message.type === "assistant") {
            return { ...message, text: `IMAGE: ${message.text}` };
          }

          return message;
        })
        .reduce(
          ([bots, users], { text, type }) =>
            type === "assistant"
              ? [[...bots, text], users]
              : [bots, [...users, text]],
          [[] as string[], [] as string[]]
        );
      const userText = userMessage.trim();

      AI?.chat(userText, userMessages, botMessages, messages).then(
        (generatedMessage) =>
          addMessage({ text: generatedMessage.trim(), type: "assistant" })
      );
      addMessage({ text: userText, type: "user" });
    },
    [AI, addMessage, messages]
  );
  const addCommandMessage = useCallback(
    (
      commandPromise: Promise<Buffer | string | void>,
      originalCommand: string,
      resultLabel?: string
    ): void => {
      const [command, ...originalText] = originalCommand.split(" ");
      const text = originalText.join(" ");

      addMessage({ command, text, type: "user" });
      commandPromise.then(
        (response) =>
          response &&
          addMessage({
            command,
            ...(typeof response === "string"
              ? { text: `${resultLabel || "RESPONSE"}: ${response.trim()}` }
              : { image: bufferToUrl(response), text }),
            type: "assistant",
          })
      );
    },
    [addMessage]
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
    if (inputRef.current && AI) {
      if (inputRef.current.value.startsWith("/")) {
        const [command, ...text] = inputRef.current.value.split(" ");
        const commandText = text.join(" ");

        switch (command.replace("/", "")) {
          case "draw":
            addCommandMessage(AI.draw(commandText), inputRef.current.value);
            break;
          case "summarize":
            addCommandMessage(
              AI.summarization(commandText),
              inputRef.current.value,
              "SUMMARY"
            );
            break;
          case "translate":
            addCommandMessage(
              AI.translation(commandText),
              inputRef.current.value,
              "TRANSLATION"
            );
            break;
          default:
            sendMessage(inputRef.current.value);
            break;
        }
      } else {
        sendMessage(inputRef.current.value);
      }

      resetError();
      inputRef.current.value = "";
      setInput("");
      updateHeight();
    }
  }, [AI, addCommandMessage, resetError, sendMessage, updateHeight]);
  const canSend = input && !messages.some(({ writing }) => writing);

  useEffect(() => {
    if (engine) {
      title(id, `${processDirectory.Chat.title} (${engine})`);
    }
  }, [engine, id, title]);

  useEffect(() => {
    if (messagesRef.current && messages.length > 0) {
      messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
    }
  }, [messages]);

  useEffect(() => {
    if (initRef.current) return;

    initRef.current = true;

    AI?.init(apiKey).then(() => addMessage(AI?.greeting));
    inputRef.current?.focus(PREVENT_SCROLL);
  }, [AI, addMessage, apiKey]);

  return (
    <StyledChat $hideSend={!canSend}>
      <ul ref={messagesRef}>
        {messages.map(({ command, image, text, type, writing }, messageId) => (
          <StyledMessage
            // eslint-disable-next-line react/no-array-index-key
            key={messageId}
            $image={image}
            $isCommand={Boolean(command)}
            $type={type}
            $writing={writing}
            title={image ? text : ""}
          >
            {command && type !== "assistant" ? `${commandEmoji[command]} ` : ""}
            {image ? "" : text}
          </StyledMessage>
        ))}
        {Boolean(aiError && EngineErrorMessage[aiError]) && (
          <StyledWarning>{EngineErrorMessage[aiError]}</StyledWarning>
        )}
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
