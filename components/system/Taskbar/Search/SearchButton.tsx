import { Search as SearchIcon } from "components/system/Taskbar/Search/Icons";
import StyledTaskbarButton from "components/system/Taskbar/StyledTaskbarButton";
import { useTheme } from "styled-components";

import { SEARCH_BUTTON_LABEL } from "components/system/Taskbar/functions";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { label } from "utils/functions";

type StartButtonProps = {
  searchVisible: boolean;
  toggleSearch: (showMenu?: boolean) => void;
};

const SearchButton: FC<StartButtonProps> = ({
  searchVisible,
  toggleSearch,
}) => {
  const {
    sizes: { taskbar },
  } = useTheme();

  return (
    <StyledTaskbarButton
      $active={searchVisible}
      $left={taskbar.button.width}
      onClick={() => toggleSearch()}
      {...label(SEARCH_BUTTON_LABEL)}
      {...useTaskbarContextMenu()}
    >
      <SearchIcon />
    </StyledTaskbarButton>
  );
};

export default SearchButton;
