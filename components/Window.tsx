import { useState } from 'react';

import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

import styles from '../styles/Window.module.scss';

export type WindowType = {
  id: number,
  title: string
};

export function Window({ title }: WindowType) {
  const [height, setHeight] = useState(250),
    [width, setWidth] = useState(250),
    onResize = (resizeEvent: any, { size: { width, height } }: any) => { // TODO: Types
      setHeight(height);
      setWidth(width);
    };

  // TODO: Resize from all directions
  return (
    <Draggable handle='.handle'>
      <Resizable
        height={ height }
        minConstraints={[150, 150]}
        onResize={ onResize }
        width={ width }
      >
        <div className={ styles.window } style={{ height: `${ height }px`, width: `${ width }px` }}>
          <div className={ `${ styles.title_bar } handle` }>
            <span>{ title }</span>
            <span>
              <span className={ styles.minimize }></span>
              <span className={ styles.maximize }></span>
              <span className={ styles.close }></span>
            </span>
          </div>
        </div>
      </Resizable>
    </Draggable>
  );
};
