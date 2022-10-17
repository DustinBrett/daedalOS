import { checkIfBlogPostHasBeenViewed } from "components/apps/Agent/actions";
import StyledAgent from "components/apps/Agent/StyledAgent";
import type { AgentAction, AgentInstance } from "components/apps/Agent/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import { useCallback, useEffect, useRef, useState } from "react";
import { TASKBAR_HEIGHT } from "utils/constants";
import { loadFiles, viewHeight, viewWidth } from "utils/functions";

const DEFAULT_AGENT = "Merlin";
const AGENT_SIZE_PX = 128;
const POSITION_PADDING_PX = 32;

const Agent: FC<ComponentProcessProps> = ({ id }) => {
  const agentRef = useRef<HTMLDivElement | null>(null);
  const { processes } = useProcesses();
  const { libs } = processes[id] || {};
  // eslint-disable-next-line react/hook-use-state, @typescript-eslint/no-unused-vars
  const [_previousProcessesState, setPreviousProcessesState] =
    useState<typeof processes>(processes);
  const [agent, setAgent] = useState<AgentInstance>();
  const loadAgent = useCallback(async () => {
    if (!libs || document.querySelector(".clippy")) return;

    await loadFiles(libs);

    window.clippy?.load(DEFAULT_AGENT, (currentAgent) => {
      agentRef.current?.append(
        ...document.querySelectorAll(".clippy, .clippy-balloon")
      );

      currentAgent.show(
        false,
        viewHeight() - AGENT_SIZE_PX - TASKBAR_HEIGHT - POSITION_PADDING_PX,
        viewWidth() - AGENT_SIZE_PX - POSITION_PADDING_PX
      );

      setAgent(currentAgent);
    });
  }, [libs]);
  const actionTimerRef = useRef(0);
  const act = useCallback<AgentAction>(
    (actions) => {
      if (actionTimerRef.current) window.clearTimeout(actionTimerRef.current);
      actionTimerRef.current = window.setTimeout(() => actions(agent), 50);
    },
    [agent]
  );

  useEffect(() => {
    if (!agent) loadAgent();
  }, [agent, loadAgent]);

  useEffect(() => {
    if (agent) {
      setPreviousProcessesState((currentPreviousProcessesState) => {
        checkIfBlogPostHasBeenViewed(
          currentPreviousProcessesState,
          processes,
          act
        );

        return processes;
      });
    }
  }, [act, agent, processes]);

  return <StyledAgent ref={agentRef} />;
};

export default Agent;
