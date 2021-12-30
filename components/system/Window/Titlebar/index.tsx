import rndDefaults from "components/system/Window/RndWindow/rndDefaults";
import StyledTitlebar from "components/system/Window/Titlebar/StyledTitlebar";
import useTitlebarContextMenu from "components/system/Window/Titlebar/useTitlebarContextMenu";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import {
  CloseIcon,
  MaximizedIcon,
  MaximizeIcon,
  MinimizeIcon,
} from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import useDoubleClick from "hooks/useDoubleClick";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";

type TitlebarProps = {
  id: string;
};

const Titlebar = ({ id }: TitlebarProps): JSX.Element => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const {
    allowResizing = true,
    hideTitlebarIcon,
    icon,
    title,
    maximized,
  } = process || {};
  const { foregroundId } = useSession();
  const isForeground = id === foregroundId;
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const onClickClose = useDoubleClick(onClose);
  const onClickMaximize = useDoubleClick(onMaximize);

  return (
    <StyledTitlebar
      $foreground={isForeground}
      className={rndDefaults.dragHandleClassName}
      {...useTitlebarContextMenu(id)}
    >
      <Button as="h1" {...(allowResizing ? onClickMaximize : {})}>
        <figure>
          {!hideTitlebarIcon && (
            <Icon alt={title} imgSize={16} src={icon} {...onClickClose} />
          )}
          <figcaption>{title}</figcaption>
        </figure>
      </Button>
      <nav className="cancel">
        <Button className="minimize" onClick={onMinimize} title="Minimize">
          <MinimizeIcon />
        </Button>
        <Button
          className="maximize"
          disabled={!allowResizing}
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
