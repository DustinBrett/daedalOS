export type SessionProcessState = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type SessionProcessStates = { [key: string]: SessionProcessState };

export type SessionState = {
  foregroundId: string;
  states: SessionProcessStates;
  stackOrder: string[];
};

export type SessionContextType = {
  session: SessionState;
  foreground: (id: string) => void;
  getState: (processSelector: {
    id?: string;
    name?: string;
  }) => SessionProcessState;
  saveState: (id: string, state: SessionProcessState) => void;
};

export type SessionAction = {
  foregroundId?: string;
  state?: SessionProcessStates;
};
