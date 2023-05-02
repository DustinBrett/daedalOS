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
  ({ data }: { data: string | { prompt: string; type: "system" } }) => {
    if (!initalized && data === "init") {
      initalized = true;

      globalThis.tvmjsGlobalEnv = globalThis.tvmjsGlobalEnv || {};
      globalThis.tvmjsGlobalEnv.logger = (type: string, message: string) =>
        globalThis.postMessage({ message, type });

      globalThis.importScripts(...libs);

      globalThis.tvmjsGlobalEnv.sentencePieceProcessor = (url: string) =>
        globalThis.sentencepiece.sentencePieceProcessor(url);
    } else if (typeof data === "object") {
      globalThis.tvmjsGlobalEnv.systemPrompt = data.prompt;
    } else {
      runLLM(data).then(globalThis.postMessage);
    }
  },
  { passive: true }
);
