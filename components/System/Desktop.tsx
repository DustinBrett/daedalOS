import styles from '@/styles/System/Desktop.module.scss';

import type { FC } from 'react';

import { useContext } from 'react';
import { useFileDrop } from '@/utils/events';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';

const Desktop: FC = ({ children }) => {
  const { load } = useContext(ProcessContext),
    { getState } = useContext(SessionContext),
    fileDropHandler = useFileDrop(({ pageX, pageY }, file) => {
      load(file, getState({ name }), { startX: pageX, startY: pageY });
    });

  return (
    <main className={styles.desktop} {...fileDropHandler}>
      {children}
    </main>
  );
};

export default Desktop;
