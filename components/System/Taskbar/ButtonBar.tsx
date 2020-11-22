import styles from '@/styles/System/Taskbar/ButtonBar.module.scss';

import { createPortal } from 'react-dom';
import { getNextContainerElement } from '@/utils/elements';
import { ProcessContext } from '@/contexts/ProcessManager';
import { SessionContext } from '@/contexts/SessionManager';
import { useContext, useState } from 'react';

const defaultView = 'All apps';

const ButtonBar: React.FC<{
  startButtonRef: React.RefObject<HTMLButtonElement>;
  buttonsRef: React.RefObject<HTMLOListElement>;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ startButtonRef, buttonsRef, setShowMenu }) => {
  const { foreground } = useContext(SessionContext);
  const { open } = useContext(ProcessContext);
  const [view, setView] = useState(defaultView);

  const buttons = [
    {
      title: 'START',
      alt: 'Expand',
      icon: '\ue700',
      isBold: true
    },
    {
      title: 'All apps',
      icon: '\ue179',
      isView: true
    },
    {
      title: 'Documents',
      icon: '\ue160',
      onClick: async (
        clickEvent: React.MouseEvent<HTMLElement, MouseEvent>
      ) => {
        const processId = await open(
          {
            icon: '/icons/programs/explorer.png',
            name: 'Documents',
            url: '/docs'
          },
          {},
          clickEvent.target
        );
        foreground(processId);
        setShowMenu(false);
      }
    },
    {
      title: 'Power',
      icon: '\ue7e8',
      onClick: () => window.location.reload()
    }
  ];

  return createPortal(
    <ol
      className={styles.buttons}
      ref={buttonsRef}
      tabIndex={-1}
      onMouseLeave={() => startButtonRef.current?.focus()}
    >
      {buttons.map(({ alt, icon, isBold, isView, title, onClick }) => (
        <li key={title}>
          <figure
            className={view === title ? styles.buttonSelected : ''}
            onClick={isView ? () => setView(view) : onClick}
            tabIndex={-1}
            title={alt || title}
          >
            <span data-icon={icon} />
            <figcaption>{isBold ? <strong>{title}</strong> : title}</figcaption>
          </figure>
        </li>
      ))}
    </ol>,
    getNextContainerElement()
  );
};

export default ButtonBar;
