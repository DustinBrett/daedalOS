import SearchIcon from "components/system/Taskbar/Search/Icon";
import StyledTaskbarButton from "components/system/Taskbar/StyledTaskbarButton";
import { useTheme } from "styled-components";

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
      {...label("Type here to search")}
      {...useTaskbarContextMenu()}
    >
      <SearchIcon />
    </StyledTaskbarButton>
  );
};

export default SearchButton;
