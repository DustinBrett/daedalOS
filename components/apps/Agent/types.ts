type Animations =
  | "Acknowledge"
  | "Alert"
  | "Announce"
  | "Blink"
  | "Confused"
  | "Congratulate_2"
  | "Congratulate"
  | "Decline"
  | "DoMagic1"
  | "DoMagic2"
  | "DontRecognize"
  | "Explain"
  | "GestureDown"
  | "GestureLeft"
  | "GestureRight"
  | "GestureUp"
  | "GetAttention"
  | "GetAttentionContinued"
  | "GetAttentionReturn"
  | "Greet"
  | "Hearing_1"
  | "Hearing_2"
  | "Hearing_3"
  | "Hearing_4"
  | "Hide"
  | "Idle1_1"
  | "Idle1_2"
  | "Idle1_3"
  | "Idle1_4"
  | "Idle2_1"
  | "Idle2_2"
  | "Idle3_1"
  | "Idle3_2"
  | "LookDown"
  | "LookDownBlink"
  | "LookDownReturn"
  | "LookLeft"
  | "LookLeftBlink"
  | "LookLeftReturn"
  | "LookRight"
  | "LookRightBlink"
  | "LookRightReturn"
  | "LookUp"
  | "LookUpBlink"
  | "LookUpReturn"
  | "MoveDown"
  | "MoveLeft"
  | "MoveRight"
  | "MoveUp"
  | "Pleased"
  | "Process"
  | "Processing"
  | "Read"
  | "ReadContinued"
  | "Reading"
  | "ReadReturn"
  | "RestPose"
  | "Sad"
  | "Search"
  | "Searching"
  | "Show"
  | "StartListening"
  | "StopListening"
  | "Suggest"
  | "Surprised"
  | "Think"
  | "Thinking"
  | "Uncertain"
  | "Wave"
  | "Write"
  | "WriteContinued"
  | "WriteReturn"
  | "Writing";

export type AgentInstance = {
  animate: () => void;
  animations: () => Animations;
  gestureAt: (x: number, y: number) => void;
  moveTo: (x: number, y: number, duration?: number) => void;
  play: (
    animation: Animations,
    timeout?: number,
    callback?: () => void
  ) => void;
  show: (fast?: boolean, x?: number, y?: number) => void;
  speak: (text: string) => void;
  stop: () => void;
  stopCurrent: () => void;
};

export type AgentAction = (actions: (agent?: AgentInstance) => void) => void;

declare global {
  interface Window {
    clippy: {
      load: (
        agentName: string,
        callback: (agent: AgentInstance) => void
      ) => void;
    };
  }
}
