import useDoubleClick from 'components/system/useDoubleClick';
import StyledTitlebar from 'components/system/Window/Titlebar/StyledTitlebar';
import useWindowActions from 'components/system/Window/Titlebar/useWindowActions';
import {
  CloseIcon,
  MaximizedIcon,
  MaximizeIcon,
  MinimizeIcon
} from 'components/system/Window/Titlebar/WindowActionIcons';
import { useProcesses } from 'contexts/process';
import { useSession } from 'contexts/session';
import { useMemo } from 'react';
import Button from 'styles/common/Button';
import Icon from 'styles/common/Icon';

type TitlebarProps = {
  id: string;
};

const Titlebar = ({ id }: TitlebarProps): JSX.Element => {
  const {
    processes: {
      [id]: {
        autoSizing = false,
        icon = '',
        lockAspectRatio = false,
        title = '',
        maximized = false
      } = {}
    }
  } = useProcesses();
  const { foregroundId } = useSession();
  const isForeground = useMemo(() => id === foregroundId, [foregroundId, id]);
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const isMaximizable = useMemo(() => autoSizing && !lockAspectRatio, [
    autoSizing,
    lockAspectRatio
  ]);

  return (
    <StyledTitlebar className="handle" foreground={isForeground}>
      <h1
        onClick={useDoubleClick(isMaximizable ? () => undefined : onMaximize)}
      >
        <figure>
          <Icon
            src={icon}
            alt={title}
            onClick={useDoubleClick(onClose)}
            size={16}
          />
          <figcaption>{title}</figcaption>
        </figure>
      </h1>
      <nav className="cancel">
        <Button className="minimize" onClick={onMinimize} title="Minimize">
          <MinimizeIcon />
        </Button>
        <Button
          className="maximize"
          disabled={isMaximizable}
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
