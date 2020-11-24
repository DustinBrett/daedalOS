import styles from '@/styles/System/WindowManager/WindowManager.module.scss';

import { AnimatePresence } from 'framer-motion';

import dynamic from 'next/dynamic';
import useIFrameFocuser from '@/hooks/useIFrameFocuser';
import { ProcessContext } from '@/contexts/ProcessManager';
import { useContext } from 'react';

const ProcessWindow = dynamic(
  import('@/components/System/WindowManager/ProcessWindow')
);

const WindowManager: React.FC = () => {
  const { processes } = useContext(ProcessContext);

  useIFrameFocuser();

  return (
    <div className={styles.windows}>
      <AnimatePresence>
        {processes.map((process) => (
          <ProcessWindow key={process.id} {...process} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WindowManager;
