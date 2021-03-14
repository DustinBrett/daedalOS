import { CloseIcon, MaximizeIcon, MinimizeIcon } from 'components/system/Icons';
import { useProcesses } from 'contexts/process';
import { useCallback } from 'react';
import Button from 'styles/common/Button';
import StyledTitlebar from 'styles/components/system/Window/StyledTitlebar';

type TitlebarProps = {
  id: string;
};

const Titlebar = ({ id }: TitlebarProps): JSX.Element => {
  const {
    close,
    maximize,
    minimize,
    processes: {
      [id]: { icon, title }
    }
  } = useProcesses();
  const onMinimize = useCallback(() => minimize(id), [id, minimize]);
  const onMaximize = useCallback(() => maximize(id), [id, maximize]);
  const onClose = useCallback(() => close(id), [id, close]);

  return (
    <StyledTitlebar className="handle">
      <h1>
        <figure>
          <img src={icon} alt={title} />
          <figcaption>{title}</figcaption>
        </figure>
      </h1>
      <nav className="cancel">
        <Button onClick={onMinimize}>
          <MinimizeIcon />
        </Button>
        <Button onClick={onMaximize}>
          <MaximizeIcon />
        </Button>
        <Button onClick={onClose}>
          <CloseIcon />
        </Button>
      </nav>
    </StyledTitlebar>
  );
};

export default Titlebar;
