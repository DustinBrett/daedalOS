const libs = [
  "/System/tvm/tvmjs_runtime.wasi.js",
  "/System/tvm/tvmjs.bundle.js",
  "/Program Files/WebLLM/llm_chat.js",
  "/Program Files/WebLLM/sentencepiece.js",
];

const runLLM = async (message: string): Promise<string> => {
  globalThis.tvmjsGlobalEnv.message = message;

  await globalThis.tvmjsGlobalEnv.asyncOnGenerate();

  return globalThis.tvmjsGlobalEnv.response;
};

let initalized = false;

globalThis.addEventListener(
  "message",
  ({ data }: { data: { prompt?: string; type: string } }) => {
    if (!initalized && data.type === "init") {
      initalized = true;

      globalThis.tvmjsGlobalEnv = globalThis.tvmjsGlobalEnv || {};
      globalThis.tvmjsGlobalEnv.logger = (type: string, message: string) =>
        globalThis.postMessage({ message, type });

      globalThis.importScripts(...libs);

      globalThis.tvmjsGlobalEnv.sentencePieceProcessor = (url: string) =>
        globalThis.sentencepiece.sentencePieceProcessor(url);
    } else if (data.type === "reset") {
      globalThis.tvmjsGlobalEnv.response = "";
      globalThis.tvmjsGlobalEnv.message = "";
      globalThis.tvmjsGlobalEnv.systemPrompt = "";

      globalThis.tvmjsGlobalEnv.asyncOnReset();
    } else if (data.prompt) {
      if (data.type === "system") {
        globalThis.tvmjsGlobalEnv.systemPrompt = data.prompt;
      } else if (data.type === "chat") {
        runLLM(data.prompt).then(globalThis.postMessage);
      }
    }
  },
  { passive: true }
);
