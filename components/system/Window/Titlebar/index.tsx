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
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { PREVENT_SCROLL } from "utils/constants";
import useDoubleClick from "utils/useDoubleClick";

type TitlebarProps = {
  id: string;
};

const Titlebar = ({ id }: TitlebarProps): JSX.Element => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const {
    autoSizing,
    componentWindow,
    hideTitlebarIcon,
    icon,
    lockAspectRatio,
    title,
    maximized,
  } = process || {};
  const { foregroundId } = useSession();
  const isForeground = id === foregroundId;
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const disableMaximize = autoSizing && !lockAspectRatio;
  const onClickClose = useDoubleClick(onClose);
  const onClickMaximize = useDoubleClick(onMaximize);
  const dragHandle = {
    className: rndDefaults.dragHandleClassName,
    onTouchStartCapture: ({ target }: React.TouchEvent) => {
      if (target instanceof HTMLElement) target.click();
      componentWindow?.focus(PREVENT_SCROLL);
    },
  };

  return (
    <StyledTitlebar
      foreground={isForeground}
      {...dragHandle}
      {...useTitlebarContextMenu(id)}
    >
      <Button as="h1" {...(!disableMaximize ? onClickMaximize : {})}>
        <figure>
          {!hideTitlebarIcon && (
            <Icon src={icon} alt={title} imgSize={16} {...onClickClose} />
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
