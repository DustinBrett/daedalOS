const libs = [
  "/Program Files/WebLLM/tvmjs_runtime.wasi.js",
  "/Program Files/WebLLM/tvmjs.bundle.js",
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
  ({ data }: { data: string }) => {
    if (!initalized && data === "init") {
      initalized = true;

      globalThis.tvmjsGlobalEnv = globalThis.tvmjsGlobalEnv || {};

      globalThis.importScripts(...libs);

      globalThis.tvmjsGlobalEnv.sentencePieceProcessor = (url: string) =>
        globalThis.sentencepiece.sentencePieceProcessor(url);
    } else {
      runLLM(data).then(globalThis.postMessage);
    }
  },
  { passive: true }
);
