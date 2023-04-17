export type StableDiffusionConfig = {
  prompts: [string, string][];
  update: () => Promise<void>;
  updateMins: number;
};
