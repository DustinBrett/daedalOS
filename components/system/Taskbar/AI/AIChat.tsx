import { useTheme } from "styled-components";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  escapeHtml,
  formatWebLlmProgress,
  responseTweaks,
  speakMessage,
} from "components/system/Taskbar/AI/functions";
import {
  AIIcon,
  BackgroundIcon,
  ChatIcon,
  CopyIcon,
  EditIcon,
  PersonIcon,
  SaveIcon,
  SendFilledIcon,
  SendIcon,
  SpeakIcon,
  StopIcon,
  WarningIcon,
} from "components/system/Taskbar/AI/icons";
import useAITransition from "components/system/Taskbar/AI/useAITransition";
import {
  AI_WORKER,
  DEFAULT_CONVO_STYLE,
} from "components/system/Taskbar/AI/constants";
import StyledAIChat from "components/system/Taskbar/AI/StyledAIChat";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import Button from "styles/common/Button";
import {
  canvasToBuffer,
  clsx,
  getExtension,
  label,
  viewWidth,
} from "utils/functions";
import {
  AI_TITLE,
  AI_WINDOW_ID,
  DESKTOP_PATH,
  PREVENT_SCROLL,
  SAVE_PATH,
} from "utils/constants";
import {
  type MessageTypes,
  type ConvoStyles,
  type Message,
  type WorkerResponse,
  type WebLlmProgress,
  type AIResponse,
} from "components/system/Taskbar/AI/types";
import useWorker from "hooks/useWorker";
import useFocusable from "components/system/Window/useFocusable";
import { useSession } from "contexts/session";
import { useWindowAI } from "hooks/useWindowAI";
import { useFileSystem } from "contexts/fileSystem";
import { readPdfText } from "components/apps/PDF/functions";
import { useSnapshots } from "hooks/useSnapshots";

type AIChatProps = {
  toggleAI: () => void;
};

const STREAMING_SUPPORT = true;

