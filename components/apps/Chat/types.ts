export type Message = {
  command?: string;
  image?: string;
  text: string;
  type: "assistant" | "system" | "user";
  writing?: boolean;
};
