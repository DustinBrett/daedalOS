import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import Titlebar from 'components/system/Window/Titlebar';
import { useProcesses } from 'contexts/process';
import useDraggableAndResizable from 'hooks/useDraggableAndResizable';
import { Rnd } from 'react-rnd';
import StyledWindow from 'styles/components/system/Window/StyledWindow';
import rndDefaults from 'utils/rndDefaults';

type WindowProps = ProcessComponentProps & {
  children: React.ReactNode;
};

const Window = ({ children, id }: WindowProps): JSX.Element => {
  const {
    processes: {
      [id]: { maximized, minimized }
    }
  } = useProcesses();
  const {
    height,
    width,
    updateSize,
    x,
    y,
    updatePosition
  } = useDraggableAndResizable(maximized);

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
