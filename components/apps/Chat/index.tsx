import {
  AI_IMAGES_FOLDER,
  commandMap,
  EngineErrorMessage,
} from "components/apps/Chat/config";
import { getLetterTypingSpeed } from "components/apps/Chat/functions";
import { Send } from "components/apps/Chat/Send";
import StyledChat from "components/apps/Chat/StyledChat";
import StyledInfo from "components/apps/Chat/StyledInfo";
import StyledInputArea from "components/apps/Chat/StyledInputArea";
import StyledLoadingEllipsis from "components/apps/Chat/StyledLoadingEllipsis";
import StyledMessage from "components/apps/Chat/StyledMessage";
import StyledWarning from "components/apps/Chat/StyledWarning";
import type { Message } from "components/apps/Chat/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { getMimeType } from "components/system/Files/FileEntry/functions";
import { removeInvalidFilenameCharacters } from "components/system/Files/FileManager/functions";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { useInference } from "hooks/useInference/useInference";
import { basename, join } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "styles/common/Button";
import { IMAGE_FILE_EXTENSIONS, PREVENT_SCROLL } from "utils/constants";
import {
  bufferToUrl,
  generatePrettyTimestamp,
  getExtension,
  loadFiles,
} from "utils/functions";

type ActionMessage = {
  command: string;
  text: string;
  timestamp: number;
};

