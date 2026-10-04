import { type MLCEngine } from "@mlc-ai/web-llm";
import {
  runStableDiffusion,
  libs as StableDiffusionLibs,
} from "components/system/Desktop/Wallpapers/StableDiffusion";
import {
  type ConvoStyles,
  type WorkerMessage,
  type WorkerResponse,
} from "components/system/Taskbar/AI/types";

const CONVO_STYLE_TEMPS: Record<ConvoStyles, number> = {
  balanced: 0.6,
  creative: 0.7,
  precise: 0.5,
};

const WEB_LLM_MODEL = "DeepSeek-R1-Distill-Llama-8B-q4f32_1-MLC";

let activeId = 0;
let engine: Promise<MLCEngine> | undefined;

const respond = (response: WorkerResponse): void =>
  globalThis.postMessage(response);

const showProgress = (text: string): void => respond({ progress: text });

const loadEngine = (): Promise<MLCEngine> => {
  engine ||= import("@mlc-ai/web-llm")
    .then(({ CreateMLCEngine }) =>
      CreateMLCEngine(WEB_LLM_MODEL, {
        initProgressCallback: ({ text }) => showProgress(text),
      })
    )
    .catch((error: unknown) => {
      engine = undefined;

      throw error;
    });

  return engine;
};

globalThis.addEventListener(
  "message",
  async ({ data }: MessageEvent<WorkerMessage>) => {
    if (data === "init") return;

    if ("cancel" in data) {
      if (activeId === data.cancel) {
        activeId = 0;
        engine
          ?.then((llm) => llm.interruptGenerate())
          .catch(() => {
            // Ignore failure to interrupt
          });
      }

      return;
    }

    const { id } = data;

    activeId = id;

    try {
      if ("imagePrompt" in data) {
        globalThis.tvmjsGlobalEnv ||= {} as typeof globalThis.tvmjsGlobalEnv;
        globalThis.tvmjsGlobalEnv.logger = (_type: string, message: string) =>
          showProgress(message);

        try {
          globalThis.importScripts(...StableDiffusionLibs);
        } catch {
          // Ignore failure to load libs
        }

        await runStableDiffusion(
          { prompts: [[data.imagePrompt, ""]] },
          data.offscreenCanvas,
          true,
          false
        );
        showProgress("");
      } else {
        const llm = await loadEngine();

        if (activeId === id) {
          const chunks = await llm.chat.completions.create({
            messages: data.messages,
            stream: true,
            temperature: CONVO_STYLE_TEMPS[data.style],
            top_p: 0.9,
          });
          let text = "";

          // Breaking out early would leave web-llm's request lock held
          for await (const chunk of chunks) {
            text += chunk.choices[0]?.delta.content || "";

            if (activeId === id) respond({ id, text });
          }
        }
      }

      respond({ done: true, id });
    } catch (error) {
      console.error("Failed to create response.", error);

      respond({
        done: true,
        error:
          (error as Error).name === "ContextWindowSizeExceededError"
            ? "context"
            : "failed",
        id,
      });
    }

    if (activeId === id) activeId = 0;
  },
  { passive: true }
);
