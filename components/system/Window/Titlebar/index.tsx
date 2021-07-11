import StyledTitlebar from "components/system/Window/Titlebar/StyledTitlebar";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import {
  CloseIcon,
  MaximizedIcon,
  MaximizeIcon,
  MinimizeIcon,
} from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { doubleClick } from "utils/functions";

type TitlebarProps = {
  id: string;
};

const Titlebar = ({ id }: TitlebarProps): JSX.Element => {
  const {
    processes: {
      [id]: {
        autoSizing = false,
        icon = "",
        lockAspectRatio = false,
        title = "",
        maximized = false,
      } = {},
    },
  } = useProcesses();
  const { foregroundId } = useSession();
  const isForeground = id === foregroundId;
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const disableMaximize = autoSizing && !lockAspectRatio;

  return (
    <StyledTitlebar className="handle" foreground={isForeground}>
      <Button
        as="h1"
        onClick={disableMaximize ? undefined : doubleClick(onMaximize)}
      >
        <figure>
          <Icon
            src={icon}
            alt={title}
            onClick={doubleClick(onClose)}
            imgSize={16}
          />
          <figcaption>{title}</figcaption>
        </figure>
      </Button>
      <nav className="cancel">
        <Button className="minimize" onClick={onMinimize} title="Minimize">
          <MinimizeIcon />
        </Button>
        <Button
          className="maximize"
          disabled={disableMaximize}
          onClick={onMaximize}
          title="Maximize"
        >
          {maximized ? <MaximizedIcon /> : <MaximizeIcon />}
        </Button>
        <Button className="close" onClick={onClose} title="Close">
          <CloseIcon />
        </Button>
      </nav>
    </StyledTitlebar>
  );
};

export default Titlebar;
