import Draggable from 'react-draggable';

import styles from '../styles/Window.module.scss';

export type WindowType = {
  id: number,
  title: string
};

// TODO: Resizeable

export function Window({ title }: WindowType) {
  return (
    <Draggable>
      <div className={ styles.window }>
        <div className={ styles.title_bar }>
          <span>{ title }</span>
          <span>
            <span className={ styles.minimize }></span>
            <span className={ styles.maximize }></span>
            <span className={ styles.close }></span>
          </span>
        </div>
      </div>
    </Draggable>
  );
};
