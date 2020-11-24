import styles from '@/styles/System/WindowManager/WindowManager.module.scss';

import { AnimatePresence } from 'framer-motion';

import dynamic from 'next/dynamic';
import { focusClosestFocusableElement } from '@/utils/elements';
import { ProcessContext } from '@/contexts/ProcessManager';
import { useContext, useEffect } from 'react';

const ProcessWindow = dynamic(
  import('@/components/System/WindowManager/ProcessWindow')
);

const WindowManager: React.FC = () => {
  const { processes } = useContext(ProcessContext);

  useEffect(() => {
    window.addEventListener('blur', () => {
      if (document.activeElement instanceof HTMLIFrameElement) {
        focusClosestFocusableElement(document.activeElement);
      }
    });
  }, []);

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
