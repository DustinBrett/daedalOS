import { memo } from "react";
import { importAIChat } from "components/system/Taskbar/functions";
import { AIIcon } from "components/system/Taskbar/AI/icons";
import StyledAIButton from "components/system/Taskbar/AI/StyledAIButton";
import { AI_TITLE, AI_WINDOW_ID, DIV_BUTTON_PROPS } from "utils/constants";
import { label } from "utils/functions";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { useSession } from "contexts/session";
import { useMenuPreload } from "hooks/useMenuPreload";

type AIButtonProps = {
  aiVisible: boolean;
  toggleAI: () => void;
};

const AIButton: FC<AIButtonProps> = ({ aiVisible, toggleAI }) => {
  const menuPreloadHandler = useMenuPreload(importAIChat);
  const { removeFromStack } = useSession();

  return (
    <StyledAIButton
      onClick={() => {
        toggleAI();
        if (aiVisible) removeFromStack(AI_WINDOW_ID);
      }}
      {...DIV_BUTTON_PROPS}
      {...label(AI_TITLE)}
      {...useTaskbarContextMenu()}
      {...menuPreloadHandler}
    >
      <AIIcon />
    </StyledAIButton>
  );
};

export default memo(AIButton);
