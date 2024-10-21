import {
  AI_DISPLAY_TITLE,
  WINDOW_ID,
} from "components/system/Taskbar/AI/constants";
import { AIIcon } from "components/system/Taskbar/AI/icons";
import StyledAIButton from "components/system/Taskbar/AI/StyledAIButton";
import { DIV_BUTTON_PROPS } from "utils/constants";
import { label } from "utils/functions";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { useSession } from "contexts/session";

type AIButtonProps = {
  aiVisible: boolean;
  toggleAI: () => void;
};

const AIButton: FC<AIButtonProps> = ({ aiVisible, toggleAI }) => {
  const { removeFromStack } = useSession();

  return (
    <StyledAIButton
      onClick={() => {
        toggleAI();
        if (aiVisible) removeFromStack(WINDOW_ID);
      }}
      {...DIV_BUTTON_PROPS}
      {...label(AI_DISPLAY_TITLE)}
      {...useTaskbarContextMenu()}
    >
      <AIIcon />
    </StyledAIButton>
  );
};

export default AIButton;
