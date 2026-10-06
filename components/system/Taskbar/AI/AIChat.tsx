import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { readPdfText } from "components/apps/PDF/functions";
import {
  createSession,
  createSummarizer,
  readStream,
  summarize,
  summarizeWithSession,
  toPrompt,
} from "components/system/Taskbar/AI/builtInAI";
import {
  AI_WORKER,
  DEFAULT_CONVO_STYLE,
  GENERATE_RESPONSE,
  SYSTEM_PROMPT,
} from "components/system/Taskbar/AI/constants";
import {
  escapeHtml,
  formatWebLlmProgress,
  speakMessage,
  splitThoughts,
  toChatHistory,
} from "components/system/Taskbar/AI/functions";
import {
  AIIcon,
  BackgroundIcon,
  ChatIcon,
  CopyIcon,
  EditIcon,
  ImageIcon,
  PersonIcon,
  SaveIcon,
  SendFilledIcon,
  SendIcon,
  SpeakIcon,
  StopIcon,
  WarningIcon,
} from "components/system/Taskbar/AI/icons";
import StyledAIChat from "components/system/Taskbar/AI/StyledAIChat";
import {
  type ConvoStyles,
  type Message,
  type ResponseError,
  type WorkerResponse,
} from "components/system/Taskbar/AI/types";
import useAITransition from "components/system/Taskbar/AI/useAITransition";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import useFocusable from "components/system/Window/useFocusable";
import { useFileSystemActions } from "contexts/fileSystem";
import { useSessionActions } from "contexts/session";
import { useLinkHandler } from "hooks/useLinkHandler";
import { useSnapshots } from "hooks/useSnapshots";
import {
  getAvailability,
  IMAGE_EXPECTATIONS,
  useWindowAI,
} from "hooks/useWindowAI";
import useWorker from "hooks/useWorker";
import Button from "styles/common/Button";
import {
  AI_PROMPT_EVENT,
  AI_TITLE,
  AI_WINDOW_ID,
  DESKTOP_PATH,
  PREVENT_SCROLL,
  SAVE_PATH,
} from "utils/constants";
import {
  bufferToBlob,
  canvasToBuffer,
  clsx,
  getExtension,
  getMimeType,
  haltEvent,
  label,
  loadFiles,
  viewWidth,
} from "utils/functions";

type AIChatProps = {
  toggleAI: () => void;
};

type Session = {
  controller: AbortController;
  imageInput: boolean;
  session: Promise<LanguageModel>;
};

const GENERATE_COMMAND = /^generate:(.+)$/is;
const SUMMARIZE_COMMAND = /^summarize:\s*(\/.+)$/i;
const SUPPORTED_IMAGE_TYPES = /^image\/(?:avif|bmp|gif|jpeg|png|webp)$/;
const MARKED_LIB = "/Program Files/Marked/marked.min.js";
// DeepSeek's 4096 token context also has to hold its reasoning
const MAX_WEB_LLM_SUMMARIZE_LENGTH = 8000;
const NOTHING_TO_SUMMARIZE = "There's no text I can summarize in that file.";

const withSummarizer = async (
  summarizer: Summarizer | undefined,
  run: () => Promise<void>
): Promise<void> => {
  try {
    await run();
  } finally {
    summarizer?.destroy();
  }
};

const getDroppedFilePaths = (dataTransfer: DataTransfer): unknown => {
  try {
    return JSON.parse(
      dataTransfer.getData("application/json") || "[]"
    ) as unknown;
  } catch {
    // Ignore failed JSON parsing
  }

  return [];
};

const writeClipboardText = (text: string): boolean => {
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    // Ignore failure to write to clipboard
    return false;
  }

  return true;
};

const transferCanvasToWorker = (
  canvas: HTMLCanvasElement,
  worker: React.RefObject<undefined | Worker>,
  id: number,
  imagePrompt: string
): void => {
  try {
    const offscreenCanvas = canvas.transferControlToOffscreen();

    worker.current?.postMessage({ id, imagePrompt, offscreenCanvas }, [
      offscreenCanvas,
    ]);
  } catch {
    // Ignore failure to transfer control to offscreen
  }
};

const markdownCache = new Map<string, string>();

