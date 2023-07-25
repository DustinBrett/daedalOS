import type { InitProgressReport } from "@mlc-ai/web-llm";
import { ChatModule } from "@mlc-ai/web-llm";

type Data = { model?: string; prompt?: string; type: string };

const CACHE_WARNING =
  "It can take a while when we first visit this page to populate the cache. Later refreshes will become faster.";
const DEFAULT_MODEL = "[RedPajama 3B]";

const configMap: Record<string, string> = {
  "[RedPajama 3B]": "RedPajama-INCITE-Chat-3B-v1-q4f32_0",
  "[Vicuna 7B]": "vicuna-v1-7b-q4f32_0",
};
const config = {
  model_lib_map: {
    "RedPajama-INCITE-Chat-3B-v1-q4f32_0":
      "/Program Files/WebLLM/RedPajama-INCITE-Chat-3B-v1-q4f32_0-webgpu.wasm",
    "vicuna-v1-7b-q4f32_0":
      "/Program Files/WebLLM/vicuna-v1-7b-q4f32_0-webgpu.wasm",
  },
  model_list: [
    {
      local_id: "RedPajama-INCITE-Chat-3B-v1-q4f32_0",
      model_url:
        "https://huggingface.co/mlc-ai/mlc-chat-RedPajama-INCITE-Chat-3B-v1-q4f32_0/resolve/main/",
    },
    {
      local_id: "vicuna-v1-7b-q4f32_0",
      model_url:
        "https://huggingface.co/mlc-ai/mlc-chat-vicuna-v1-7b-q4f32_0/resolve/main/",
    },
  ],
};

const generateProgressCallback = (step: number): void => {
  globalThis.postMessage({
    message: `Generating (Step ${step})`,
    type: "[progress]",
  });
};

const initProgressCallback = (report: InitProgressReport): void => {
  globalThis.postMessage({
    message: report.text.replace(CACHE_WARNING, ""),
    type: "[init]",
  });
};

let initalized = false;
let startedChat = false;
let chatModule: ChatModule;
let chatModel: string;

globalThis.document = {
  URL: globalThis.location.origin,
} as Document;

globalThis.addEventListener(
  "message",
  async ({ data }: { data: Data }) => {
    if (!initalized && data.type === "init") {
      initalized = true;

      chatModel =
        configMap[data.model?.replace("WebLLM ", "") || DEFAULT_MODEL];
      chatModule = new ChatModule();
      chatModule.setInitProgressCallback(initProgressCallback);
    } else if (data.type === "reset") {
      await chatModule.interruptGenerate();
      await chatModule.resetChat();
    } else if (data.prompt && data.type === "chat") {
      // TODO: Support changing system prompt
      if (!startedChat) {
        await chatModule.reload(chatModel, undefined, config);
        startedChat = true;
      }

      chatModule
        .generate(data.prompt, generateProgressCallback)
        .then(globalThis.postMessage);
    }
  },
  { passive: true }
);
