export type Prompt = [string, string];

type Prompts = Prompt[];

/* eslint-disable vars-on-top, no-var  */
declare global {
  var Tokenizer: {
    TokenizerWasm: new (config: string) => (name: string) => Promise<unknown>;
    init: () => Promise<void>;
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
/* eslint-enable vars-on-top, no-var */

export type StableDiffusionConfig = {
  prompts: Prompts;
};
