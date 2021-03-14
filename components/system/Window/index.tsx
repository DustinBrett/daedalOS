import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import Titlebar from 'components/system/Window/Titlebar';
import { useProcesses } from 'contexts/process';
import useDraggable from 'hooks/useDraggable';
import useResizable from 'hooks/useResizeable';
import { Rnd } from 'react-rnd';
import StyledWindow from 'styles/components/system/Window/StyledWindow';
import rndDefaults from 'utils/rndDefaults';

const Window: React.FC<ProcessComponentProps> = ({ children, id }) => {
  const {
    processes: {
      [id]: { maximized, minimized }
    }
  } = useProcesses();
  const { x, y, updatePosition } = useDraggable(maximized);
  const { height, width, updateSize } = useResizable(maximized);

  return (
    <Rnd
      disableDragging={maximized}
      enableResizing={!maximized}
      size={{ height, width }}
      onDragStop={updatePosition}
      onResize={updateSize}
      position={{ x, y }}
      {...rndDefaults}
    >
      <StyledWindow minimized={minimized}>
        <Titlebar id={id} />
        {children}
      </StyledWindow>
    </Rnd>
  );
};

export default Window;
