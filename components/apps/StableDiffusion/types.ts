export type Prompt = [string, string];

type Prompts = Prompt[];

declare global {
  var Tokenizer: {
    init: () => Promise<void>;
    TokenizerWasm: new (config: string) => (name: string) => Promise<unknown>;
  };
  var sentencepiece: {
    sentencePieceProcessor: (url: string) => void;
  };
  var tvmjsGlobalEnv: {
    asyncOnGenerate: () => Promise<void>;
    asyncOnReset: () => Promise<void>;
    canvas?: HTMLCanvasElement | OffscreenCanvas;
    getTokenizer: (name: string) => Promise<unknown>;
    initialized: boolean;
    logger: (type: string, message: string) => void;
    message: string;
    prompts: Prompts;
    response: string;
    sentencePieceProcessor: (url: string) => void;
    systemPrompt: string;
  };
}

export type StableDiffusionConfig = {
  prompts: Prompts;
};
