import { memo } from "react";
import { importAIChat } from "components/system/Taskbar/functions";
import { AIIcon } from "components/system/Taskbar/AI/icons";
import StyledAIButton from "components/system/Taskbar/AI/StyledAIButton";
import {
  AI_TITLE,
  AI_WINDOW_ID,
  CLICK_FOCUSABLE_ELEMENT,
} from "utils/constants";
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
  const onClick = (): void => {
    toggleAI();
    if (aiVisible) removeFromStack(AI_WINDOW_ID);
  };

  return (
    <StyledAIButton
      aria-expanded={aiVisible}
      aria-haspopup="dialog"
      {...(aiVisible && { "aria-controls": AI_WINDOW_ID })}
      onClick={onClick}
      {...CLICK_FOCUSABLE_ELEMENT}
      {...label(AI_TITLE)}
      {...useTaskbarContextMenu()}
      {...menuPreloadHandler}
    >
      <AIIcon />
    </StyledAIButton>
  );
};

export default memo(AIButton);
