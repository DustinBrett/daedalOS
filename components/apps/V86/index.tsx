import useV86 from 'components/apps/V86/useV86';
import useV86ScreenSize from 'components/apps/V86/useV86ScreenSize';
import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import { useProcesses } from 'contexts/process';
import { useRef } from 'react';
import StyledV86 from 'styles/components/apps/V86/StyledV86';

const V86 = ({ id }: ProcessComponentProps): JSX.Element => {
  const {
    processes: {
      [id]: { url = '' }
    }
  } = useProcesses();
  const screenRef = useRef<HTMLDivElement | null>(null);
  const { emulator, lockMouse } = useV86(url, screenRef);
  const txtStyle = useV86ScreenSize(id, emulator);

  return (
    <StyledV86 ref={screenRef} onClick={lockMouse}>
      <div style={txtStyle} />
      <canvas />
    </StyledV86>
  );
};

export default V86;
