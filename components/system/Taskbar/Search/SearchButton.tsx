import { useTheme } from "styled-components";
import { memo, useCallback } from "react";
import StyledSearchButton from "components/system/Taskbar/Search/StyledSearchButton";
import {
  importSearch,
  SEARCH_BUTTON_TITLE,
} from "components/system/Taskbar/functions";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { DIV_BUTTON_PROPS } from "utils/constants";
import { label } from "utils/functions";
import { useMenuPreload } from "hooks/useMenuPreload";

type StartButtonProps = {
  searchVisible: boolean;
  toggleSearch: (showMenu?: boolean) => void;
};

const SearchIcon = memo(() => (
  <svg viewBox="3 -1 30 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 0q1.516 0 2.922.391T26.547 1.5t2.227 1.727 1.727 2.227 1.109 2.625.391 2.922-.391 2.922-1.109 2.625-1.727 2.227-2.227 1.727-2.625 1.109-2.922.391q-1.953 0-3.742-.656t-3.289-1.891L1.703 31.705q-.297.297-.703.297t-.703-.297T0 31.002t.297-.703l12.25-12.266q-1.234-1.5-1.891-3.289T10 11.002q0-1.516.391-2.922T11.5 5.455t1.727-2.227 2.227-1.727T18.079.392t2.922-.391zm0 20q1.859 0 3.5-.711t2.859-1.93 1.93-2.859T30 11t-.711-3.5-1.93-2.859-2.859-1.93T21 2t-3.5.711-2.859 1.93-1.93 2.859T12 11t.711 3.5 1.93 2.859 2.859 1.93T21 20z" />
  </svg>
));

const SearchButton: FC<StartButtonProps> = ({
  searchVisible,
  toggleSearch,
}) => {
  const {
    sizes: { taskbar },
  } = useTheme();
  const onClick = useCallback(() => toggleSearch(), [toggleSearch]);

  return (
    <StyledSearchButton
      $active={searchVisible}
      $left={taskbar.button.width}
      onClick={onClick}
      {...DIV_BUTTON_PROPS}
      {...label(SEARCH_BUTTON_TITLE)}
      {...useTaskbarContextMenu()}
      {...useMenuPreload(importSearch)}
    >
      <SearchIcon />
    </StyledSearchButton>
  );
};

export default memo(SearchButton);
