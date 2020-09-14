export type SessionState = {
  foreground?: string;
  stackOrder?: Array<string>;
};

export type SessionContextType = {
  session: SessionState;
  background?: (id: string) => void;
  foreground?: (id: string) => void;
};
