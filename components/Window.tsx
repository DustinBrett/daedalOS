import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

import styles from '../styles/Window.module.scss';

export type WindowType = {
  id: number,
  title: string
};

export function Window({ title }: WindowType) {
  const [height, setHeight] = useState(300),
    [width, setWidth] = useState(300),
    onResize = (resizeEvent: any, { size: { width, height } }: any) => { // TODO: Types
      setHeight(height);
      setWidth(width);
    };

  // TODO: Resize from all directions or use diff lib
  // TODO: Make action bar more generic
  return (
    <Draggable handle='.handle'>
      <Resizable
        height={ height }
        minConstraints={ [200, 200] }
        onResize={ onResize }
        width={ width }
      >
        <div className={ styles.window } style={{ height: `${ height }px`, width: `${ width }px` }}>
          <div className={ `${ styles.title_bar } handle` }>
            <div className={ styles.title }>{ title }</div>
            <div className={ styles.actions }>
              <FontAwesomeIcon className={ styles.minimize } icon={ faMinusCircle } />
              <FontAwesomeIcon className={ styles.maximize } icon={ faPlusCircle } />
              <FontAwesomeIcon className={ styles.close } icon={ faTimesCircle } />
            </div>
          </div>
          <div className={ styles.action_bar }>
            <div className={ styles.action }>Posts</div>
            <div className={ styles.action }>Comments</div>
            <div className={ `${ styles.action } ${ styles.search }` }><input placeholder='Search' /></div>
          </div>
        </div>
      </Resizable>
    </Draggable>
  );
};
