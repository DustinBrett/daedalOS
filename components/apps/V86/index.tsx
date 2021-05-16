import StyledV86 from 'components/apps/V86/StyledV86';
import useV86 from 'components/apps/V86/useV86';
import useV86ScreenSize from 'components/apps/V86/useV86ScreenSize';
import type { ComponentProcessProps } from 'components/system/Apps/RenderComponent';
import { useProcesses } from 'contexts/process';
import { useRef } from 'react';

const V86 = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    processes: { [id]: { url = '' } = {} }
  } = useProcesses();
  const screenRef = useRef<HTMLDivElement | null>(null);
  const { emulator, lockMouse } = useV86(id, url, screenRef);
  const txtStyle = useV86ScreenSize(id, emulator);

  return (
    <StyledV86 ref={screenRef} onClick={lockMouse}>
      <div style={txtStyle} />
      <canvas />
    </StyledV86>
  );
};

export default V86;
