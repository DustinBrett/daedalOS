export type Message = {
  text: string;
  type: "assistant" | "system" | "user";
  writing?: boolean;
};
