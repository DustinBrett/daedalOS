import styles from '@/styles/Window.module.scss';

import type { FC } from 'react';
import type { RndDragEvent } from 'react-rnd';
import { useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';

type Window = {
  name: string;
  onMinimize: () => void;
  onClose: () => void;
  onFocus: () => void;
  onBlur: () => void;
  lockAspectRatio: boolean;
  hideScrollbars: boolean;
  tabIndex: number;
  zIndex: number;
};

export const Window: FC<Window> = ({
  children,
  name,
  onMinimize,
  onClose,
  onFocus,
  onBlur,
  lockAspectRatio,
  hideScrollbars,
  tabIndex,
  zIndex
}) => {
  const windowRef = useRef<Rnd>(null),
    focusOnDrag = ({ target }: RndDragEvent) =>
      ((target as HTMLElement)?.closest(
        `.${styles.window}`
      ) as HTMLDivElement)?.focus?.();

  useEffect(() => windowRef?.current?.resizableElement?.current?.focus(), [
    windowRef
  ]);

  return (
    <article>
      <Rnd
        enableUserSelectHack={false}
        className={styles.window}
        dragHandleClassName="handle"
        cancel=".cancel"
        default={{
          x: 0,
          y: 0,
          width: 320,
          height: 224
        }}
        tabIndex={tabIndex}
        onFocus={onFocus}
        onBlur={onBlur}
        onDragStart={focusOnDrag}
        ref={windowRef}
        lockAspectRatio={lockAspectRatio}
        style={{ zIndex }}
      >
        <header className="handle">
          <h1>{name}</h1>
          <nav className="cancel">
            <button id={styles.close} onClick={onClose}>
              <FontAwesomeIcon size="xs" icon={faTimes} />
            </button>
            <button id={styles.minimize} onClick={onMinimize}>
              <FontAwesomeIcon size="xs" icon={faMinus} />
            </button>
            <button id={styles.maximize}>
              <FontAwesomeIcon size="xs" icon={faPlus} />
            </button>
          </nav>
        </header>
        <article style={{ overflow: hideScrollbars ? 'hidden' : 'auto' }}>
          {children}
        </article>
      </Rnd>
    </article>
  );
};
