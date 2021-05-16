import StyledJSDOS from 'components/apps/JSDOS/StyledJSDOS';
import useJSDOS from 'components/apps/JSDOS/useJSDOS';
import type { ComponentProcessProps } from 'components/system/Apps/RenderComponent';
import { useProcesses } from 'contexts/process';
import { useRef } from 'react';

const JSDOS = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    processes: { [id]: { url = '' } = {} }
  } = useProcesses();
  const screenRef = useRef<HTMLDivElement | null>(null);

  useJSDOS(id, url, screenRef);

  return <StyledJSDOS ref={screenRef} />;
};

export default JSDOS;
