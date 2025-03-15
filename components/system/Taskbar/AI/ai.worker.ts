import {
  type ChatCompletion,
  type ChatCompletionChunk,
  type ChatCompletionMessageParam,
  type MLCEngine,
} from "@mlc-ai/web-llm";
import { type StableDiffusionConfig } from "components/apps/StableDiffusion/types";
import {
  runStableDiffusion,
  libs as StableDiffusionLibs,
} from "components/system/Desktop/Wallpapers/StableDiffusion";
import {
  type WorkerMessage,
  type ConvoStyles,
  type Prompt,
} from "components/system/Taskbar/AI/types";
import { isAvailable } from "hooks/useWindowAI";

const MARKED_LIBS = [
  "/Program Files/Marked/marked.min.js",
  "/Program Files/Marked/purify.min.js",
];

const CONVO_STYLE_TEMPS: Record<
  ConvoStyles,
  AILanguageModelCreateOptionsWithSystemPrompt
> = {
  balanced: {
    temperature: 0.6,
    topK: 3,
  },
  creative: {
    temperature: 0.7,
    topK: 5,
  },
  precise: {
    temperature: 0.5,
    topK: 2,
  },
};

const WEB_LLM_MODEL = "DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC";
const WEB_LLM_MODEL_CONFIG = {
  context_window_size: 131072,
  frequency_penalty: 0,
  presence_penalty: 0,
  top_p: 0.9,
};
const SYSTEM_PROMPT: ChatCompletionMessageParam = {
  content: "You are a helpful AI assistant.",
  role: "system",
};

const abortController = new AbortController();
let cancel = false;
let responding = false;

let sessionId = 0;
let session: AILanguageModel | undefined;
let summarizer: AISummarizer | undefined;
let prompts: Prompt[] = [];
let engine: MLCEngine;

let markedLoaded = false;

