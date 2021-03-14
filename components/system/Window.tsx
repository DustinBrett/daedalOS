import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import { useProcesses } from 'contexts/process';
import StyledWindow from 'styles/components/system/StyledWindow';

const Window: React.FC<ProcessComponentProps> = ({ children, id }) => {
  const {
    processes: {
      [id]: { minimized }
    }
  } = useProcesses();

  return <StyledWindow minimized={minimized}>{children}</StyledWindow>;
};

export default Window;