const AIChat: FC<AIChatProps> = ({ toggleAI }) => {
  const {
    colors: { taskbar: taskbarColor },
    sizes: { taskbar: taskbarSize },
  } = useTheme();
  const getFullWidth = useCallback(
    () => Math.min(taskbarSize.ai.chatWidth, viewWidth()),
    [taskbarSize.ai.chatWidth]
  );
  const [fullWidth, setFullWidth] = useState(getFullWidth);
  const aiTransition = useAITransition(fullWidth);
  const [convoStyle, setConvoStyle] = useState(DEFAULT_CONVO_STYLE);
  const [primaryColor, secondaryColor, tertiaryColor] =
    taskbarColor.ai[convoStyle];
  const [promptText, setPromptText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const typing = promptText.length > 0;
  const [conversation, setConversation] = useState<Message[]>([]);
  const addMessage = useCallback(
    (
      text: string | undefined,
      type: MessageTypes,
      formattedText?: string,
      streamId?: number,
      withCanvas = false
    ): void => {
      if (text) {
        setConversation((prevMessages) => {
          const newMessage = {
            formattedText: responseTweaks(formattedText || text),
            text,
            type,
            withCanvas,
          };

          if (streamId) {
            const newMessages = [...prevMessages];

            newMessages[streamId] = newMessage;

            return newMessages;
          }

          return [...prevMessages, newMessage];
        });
      }
    },
    []
  );
  const addUserPrompt = useCallback(() => {
    if (promptText) {
      addMessage(escapeHtml(promptText), "user");
      (textAreaRef.current as HTMLTextAreaElement).value = "";
      setPromptText("");
    }
  }, [addMessage, promptText]);
  const lastAiMessageIndex = useMemo(
    () =>
      conversation.length -
      [...conversation].reverse().findIndex(({ type }) => type === "ai") -
      1,
    [conversation]
  );
  const [responding, setResponding] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [failedSession, setFailedSession] = useState(false);
  const sessionIdRef = useRef<number>(0);
  const hasWindowAI = useWindowAI();
  const aiWorker = useWorker<void>(AI_WORKER);
  const stopResponse = useCallback(() => {
    if (aiWorker.current && responding) {
      aiWorker.current.postMessage("cancel");
      setCanceling(true);
    }
  }, [aiWorker, responding]);
  const [hiddenThoughts, setHiddenThoughts] = useState<number[]>([]);
  const toggleThought = useCallback((index: number) => {
    setHiddenThoughts((prevHiddenThoughts) => {
      if (prevHiddenThoughts.includes(index)) {
        return prevHiddenThoughts.filter((i) => i !== index);
      }

      return [...prevHiddenThoughts, index];
    });
  }, []);
  const newTopic = useCallback(() => {
    stopResponse();
    sessionIdRef.current = 0;
    setConversation([]);
    setHiddenThoughts([]);
    setFailedSession(false);
  }, [stopResponse]);
  const changeConvoStyle = useCallback(
    (newConvoStyle: ConvoStyles) => {
      if (convoStyle !== newConvoStyle) {
        newTopic();
        setConvoStyle(newConvoStyle);
        textAreaRef.current?.focus(PREVENT_SCROLL);
      }
    },
    [convoStyle, newTopic]
  );
  const [containerElement, setContainerElement] =
    useState<HTMLElement | null>();
  const { removeFromStack, setWallpaper } = useSession();
  const { zIndex, ...focusableProps } = useFocusable(
    AI_WINDOW_ID,
    undefined,
    containerElement
  );
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const autoSizeText = useCallback(() => {
    const textArea = textAreaRef.current as HTMLTextAreaElement;

    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
  }, []);
  const { exists, readFile, stat } = useFileSystem();
  const canvasRefs = useRef<Record<number, HTMLCanvasElement>>({});
  const sendMessage = useCallback(async () => {
    const { text } = conversation[conversation.length - 1];

    setResponding(true);

    sessionIdRef.current ||= Date.now();

    let summarizeText = "";
    const lcText = text.toLowerCase();
    const isSummarize = lcText.startsWith("summarize: /");
    const isGenerate = lcText.startsWith("generate: ");

    if (isSummarize) {
      const docPath = text.slice(11).trim();

      if ((await exists(docPath)) && !(await stat(docPath)).isDirectory()) {
        const docText = await readFile(docPath);
        const extension = getExtension(docPath);

        if ([".html", ".htm", ".whtml"].includes(extension)) {
          const domContent = new DOMParser().parseFromString(
            docText.toString(),
            "text/html"
          );

          summarizeText = domContent.body.textContent || "";
        } else if (extension === ".pdf") {
          summarizeText = await readPdfText(docText);
        }
      }
    } else if (isGenerate) {
      addMessage(
        text.slice(10).trim(),
        "ai",
        "I'll try to create that.",
        conversation.length,
        true
      );

      return;
    }

    aiWorker.current?.postMessage({
      hasWindowAI,
      id: sessionIdRef.current,
      streamId: STREAMING_SUPPORT ? conversation.length : undefined,
      style: convoStyle,
      summarizeText,
      text,
    });
  }, [
    addMessage,
    aiWorker,
    conversation,
    convoStyle,
    exists,
    hasWindowAI,
    readFile,
    stat,
  ]);
  const { createSnapshot } = useSnapshots();
  const saveCanvasImage = useCallback(
    async (
      index: number,
      saveName: string,
      savePath: string
    ): Promise<string> => {
      const canvas = canvasRefs.current[index];

      if (canvas) {
        return createSnapshot(
          `${saveName}.png`,
          canvasToBuffer(canvas),
          undefined,
          false,
          savePath
        );
      }

      return "";
    },
    [createSnapshot]
  );

  useEffect(() => {
    textAreaRef.current?.focus(PREVENT_SCROLL);
  }, []);

  useEffect(() => {
    const updateFullWidth = (): void => setFullWidth(getFullWidth);

    window.addEventListener("resize", updateFullWidth);

    return () => window.removeEventListener("resize", updateFullWidth);
  }, [getFullWidth]);

  useEffect(() => {
    if (conversation.length > 0 || failedSession) {
      requestAnimationFrame(() => {
        sectionRef.current?.scrollTo({
          behavior: "smooth",
          top: sectionRef.current.scrollHeight,
        });
        autoSizeText();
      });
    }

    setScrollbarVisible(
      conversation.length > 0 &&
        sectionRef.current instanceof HTMLElement &&
        sectionRef.current.scrollHeight > sectionRef.current.clientHeight
    );
  }, [autoSizeText, conversation, failedSession]);

  useEffect(() => {
    if (
      aiWorker.current &&
      conversation.length > 0 &&
      conversation[conversation.length - 1].type === "user"
    ) {
      sendMessage();
    }
  }, [aiWorker, conversation, sendMessage]);

  useEffect(() => {
    if (!window.initialAiPrompt) return;

    if (window.initialAiPrompt === promptText) {
      if (conversation.length === 0 && aiWorker.current) {
        window.initialAiPrompt = "";
        addUserPrompt();
      }
    } else {
      setPromptText(window.initialAiPrompt);
    }
  }, [addUserPrompt, aiWorker, conversation.length, promptText]);

  useEffect(() => {
    const workerRef = aiWorker.current;
    const workerResponse = ({ data }: WorkerResponse): void => {
      const isStreaming = (data as AIResponse).streamId;

      if (!isStreaming) {
        const doneResponding = typeof data === "string" || "response" in data;

        setResponding(!doneResponding);
      }

      if (data === "canceled") {
        setCanceling(false);
      } else if ((data as WebLlmProgress).progress) {
        const {
          progress: { text },
        } = data as WebLlmProgress;

        setProgressMessage(formatWebLlmProgress(text));
      } else if ((data as AIResponse).response || isStreaming) {
        const { complete, formattedResponse, response, streamId } =
          data as AIResponse;

        if (complete) setResponding(false);
        else addMessage(response, "ai", formattedResponse, streamId);
      } else if ((data as AIResponse).response === "") {
        setFailedSession(true);
      }
    };

    workerRef?.addEventListener("message", workerResponse);

    return () => workerRef?.removeEventListener("message", workerResponse);
  }, [addMessage, aiWorker]);

  return (
    <StyledAIChat
      ref={setContainerElement}
      $primaryColor={primaryColor}
      $responding={responding}
      $scrollbarVisible={scrollbarVisible}
      $secondaryColor={secondaryColor}
      $tertiaryColor={tertiaryColor}
      $typing={typing}
      $width={fullWidth}
      $zIndex={zIndex}
      {...aiTransition}
      {...focusableProps}
    >
      <div className="header">
        <header>
          {AI_TITLE} (beta)
          <nav>
            <Button
              className="close"
              onClick={() => {
                toggleAI();
                removeFromStack(AI_WINDOW_ID);
              }}
              {...label("Close")}
            >
              <CloseIcon />
            </Button>
          </nav>
        </header>
      </div>
      <section ref={sectionRef}>
        <div className="convo-header">
          <div className="title">
            <AIIcon /> {AI_TITLE}
          </div>
          <div className="convo-style">
            Choose a conversation style
            <div className="buttons">
              <button
                className={convoStyle === "creative" ? "selected" : ""}
                onClick={() => changeConvoStyle("creative")}
                type="button"
                {...label("Start an original and imaginative chat")}
              >
                <h4>More</h4>
                <h2>Creative</h2>
              </button>
              <button
                className={convoStyle === "balanced" ? "selected" : ""}
                onClick={() => changeConvoStyle("balanced")}
                type="button"
                {...label("For everyday, informed chats")}
              >
                <h4>More</h4>
                <h2>Balanced</h2>
              </button>
              <button
                className={convoStyle === "precise" ? "selected" : ""}
                onClick={() => changeConvoStyle("precise")}
                type="button"
                {...label("Start a concise chat, useful for fact-finding")}
              >
                <h4>More</h4>
                <h2>Precise</h2>
              </button>
            </div>
          </div>
        </div>
        <div className="conversation">
          {conversation.map(
            ({ formattedText, type, text, withCanvas }, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className={type}>
                {(index === 0 || conversation[index - 1].type !== type) && (
                  <div className="avatar">
                    {type === "user" ? <PersonIcon /> : <AIIcon />}
                    {type === "user" ? "You" : "AI"}
                  </div>
                )}
                {text.startsWith("<think>") && (
                  <button
                    className={clsx({
                      thinking: true,
                      "thinking-responding":
                        responding && index === conversation.length - 1,
                    })}
                    type="button"
                    {...((!responding || index < conversation.length - 1) &&
                      text.includes("</think>") && {
                        onClick: () => toggleThought(index),
                      })}
                  >
                    {text.includes("</think>") ||
                    !responding ||
                    index < conversation.length - 1
                      ? "Thoughts"
                      : "Thinking..."}
                  </button>
                )}
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: formattedText }}
                  className={clsx({
                    "hide-think": hiddenThoughts.includes(index),
                    message: true,
                  })}
                />
                <div
                  className={clsx({
                    controls: true,
                    hidden:
                      responding &&
                      !withCanvas &&
                      index === conversation.length - 1,
                    invisible: responding && !!withCanvas,
                    last: index === lastAiMessageIndex,
                  })}
                >
                  <button
                    className="control"
                    onClick={() => {
                      navigator.clipboard?.writeText(text);
                      setCopiedIndex(index);
                      setTimeout(() => setCopiedIndex(-1), 5000);
                    }}
                    type="button"
                    {...label(copiedIndex === index ? "Copied" : "Copy")}
                  >
                    <CopyIcon />
                  </button>
                  {type === "user" && (
                    <button
                      className="control"
                      onClick={() => {
                        if (textAreaRef.current) {
                          textAreaRef.current.value = text;
                          textAreaRef.current.focus(PREVENT_SCROLL);
                          setPromptText(text);
                        }
                      }}
                      type="button"
                      {...label("Edit")}
                    >
                      <EditIcon />
                    </button>
                  )}
                  {"speechSynthesis" in window && type === "ai" && (
                    <button
                      className="control"
                      onClick={() => speakMessage(text)}
                      type="button"
                      {...label("Read aloud")}
                    >
                      <SpeakIcon />
                    </button>
                  )}
                  {type === "ai" && withCanvas && (
                    <>
                      <button
                        className="control"
                        onClick={() =>
                          saveCanvasImage(index, text, DESKTOP_PATH)
                        }
                        type="button"
                        {...label("Save")}
                      >
                        <SaveIcon />
                      </button>
                      <button
                        className="control"
                        onClick={() =>
                          saveCanvasImage(index, text, SAVE_PATH).then(
                            (newFileName) =>
                              setWallpaper(`${SAVE_PATH}/${newFileName}`)
                          )
                        }
                        type="button"
                        {...label("Set as background")}
                      >
                        <BackgroundIcon />
                      </button>
                    </>
                  )}
                </div>
                {withCanvas && (
                  <div
                    className={clsx({
                      generating:
                        responding && index === conversation.length - 1,
                      "image-container": true,
                    })}
                  >
                    <canvas
                      ref={(canvas) => {
                        if (
                          !(canvas instanceof HTMLCanvasElement) ||
                          canvasRefs.current[index] === canvas
                        ) {
                          return;
                        }

                        canvasRefs.current[index] = canvas;

                        try {
                          const offscreenCanvas =
                            canvas.transferControlToOffscreen();

                          aiWorker.current?.postMessage(
                            {
                              hasWindowAI,
                              id: sessionIdRef.current,
                              imagePrompt: text,
                              offscreenCanvas,
                              streamId: STREAMING_SUPPORT
                                ? conversation.length
                                : undefined,
                              style: convoStyle,
                              text,
                            },
                            [offscreenCanvas]
                          );
                        } catch {
                          // Ignore failure to transfer control to offscreen
                        }
                      }}
                      height={512}
                      width={512}
                    />
                    <div className="prompt">&quot;{text}&quot;</div>
                    <div className="powered-by">
                      <div>Powered by Stable Diffusion 1.5</div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
          {responding && (
            <div className="responding">
              <button
                className={`stop${canceling ? " canceling" : ""}`}
                disabled={Boolean(progressMessage) || canceling}
                onClick={stopResponse}
                type="button"
              >
                {!progressMessage && !canceling && <StopIcon />}
                {canceling ? "Canceling" : progressMessage || "Stop Responding"}
              </button>
            </div>
          )}
          {failedSession && (
            <div className="failed-session">
              <WarningIcon />
              It might be time to move onto a new topic.
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <a onClick={newTopic}>Let&apos;s start over.</a>
            </div>
          )}
        </div>
      </section>
      <footer>
        <textarea
          ref={textAreaRef}
          disabled={failedSession}
          onBlur={autoSizeText}
          onChange={(event) => {
            setPromptText(event.target.value);
            autoSizeText();
          }}
          onFocus={autoSizeText}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();

              if (!canceling && !responding) addUserPrompt();
            }

            autoSizeText();
          }}
          placeholder="Ask me anything..."
        />
        <button
          className="new-topic"
          onClick={newTopic}
          type="button"
          {...label("New topic")}
        >
          <ChatIcon />
        </button>
        <button
          className="submit"
          disabled={canceling || responding}
          {...(typing && {
            onClick: addUserPrompt,
          })}
          type="button"
          {...(!canceling && typing ? label("Submit") : undefined)}
        >
          {!canceling && typing ? <SendFilledIcon /> : <SendIcon />}
        </button>
      </footer>
    </StyledAIChat>
  );
};

export default memo(AIChat);
