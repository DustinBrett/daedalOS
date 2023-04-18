type Prompts = [string, string][];

export type StableDiffusionConfig = {
  prompts: Prompts;
};

export type TvmjsGlobalEnv = {
  asyncOnGenerate: () => Promise<void>;
  canvas: HTMLCanvasElement;
  getTokenizer: (name: string) => Promise<unknown>;
  initialized: boolean;
  prompts: Prompts;
};

export type ITokenizer = {
  TokenizerWasm: new (config: string) => (name: string) => Promise<unknown>;
  init: () => Promise<void>;
};
