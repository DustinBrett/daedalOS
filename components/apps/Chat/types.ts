export type Message = {
  text: string;
  type: "bot" | "user";
  writing?: boolean;
};
