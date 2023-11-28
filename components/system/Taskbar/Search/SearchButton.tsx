import { useTheme } from "styled-components";
import { Search as SearchIcon } from "components/system/Taskbar/Search/Icons";
import StyledTaskbarButton from "components/system/Taskbar/StyledTaskbarButton";
import { SEARCH_BUTTON_TITLE } from "components/system/Taskbar/functions";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { DIV_BUTTON_PROPS } from "utils/constants";
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
      {...DIV_BUTTON_PROPS}
      {...label(SEARCH_BUTTON_TITLE)}
      {...useTaskbarContextMenu()}
    >
      <SearchIcon />
    </StyledTaskbarButton>
  );
};

export default SearchButton;
