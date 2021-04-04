import { CloseIcon, MaximizeIcon, MinimizeIcon } from 'components/system/Icons';
import { useProcesses } from 'contexts/process';
import useWindowActions from 'hooks/useWindowActions';
import Button from 'styles/common/Button';
import Image from 'styles/common/Image';
import StyledTitlebar from 'styles/components/system/Window/StyledTitlebar';

type TitlebarProps = {
  id: string;
};

const Titlebar = ({ id }: TitlebarProps): JSX.Element => {
  const {
    processes: {
      [id]: { autoSizing, icon, title }
    }
  } = useProcesses();
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);

  return (
    <StyledTitlebar className="handle">
      <h1>
        <figure>
          <Image src={icon} alt={title} />
          <figcaption>{title}</figcaption>
        </figure>
      </h1>
      <nav className="cancel">
        <Button onClick={onMinimize}>
          <MinimizeIcon />
        </Button>
        <Button className="maximize" onClick={onMaximize} disabled={autoSizing}>
          <MaximizeIcon />
        </Button>
        <Button className="close" onClick={onClose}>
          <CloseIcon />
        </Button>
      </nav>
    </StyledTitlebar>
  );
};

export default Titlebar;
