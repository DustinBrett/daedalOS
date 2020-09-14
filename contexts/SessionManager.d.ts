export type SessionState = {
  foreground?: string;
};

export type SessionContextType = {
  session: SessionState;
  background?: (id: string) => void;
  foreground?: (id: string) => void;
};