globalThis.addEventListener(
  "message",
  async ({ data }: { data: WorkerMessage | "cancel" | "init" }) => {
    if (!data || data === "init") return;

    if (data === "cancel") {
      if (responding) {
        cancel = true;
        abortController.abort();
      }
    } else if (data.id && data.text && data.style) {
      responding = true;

      if (sessionId !== data.id) {
        sessionId = data.id;

        if (data.hasWindowAI) {
          prompts = [];
          summarizer?.destroy();
          (session as AILanguageModel)?.destroy();

          const config: AILanguageModelCreateOptionsWithSystemPrompt = {
            ...CONVO_STYLE_TEMPS[data.style],
            signal: abortController.signal,
            systemPrompt: SYSTEM_PROMPT.content,
          };

          session = await globalThis.ai.languageModel.create(config);
        } else {
          prompts = [];

          if (!engine) {
            const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

            if (!cancel) {
              engine = await CreateMLCEngine(WEB_LLM_MODEL, {
                initProgressCallback: (progress) =>
                  globalThis.postMessage({ progress }),
              });
            }
          }
        }
      }

      let response:
        | string
        | ReadableStream<string>
        | AsyncIterable<ChatCompletionChunk> = "";
      let retry = 0;
      const rebuildSession = async (customResponse?: string): Promise<void> => {
        (session as AILanguageModel)?.destroy();
        const streamId = 0;

        prompts.push(
          { content: data.text, role: "user", streamId },
          {
            content: customResponse || (response as string),
            role: "assistant",
            streamId,
          }
        );

        const config: AILanguageModelCreateOptionsWithSystemPrompt = {
          ...CONVO_STYLE_TEMPS[data.style],
          initialPrompts: [
            SYSTEM_PROMPT as unknown as AILanguageModelPrompt,
            ...(prompts as AILanguageModelPrompt[]),
          ],
        };

        session = await globalThis.ai.languageModel.create(config);
      };

      try {
        if (
          data.hasWindowAI &&
          data.summarizeText &&
          "summarizer" in globalThis.ai &&
          (await isAvailable(globalThis.ai.summarizer))
        ) {
          summarizer = await globalThis.ai.summarizer.create();
        }

        if (data.imagePrompt && data.offscreenCanvas) {
          globalThis.tvmjsGlobalEnv = globalThis.tvmjsGlobalEnv || {};
          globalThis.tvmjsGlobalEnv.logger = (_type: string, message: string) =>
            globalThis.postMessage({
              progress: {
                text: message,
              },
            });

          try {
            globalThis.importScripts(...StableDiffusionLibs);
          } catch {
            // Ignore failure to load libs
          }

          await runStableDiffusion(
            {
              prompts: [[data.imagePrompt, ""]],
            } as StableDiffusionConfig,
            data.offscreenCanvas,
            true,
            false
          );

          globalThis.tvmjsGlobalEnv.logger("", "");

          if (data.hasWindowAI) {
            rebuildSession(
              "I'll try to create that using Stable Diffusion 1.5."
            );
          }
        } else {
          while (retry++ < 3 && !response) {
            if (cancel) break;

            try {
              if (data.hasWindowAI) {
                const aiAssistant = session as AILanguageModel;
                const aiOptions:
                  | AILanguageModelPromptOptions
                  | AISummarizerSummarizeOptions = {
                  signal: abortController.signal,
                };

                if (summarizer && data.summarizeText) {
                  // eslint-disable-next-line no-await-in-loop
                  response = await summarizer.summarize(
                    data.summarizeText,
                    aiOptions
                  );
                  rebuildSession();
                } else if (aiAssistant) {
                  response = data.streamId
                    ? aiAssistant.promptStreaming(data.text, aiOptions)
                    : // eslint-disable-next-line no-await-in-loop
                      (await aiAssistant.prompt(data.text, aiOptions)) || "";
                }
              } else {
                prompts.push({
                  content: data.summarizeText
                    ? `Summarize:\n\n${data.summarizeText}`
                    : data.text,
                  role: "user",
                  streamId: data.streamId,
                });

                const stream = Boolean(data.streamId);
                // eslint-disable-next-line no-await-in-loop
                const completions = await engine.chat.completions.create({
                  logprobs: true,
                  messages: prompts as ChatCompletionMessageParam[],
                  stream,
                  stream_options: { include_usage: false },
                  temperature: CONVO_STYLE_TEMPS[data.style].temperature,
                  top_logprobs: CONVO_STYLE_TEMPS[data.style].topK,
                  ...WEB_LLM_MODEL_CONFIG,
                });

                response = stream
                  ? (completions as AsyncIterable<ChatCompletionChunk>)
                  : (completions as ChatCompletion).choices[0].message
                      .content || "";
              }
            } catch (error) {
              console.error("Failed to get prompt response.", error);
            }
          }

          if (!response) console.error("Failed retires to create response.");
        }
      } catch (error) {
        console.error("Failed to create text session.", error);
      }

      if (!cancel) {
        if (response) {
          if (!markedLoaded) {
            globalThis.importScripts(...MARKED_LIBS);
            markedLoaded = true;
          }

          const sendMessage = (message: string, streamId?: number): void => {
            globalThis.postMessage({
              formattedResponse: globalThis.marked.parse(message, {
                headerIds: false,
                mangle: false,
              }),
              response: message,
              streamId,
            });

            if (prompts[prompts.length - 1]?.role !== "user") {
              const userPrompt = prompts.find(
                (prompt) =>
                  prompt.role === "user" && prompt.streamId === streamId
              );

              if (userPrompt) userPrompt.content = data.text;
              else {
                prompts.push({ content: data.text, role: "user", streamId });
              }
            }

            const assistantPrompt = prompts.find(
              (prompt) =>
                prompt.role === "assistant" && prompt.streamId === streamId
            );

            if (assistantPrompt) assistantPrompt.content = message;
            else {
              prompts.push({ content: message, role: "assistant", streamId });
            }
          };

          if (typeof response === "string") {
            sendMessage(response);
          } else {
            try {
              let reply = "";
              // @ts-expect-error ReadableStream will have an asyncIterator if Prompt API exists
              for await (const chunk of response) {
                if (cancel) break;

                reply +=
                  typeof chunk === "string"
                    ? chunk
                    : (chunk as ChatCompletionChunk).choices[0]?.delta
                        .content || "";

                sendMessage(reply, data.streamId);
              }
            } catch (error) {
              console.error("Failed to stream prompt response.", error);
            }
          }
        }

        if (data.streamId) {
          globalThis.postMessage({ complete: true, streamId: data.streamId });
        }
      }

      responding = false;

      if (cancel) {
        cancel = false;
        globalThis.postMessage("canceled");
      }
    }
  },
  { passive: true }
);
