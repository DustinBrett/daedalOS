type Prompts = [string, string][];

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
    canvas: HTMLCanvasElement;
    getTokenizer: (name: string) => Promise<unknown>;
    initialized: boolean;
    logger: (type: string, message: string) => void;
    message: string;
    prompts: Prompts;
    response: string;
    sentencePieceProcessor: (url: string) => void;
  };
}
/* eslint-enable vars-on-top, no-var */

export type StableDiffusionConfig = {
  prompts: Prompts;
};
