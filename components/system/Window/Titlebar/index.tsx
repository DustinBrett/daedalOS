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
import { useCallback, useRef } from "react";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { LONG_PRESS_DELAY_MS, PREVENT_SCROLL } from "utils/constants";
import { label } from "utils/functions";

type TitlebarProps = {
  id: string;
};

const Titlebar: FC<TitlebarProps> = ({ id }) => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const {
    allowResizing = true,
    closing,
    componentWindow,
    hideMaximizeButton,
    hideMinimizeButton,
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
  const titlebarContextMenu = useTitlebarContextMenu(id);
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPositionRef = useRef<DOMRect>();
  const touchesRef = useRef<TouchList>();
  const onTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLHeadingElement>) => {
      const { x, y } = componentWindow?.getBoundingClientRect() || {};

      if (
        Date.now() - touchStartTimeRef.current >= LONG_PRESS_DELAY_MS &&
        touchStartPositionRef.current &&
        touchStartPositionRef.current.x === x &&
        touchStartPositionRef.current.y === y
      ) {
        titlebarContextMenu.onContextMenuCapture(
          Object.assign(event, {
            touches: touchesRef.current,
          })
        );
      }
    },
    [componentWindow, titlebarContextMenu]
  );
  const onTouchStart = useCallback(
    ({ touches }: React.TouchEvent<HTMLHeadingElement>) => {
      if (componentWindow) {
        componentWindow.blur();
        componentWindow.focus(PREVENT_SCROLL);
        touchStartTimeRef.current = Date.now();
        touchStartPositionRef.current = componentWindow.getBoundingClientRect();
        touchesRef.current = touches as unknown as TouchList;
      }
    },
    [componentWindow]
  );

  return (
    <StyledTitlebar
      $foreground={isForeground}
      className={rndDefaults.dragHandleClassName}
      {...titlebarContextMenu}
    >
      <Button
        as="h1"
        {...(allowResizing && !closing ? onClickMaximize : {})}
        onTouchEndCapture={onTouchEnd}
        onTouchStartCapture={onTouchStart}
      >
        <figure>
          {!hideTitlebarIcon && (
            <Icon alt={title} imgSize={16} src={icon} {...onClickClose} />
          )}
          <figcaption>{title}</figcaption>
        </figure>
      </Button>
      <nav className="cancel">
        {!hideMinimizeButton && (
          <Button
            className="minimize"
            onClick={onMinimize}
            {...label("Minimize")}
          >
            <MinimizeIcon />
          </Button>
        )}
        {!hideMaximizeButton && (
          <Button
            className="maximize"
            disabled={!allowResizing}
            onClick={onMaximize}
            {...label("Maximize")}
          >
            {maximized ? <MaximizedIcon /> : <MaximizeIcon />}
          </Button>
        )}
        <Button
          $short={hideMaximizeButton && hideMinimizeButton}
          className="close"
          onClick={onClose}
          {...label("Close")}
        >
          <CloseIcon />
        </Button>
      </nav>
    </StyledTitlebar>
  );
};

export default Titlebar;