const Chat: FC<ComponentProcessProps> = ({ id }) => {
  const { aiApi, setWallpaper } = useSession();
  const { readFile, mkdirRecursive, writeFile } = useFileSystem();
  const {
    processes: { [id]: process },
    title,
    url: setUrl,
  } = useProcesses();
  const { url } = process || {};
  const [engine, apiKey] = useMemo(() => aiApi.split(":"), [aiApi]);
  const {
    engine: AI,
    error: aiError,
    name,
    resetError,
  } = useInference(apiKey, engine);
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
  const [responsingToChat, setResponsingToChat] = useState(false);
  const waitForChat = useCallback(
    async (promiseRequest?: Promise<string>): Promise<string> => {
      if (!promiseRequest) return "";

      setResponsingToChat(true);

      const resolvedPromise = await promiseRequest;

      setResponsingToChat(false);

      return resolvedPromise;
    },
    []
  );
  const [status, setStatus] = useState<string>("");
  const statusLogger = useCallback((type: string, message: string) => {
    setStatus(type && message ? `${type} ${message}` : "");
  }, []);
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

      waitForChat(
        AI.chat(userText, userMessages, botMessages, messages, statusLogger)
      ).then(async (generatedMessage) => {
        if (generatedMessage) {
          if (!window.marked?.parse) {
            await loadFiles(["/Program Files/Marked/marked.min.js"]);
          }

          addMessage({
            text: window.marked.parse(generatedMessage.trim(), {
              headerIds: false,
            }),
            type: "assistant",
          });
        }
      });
      addMessage({ text: userText, type: "user" });
    },
    [AI, addMessage, messages, statusLogger, waitForChat]
  );
  const [awaitingRequests, setAwaitingRequests] = useState<ActionMessage[]>([]);
  const waitForRequest = useCallback(
    async (
      command: string,
      text: string,
      promiseRequest: Promise<Buffer | string | void>
    ): Promise<Buffer | string | void> => {
      const timestamp = Date.now();

      setResponsingToChat(true);
      setAwaitingRequests((currentRequests) => [
        ...currentRequests,
        { command, text, timestamp },
      ]);

      const resolvedPromise = await promiseRequest;

      setAwaitingRequests((currentRequests) =>
        currentRequests.filter(
          ({ timestamp: requestTimestamp }) => requestTimestamp !== timestamp
        )
      );
      setResponsingToChat(false);

      return resolvedPromise;
    },
    []
  );
  const addCommandMessage = useCallback(
    (
      commandPromise: Promise<Buffer | string | void>,
      originalCommand: string,
      resultLabel: string
    ): void => {
      const [command, ...originalText] = originalCommand.split(" ");
      const text = originalText.join(" ");

      addMessage({ command, text, type: "user" });
      waitForRequest(command, text, commandPromise).then(
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
    [addMessage, waitForRequest]
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
  const saveImage = useCallback(
    async (
      text: string,
      image: Buffer,
      setAsWallpaper: boolean
    ): Promise<void> => {
      try {
        const imagePath = join(
          AI_IMAGES_FOLDER,
          `${removeInvalidFilenameCharacters(
            text
          )} (${generatePrettyTimestamp()}).jpg`
        );

        await mkdirRecursive(AI_IMAGES_FOLDER);
        await writeFile(imagePath, image, true);

        if (setAsWallpaper) setWallpaper(imagePath);
      } catch {
        // Ignore failure to save image
      }
    },
    [mkdirRecursive, setWallpaper, writeFile]
  );
  const onSend = useCallback(async () => {
    if (inputRef.current && AI) {
      if (inputRef.current.value.startsWith("/")) {
        const [command, ...text] = inputRef.current.value.split(" ");
        const commandText = text.join(" ");

        switch (command) {
          case "/classify":
            addCommandMessage(
              AI.classify(
                commandText,
                Object.keys(commandMap)
                  .map((entry) => entry.replace("/", ""))
                  .filter((entry) => entry !== "classify")
              ),
              inputRef.current.value,
              "CLASSIFYING"
            );
            break;
          case "/draw":
          case "/wallpaper":
            addCommandMessage(
              AI.draw(commandText).then((image) => {
                if (image) {
                  saveImage(commandText, image, command === "/wallpaper");
                }

                return image;
              }),
              inputRef.current.value,
              "DRAWING"
            );
            break;
          case "/caption":
            addCommandMessage(
              AI.imageToText(
                basename(commandText),
                getMimeType(commandText),
                await readFile(commandText)
              ),
              inputRef.current.value,
              "CAPTIONING"
            );
            break;
          case "/summarize":
            addCommandMessage(
              AI.summarization(commandText),
              inputRef.current.value,
              "SUMMARY"
            );
            break;
          case "/translate":
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
  }, [
    AI,
    addCommandMessage,
    readFile,
    resetError,
    saveImage,
    sendMessage,
    updateHeight,
  ]);
  const isWritingMessage = useMemo(
    () => messages.some(({ writing }) => writing),
    [messages]
  );
  const isResponding = responsingToChat || isWritingMessage;
  const canSend = input && !isResponding;

  useEffect(() => {
    if (name) {
      title(id, `${processDirectory.Chat.title} (${name})`);
    }
  }, [id, name, title]);

  useEffect(() => {
    if (messagesRef.current && messages.length > 0) {
      messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
    }
  }, [messages]);

  useEffect(() => {
    let cleanUp: (() => void) | undefined;

    if (initRef.current) {
      cleanUp = () => AI?.destroy?.();
    } else {
      initRef.current = true;

      AI.init().then(() => addMessage(AI.greeting));
      inputRef.current?.focus(PREVENT_SCROLL);
    }

    return cleanUp;
  }, [AI, addMessage, apiKey]);

  useEffect(() => {
    if (
      url &&
      inputRef.current &&
      IMAGE_FILE_EXTENSIONS.has(getExtension(url))
    ) {
      const newInput = `${input ? "" : "/caption "}${input}${
        input ? " " : ""
      }${url}`;

      inputRef.current.value = newInput;
      setInput(newInput);
      updateHeight();
      setUrl(id, "");
    }
  }, [id, input, setUrl, updateHeight, url]);

  return (
    <StyledChat {...useFileDrop({ id })}>
      <ul ref={messagesRef}>
        {messages.map(({ command, image, text, type, writing }, messageId) => {
          const isAssistant = type === "assistant";
          const displayText =
            command || !isAssistant ? (
              text
            ) : (
              <span
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: `${text}${
                    writing ? "<span class='cursor'>|</span>" : ""
                  }`,
                }}
              />
            );

          return (
            <StyledMessage
              // eslint-disable-next-line react/no-array-index-key
              key={messageId}
              $image={image}
              $isCommand={Boolean(command)}
              $type={type}
              title={image ? text : ""}
            >
              {command && !isAssistant ? `${commandMap[command].icon} ` : ""}
              {image ? "" : displayText}
            </StyledMessage>
          );
        })}
        {Boolean(aiError && EngineErrorMessage[aiError]) && (
          <StyledWarning>{EngineErrorMessage[aiError]}</StyledWarning>
        )}
        {awaitingRequests.map(({ command, text }) => (
          <StyledInfo key={`${command}-${text}`}>
            <figure>
              {commandMap[command].icon}
              <figcaption>
                {commandMap[command].label}: <b>{text}</b>...
              </figcaption>
            </figure>
          </StyledInfo>
        ))}
      </ul>
      <StyledInputArea $hideSend={!canSend}>
        {status && <div className="status">{status}</div>}
        <textarea
          ref={inputRef}
          onInput={updateHeight}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          onKeyUp={(event) => {
            const { key, target, shiftKey } = event;

            if (!(target instanceof HTMLTextAreaElement)) return;

            const isEnter = key === "Enter";

            if (target.value && isEnter) {
              if (shiftKey) {
                target.value += "\n";
                updateHeight();
              } else if (canSend) {
                onSend();
              }
            } else {
              setInput(target.value);
            }
          }}
          placeholder="Ask me anything..."
        />
        <StyledLoadingEllipsis $showLoading={isResponding} />
        <Button onClick={onSend}>
          <Send />
        </Button>
      </StyledInputArea>
    </StyledChat>
  );
};

export default Chat;
