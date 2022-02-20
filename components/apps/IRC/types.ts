export type MessageTypes = "message" | "notice" | "system";

export type Message = {
  command?: string;
  error?: string;
  parameters?: string;
  prefix?: string;
  type?: MessageTypes;
};

export type IrcOutput = (
  output: Message,
  name?: string,
  server?: string,
  seenCommands?: string[]
) => void;