const formatMarkdown = (
  markdown: string,
  markedLoaded: boolean,
  cache = true
): string => {
  const cachedHtml = markdownCache.get(markdown);

  if (cachedHtml !== undefined) return cachedHtml;
  if (!markedLoaded || !window.marked) return escapeHtml(markdown);

  const html = DOMPurify.sanitize(
    window.marked.parse(markdown, { breaks: true })
  );

  if (cache) markdownCache.set(markdown, html);

  return html;
};

const htmlToText = (html: string): string =>
  new DOMParser().parseFromString(html, "text/html").body.textContent || "";

const isSupportedImage = ({ type }: Blob): boolean =>
  SUPPORTED_IMAGE_TYPES.test(type);

const BlobImage: FC<{ blob: Blob }> = ({ blob }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(blob);

    // eslint-disable-next-line react/set-state-in-effect -- The object URL lives only as long as this blob is shown
    setSrc(url);

    return () => URL.revokeObjectURL(url);
  }, [blob]);

  // eslint-disable-next-line unicorn/no-null
  return src ? <img alt="Attachment" src={src} /> : null;
};

const AIChat: FC<AIChatProps> = ({ toggleAI }) => {
  const {
    colors: { taskbar: taskbarColor },
    sizes: { taskbar: taskbarSize },
  } = useTheme();
  const getFullWidth = (): number =>
    Math.min(taskbarSize.ai.chatWidth, viewWidth());
  const [fullWidth, setFullWidth] = useState(getFullWidth);
  const aiTransition = useAITransition(fullWidth);
  const [convoStyle, setConvoStyle] = useState(DEFAULT_CONVO_STYLE);
  const [primaryColor, secondaryColor, tertiaryColor] =
    taskbarColor.ai[convoStyle];
  const [promptText, setPromptText] = useState("");
  const [attachments, setAttachments] = useState<Blob[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const typing = promptText.length > 0 || attachments.length > 0;
  const [conversation, setConversation] = useState<Message[]>([]);
  const lastAiMessageIndex =
    conversation.length -
    [...conversation].reverse().findIndex(({ type }) => type === "ai") -
    1;
  const [responding, setResponding] = useState(false);
  const [responseError, setResponseError] = useState<ResponseError>();
  const [progressMessage, setProgressMessage] = useState("");
  const [markedLoaded, setMarkedLoaded] = useState(false);
  const windowAI = useWindowAI();
  const builtInAI = windowAI !== "unavailable";
  const [imageInput, setImageInput] = useState(false);
  const requestCountRef = useRef(0);
  const requestIdRef = useRef(0);
  const requestAbortRef = useRef<AbortController>(undefined);
  const sessionRef = useRef<Session>(undefined);
  const updateResponse = (id: number, text: string): void => {
    if (id !== requestIdRef.current) return;

    setProgressMessage("");
    setConversation((messages) => {
      const lastMessage = messages[messages.length - 1];

      return lastMessage?.type === "ai" && !lastMessage.withCanvas
        ? [...messages.slice(0, -1), { ...lastMessage, text }]
        : [...messages, { text, type: "ai" }];
    });
  };
  const finishResponse = (id: number, error?: ResponseError): void => {
    if (id !== requestIdRef.current) return;

    requestIdRef.current = 0;
    setProgressMessage("");
    setResponding(false);
    if (error) setResponseError(error);
  };
  const onWorkerMessage = ({ data }: MessageEvent<WorkerResponse>): void => {
    if ("progress" in data) {
      setProgressMessage(formatWebLlmProgress(data.progress));
    } else if ("text" in data) updateResponse(data.id, data.text);
    else finishResponse(data.id, data.error);
  };
  const aiWorker = useWorker(AI_WORKER, onWorkerMessage);
  const cancelResponse = (): void => {
    const id = requestIdRef.current;

    if (!id) return;

    requestIdRef.current = 0;
    requestAbortRef.current?.abort();
    aiWorker.current?.postMessage({ cancel: id });
    setProgressMessage("");
    setResponding(false);
  };
  const resetSession = (): void => {
    sessionRef.current?.controller.abort();
    sessionRef.current = undefined;
  };
  const getSession = (
    history: Message[],
    withImages: boolean
  ): Promise<LanguageModel> => {
    if (sessionRef.current && withImages && !sessionRef.current.imageInput) {
      resetSession();
    }

    if (!sessionRef.current) {
      const controller = new AbortController();
      const session = createSession(
        convoStyle,
        withImages,
        toChatHistory(history),
        controller.signal,
        setProgressMessage
      );

      sessionRef.current = { controller, imageInput: withImages, session };
      session.catch(() => {
        if (sessionRef.current?.session === session) {
          sessionRef.current = undefined;
        }
      });
    }

    return sessionRef.current.session;
  };
  const [hiddenThoughts, setHiddenThoughts] = useState<number[]>([]);
  const toggleThought = (index: number): void => {
    setHiddenThoughts((prevHiddenThoughts) => {
      if (prevHiddenThoughts.includes(index)) {
        return prevHiddenThoughts.filter((i) => i !== index);
      }

      return [...prevHiddenThoughts, index];
    });
  };
  // Not a ref, as writing one from the conversation list stops memoization
  // eslint-disable-next-line react/hook-use-state
  const [canvases] = useState(() => new Map<number, HTMLCanvasElement>());
  const newTopic = (): void => {
    cancelResponse();
    resetSession();
    markdownCache.clear();
    canvases.clear();
    setConversation([]);
    setHiddenThoughts([]);
    setResponseError(undefined);
  };
  const changeConvoStyle = (newConvoStyle: ConvoStyles): void => {
    if (convoStyle !== newConvoStyle) {
      newTopic();
      setConvoStyle(newConvoStyle);
      textAreaRef.current?.focus(PREVENT_SCROLL);
    }
  };
  const [containerElement, setContainerElement] =
    useState<HTMLElement | null>();
  const { removeFromStack, setWallpaper } = useSessionActions();
  const { zIndex, ...focusableProps } = useFocusable(
    AI_WINDOW_ID,
    undefined,
    containerElement
  );
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const autoSizeText = (): void => {
    const textArea = textAreaRef.current;

    if (!textArea) return;

    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
    textArea.parentElement?.style.setProperty(
      "--composer-height",
      textArea.style.height
    );
  };
  const { exists, readFile, stat } = useFileSystemActions();
  const readDocument = async (path: string): Promise<string> => {
    if (!(await exists(path)) || (await stat(path)).isDirectory()) return "";

    const contents = await readFile(path);
    const extension = getExtension(path);

    if (extension === ".pdf") return readPdfText(contents);
    if (![".htm", ".html", ".whtml"].includes(extension)) {
      return contents.toString();
    }

    const { body } = new DOMParser().parseFromString(
      contents.toString(),
      "text/html"
    );

    body
      .querySelectorAll("noscript, script, style, template")
      .forEach((element) => element.remove());

    return body.textContent || "";
  };
  const sendRequest = async (messages: Message[]): Promise<void> => {
    const { images = [], text } = messages[messages.length - 1];
    const history = messages.slice(0, -1);
    const imagePrompt = GENERATE_COMMAND.exec(text)?.[1].trim();
    const [, documentPath] = SUMMARIZE_COMMAND.exec(text) || [];
    const controller = new AbortController();
    const { signal } = controller;
    const id = ++requestCountRef.current;
    const onText = (newText: string): void => updateResponse(id, newText);

    requestIdRef.current = id;
    requestAbortRef.current = controller;
    setResponding(true);
    setResponseError(undefined);

    if (imagePrompt) {
      // The session is rebuilt from history since it never sees this exchange
      resetSession();
      setConversation([
        ...messages,
        { text: imagePrompt, type: "ai", withCanvas: true },
      ]);

      return;
    }

    const respond = async (): Promise<void> => {
      if (builtInAI && documentPath) {
        resetSession();

        // Created before reading the document to keep the user activation
        const summarizer = await createSummarizer(signal, setProgressMessage);

        await withSummarizer(summarizer, async () => {
          const documentText = await readDocument(documentPath);

          setProgressMessage("");

          if (!documentText) onText(NOTHING_TO_SUMMARIZE);
          else if (summarizer) {
            await summarize(summarizer, documentText, signal, onText);
          } else {
            await summarizeWithSession(
              await getSession(history, false),
              documentText,
              signal,
              onText
            );
          }
        });

        finishResponse(id);
      } else if (builtInAI) {
        const session = await getSession(history, images.length > 0);

        setProgressMessage("");
        await readStream(
          session.promptStreaming(toPrompt(text, images), { signal }),
          onText
        );
        finishResponse(id);
      } else {
        const documentText = documentPath
          ? await readDocument(documentPath)
          : "";

        if (documentPath && !documentText) {
          onText(NOTHING_TO_SUMMARIZE);
          finishResponse(id);
        } else if (!signal.aborted) {
          aiWorker.current?.postMessage({
            id,
            messages: [
              { content: SYSTEM_PROMPT, role: "system" },
              ...toChatHistory(history),
              {
                content: documentText
                  ? `Summarize:\n\n${documentText.slice(0, MAX_WEB_LLM_SUMMARIZE_LENGTH)}`
                  : text,
                role: "user",
              },
            ],
            style: convoStyle,
          });
        }
      }
    };

    try {
      await respond();
    } catch (error) {
      if (!signal.aborted) {
        console.error("Failed to create response.", error);
        finishResponse(
          id,
          (error as Error).name === "QuotaExceededError" ? "context" : "failed"
        );
      }
    }
  };
  const submitPrompt = (
    text: string,
    images: Blob[],
    history: Message[]
  ): void => {
    const messages: Message[] = [
      ...history,
      { ...(images.length > 0 && { images }), text, type: "user" },
    ];

    setConversation(messages);
    sendRequest(messages);
  };
  const addUserPrompt = (): void => {
    const text = promptText.trim();

    if (responding || (!text && attachments.length === 0)) return;

    submitPrompt(text, attachments, conversation);
    (textAreaRef.current as HTMLTextAreaElement).value = "";
    setPromptText("");
    setAttachments([]);
  };
  const retry = (): void => {
    const messages =
      conversation[conversation.length - 1]?.type === "ai"
        ? conversation.slice(0, -1)
        : conversation;

    if (messages.length === 0) return;

    setConversation(messages);
    sendRequest(messages);
  };
  const addImages = (images: Blob[]): void => {
    const supportedImages = images.filter(isSupportedImage);

    if (supportedImages.length > 0) {
      setAttachments((currentImages) => [...currentImages, ...supportedImages]);
    }
  };
  const dropImages = async ({
    dataTransfer,
  }: React.DragEvent<HTMLElement>): Promise<void> => {
    const filePaths = getDroppedFilePaths(dataTransfer);

    addImages([...dataTransfer.files]);

    if (Array.isArray(filePaths)) {
      addImages(
        await Promise.all(
          (filePaths as string[])
            .filter((filePath) =>
              SUPPORTED_IMAGE_TYPES.test(getMimeType(filePath))
            )
            .map(async (filePath) =>
              bufferToBlob(await readFile(filePath), getMimeType(filePath))
            )
        )
      );
    }
  };
  const openLink = useLinkHandler();
  const onConversationClick = ({
    nativeEvent,
    target,
  }: React.MouseEvent<HTMLElement>): void => {
    const link = (target as HTMLElement).closest("a");

    if (link) {
      openLink(nativeEvent, link.href, link.pathname, link.textContent || "");
    }
  };
  const { createSnapshot } = useSnapshots();
  const saveCanvasImage = async (
    index: number,
    saveName: string,
    savePath: string
  ): Promise<string> => {
    const canvas = canvases.get(index);

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
  };

  useEffect(() => {
    textAreaRef.current?.focus(PREVENT_SCROLL);
    loadFiles([MARKED_LIB]).then(() => setMarkedLoaded(true));
  }, []);

  useEffect(
    () => () => {
      requestAbortRef.current?.abort();
      resetSession();
      markdownCache.clear();
    },
    [resetSession]
  );

  useEffect(() => {
    if (builtInAI) {
      getAvailability(IMAGE_EXPECTATIONS).then((availability) =>
        setImageInput(availability !== "unavailable")
      );
    }
  }, [builtInAI]);

  useEffect(() => {
    const updateFullWidth = (): void => setFullWidth(getFullWidth);

    window.addEventListener("resize", updateFullWidth);

    return () => window.removeEventListener("resize", updateFullWidth);
  }, [getFullWidth]);

  useEffect(() => {
    if (conversation.length > 0 || responseError) {
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
  }, [autoSizeText, conversation, responseError]);

  useEffect(() => {
    requestAnimationFrame(autoSizeText);
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [attachments, autoSizeText]);

  useEffect(() => {
    let timer = 0;
    const runInitialPrompt = (): void => {
      window.clearTimeout(timer);
      // Deferred so a StrictMode remount can't send it to a terminated worker
      timer = window.setTimeout(() => {
        const prompt = window.initialAiPrompt;

        if (!prompt) return;

        window.initialAiPrompt = "";
        newTopic();
        submitPrompt(prompt, [], []);
        textAreaRef.current?.focus(PREVENT_SCROLL);
      }, 0);
    };

    runInitialPrompt();
    window.addEventListener(AI_PROMPT_EVENT, runInitialPrompt);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(AI_PROMPT_EVENT, runInitialPrompt);
    };
  }, [newTopic, submitPrompt]);

  return (
    <StyledAIChat
      ref={setContainerElement}
      $attachments={attachments.length > 0}
      $primaryColor={primaryColor}
      $responding={responding}
      $scrollbarVisible={scrollbarVisible}
      $secondaryColor={secondaryColor}
      $tertiaryColor={tertiaryColor}
      $typing={typing}
      $width={fullWidth}
      $zIndex={zIndex}
      aria-label={AI_TITLE}
      id={AI_WINDOW_ID}
      role="dialog"
      {...(imageInput && {
        onDragOver: haltEvent,
        onDrop: (event) => {
          haltEvent(event);
          dropImages(event);
        },
      })}
      {...aiTransition}
      {...focusableProps}
    >
      <div className="header">
        <header>
          {AI_TITLE} (beta)
          <nav role="presentation">
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
            <div
              aria-label="Choose a conversation style"
              className="buttons"
              role="group"
            >
              <button
                aria-pressed={convoStyle === "creative"}
                className={convoStyle === "creative" ? "selected" : ""}
                onClick={() => changeConvoStyle("creative")}
                type="button"
                {...label(
                  "Start an original and imaginative chat",
                  "More Creative"
                )}
              >
                <h4>More</h4>
                <h2>Creative</h2>
              </button>
              <button
                aria-pressed={convoStyle === "balanced"}
                className={convoStyle === "balanced" ? "selected" : ""}
                onClick={() => changeConvoStyle("balanced")}
                type="button"
                {...label("For everyday, informed chats", "More Balanced")}
              >
                <h4>More</h4>
                <h2>Balanced</h2>
              </button>
              <button
                aria-pressed={convoStyle === "precise"}
                className={convoStyle === "precise" ? "selected" : ""}
                onClick={() => changeConvoStyle("precise")}
                type="button"
                {...label(
                  "Start a concise chat, useful for fact-finding",
                  "More Precise"
                )}
              >
                <h4>More</h4>
                <h2>Precise</h2>
              </button>
            </div>
          </div>
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className="conversation" onClick={onConversationClick}>
          {conversation.map(({ images, text, type, withCanvas }, index) => {
            const isLast = index === conversation.length - 1;
            const isResponding = responding && isLast;
            const { answer, thinking, thoughts } =
              type === "ai" && !withCanvas
                ? splitThoughts(text)
                : { answer: text };
            const showThoughts =
              Boolean(thoughts) && !hiddenThoughts.includes(index);
            const canToggleThoughts =
              Boolean(thoughts) && !(thinking && isResponding);

            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className={type}>
                {(index === 0 || conversation[index - 1].type !== type) && (
                  <div className="avatar">
                    {type === "user" ? <PersonIcon /> : <AIIcon />}
                    {type === "user" ? "You" : "AI"}
                  </div>
                )}
                {(thinking || thoughts) && (
                  <button
                    className={clsx({
                      thinking: true,
                      "thinking-responding": !canToggleThoughts,
                    })}
                    type="button"
                    {...(canToggleThoughts && {
                      "aria-expanded": showThoughts,
                      onClick: () => toggleThought(index),
                    })}
                  >
                    {thinking && isResponding ? "Thinking..." : "Thoughts"}
                  </button>
                )}
                {showThoughts && (
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(
                        thoughts as string,
                        markedLoaded,
                        !isResponding
                      ),
                    }}
                    className="thoughts markdown"
                  />
                )}
                {(answer || withCanvas) && (
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: withCanvas
                        ? GENERATE_RESPONSE
                        : type === "ai"
                          ? formatMarkdown(answer, markedLoaded, !isResponding)
                          : escapeHtml(answer),
                    }}
                    className={clsx({ markdown: type === "ai", message: true })}
                  />
                )}
                {images && (
                  <div className="images">
                    {images.map((image, imageIndex) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <BlobImage key={imageIndex} blob={image} />
                    ))}
                  </div>
                )}
                <div
                  className={clsx({
                    controls: true,
                    hidden: isResponding && !withCanvas,
                    invisible: responding && Boolean(withCanvas),
                    last: index === lastAiMessageIndex,
                  })}
                >
                  <button
                    className="control"
                    onClick={() => {
                      if (writeClipboardText(answer)) {
                        setCopiedIndex(index);
                        setTimeout(() => setCopiedIndex(-1), 5000);
                      }
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
                          setAttachments(images || []);
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
                      onClick={() =>
                        speakMessage(
                          htmlToText(formatMarkdown(answer, markedLoaded))
                        )
                      }
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
                      generating: isResponding,
                      "image-container": true,
                    })}
                  >
                    <canvas
                      ref={(canvas) => {
                        if (
                          !(canvas instanceof HTMLCanvasElement) ||
                          canvases.get(index) === canvas
                        ) {
                          return;
                        }

                        canvases.set(index, canvas);

                        transferCanvasToWorker(
                          canvas,
                          aiWorker,
                          requestIdRef.current,
                          text
                        );
                      }}
                      aria-label={text}
                      height={512}
                      role="img"
                      width={512}
                    />
                    <div className="prompt">&quot;{text}&quot;</div>
                    <div className="powered-by">
                      <div>Powered by Stable Diffusion 1.5</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {responding && (
            <div className="responding">
              <button
                className="stop"
                disabled={Boolean(progressMessage)}
                onClick={cancelResponse}
                type="button"
              >
                {!progressMessage && <StopIcon />}
                {progressMessage || "Stop Responding"}
              </button>
            </div>
          )}
          {responseError && (
            <div className="failed-session">
              <WarningIcon />
              {responseError === "context"
                ? "It might be time to move onto a new topic."
                : "Something went wrong."}
              <button
                onClick={responseError === "context" ? newTopic : retry}
                type="button"
              >
                {responseError === "context"
                  ? "Let's start over."
                  : "Try again."}
              </button>
            </div>
          )}
        </div>
      </section>
      <footer>
        {attachments.length > 0 && (
          <ol className="attachments">
            {attachments.map((image, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index}>
                <BlobImage blob={image} />
                <button
                  className="remove"
                  onClick={() =>
                    setAttachments((currentImages) =>
                      currentImages.filter((_, i) => i !== index)
                    )
                  }
                  type="button"
                  {...label("Remove image")}
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ol>
        )}
        <textarea
          ref={textAreaRef}
          aria-label="Ask me anything"
          disabled={responseError === "context"}
          onBlur={autoSizeText}
          onChange={(event) => {
            setPromptText(event.target.value);
            autoSizeText();
          }}
          onFocus={autoSizeText}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              addUserPrompt();
            }

            autoSizeText();
          }}
          onPaste={({ clipboardData }) => {
            if (imageInput) addImages([...clipboardData.files]);
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
        {imageInput && (
          <>
            <button
              className="add-image"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              {...label("Add an image")}
            >
              <ImageIcon />
            </button>
            <input
              ref={fileInputRef}
              accept="image/*"
              onChange={({ target: { files } }) => {
                addImages([...(files || [])]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              tabIndex={-1}
              type="file"
              aria-hidden
              hidden
              multiple
            />
          </>
        )}
        <button
          aria-disabled={!typing || undefined}
          className="submit"
          disabled={responding}
          {...(typing && {
            onClick: addUserPrompt,
          })}
          type="button"
          {...label("Submit")}
        >
          {typing ? <SendFilledIcon /> : <SendIcon />}
        </button>
      </footer>
    </StyledAIChat>
  );
};

export default AIChat;
