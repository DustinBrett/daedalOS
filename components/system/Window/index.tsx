import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import RndWindow from 'components/system/Window/RndWindow';
import Titlebar from 'components/system/Window/Titlebar';
import { useProcesses } from 'contexts/process';
import StyledWindow from 'styles/components/system/Window/StyledWindow';

type WindowProps = ProcessComponentProps & {
  children: React.ReactNode;
};

const Window = ({ children, id }: WindowProps): JSX.Element => {
  const {
    processes: {
      [id]: { backgroundColor, minimized }
    }
  } = useProcesses();

  return (
    <RndWindow id={id}>
      <StyledWindow minimized={minimized} style={{ backgroundColor }}>
        <Titlebar id={id} />
        {children}
      </StyledWindow>
    </RndWindow>
  );
};

export default Window;
