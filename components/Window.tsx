import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faArrowRight, faHome, faComments,
  faMinusCircle, faPlusCircle, faTimesCircle,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

import styles from '../styles/Window.module.scss';

import type { AppType } from '../resources/apps';

const DEFAULT_WINDOW_HEIGHT = 350,
      DEFAULT_WINDOW_WIDTH = 400,
      WINDOW_BAR_HEIGHT = 54; // TODO: This isn't reactive

export type WindowType = {
  app: AppType,
  children: Array<React.ReactNode> | React.ReactNode | undefined,
  title: string
};

export function Window({ app, children, title }: WindowType) {
  const [height, setHeight] = useState(DEFAULT_WINDOW_HEIGHT),
    [width, setWidth] = useState(DEFAULT_WINDOW_WIDTH),
    onResize = (resizeEvent: any, { size: { width, height } }: any) => { // TODO: Types
      setHeight(height);
      setWidth(width);
    },

    onClose = () => app.showWindow = false; // TODO: This doesn't work. Apps should be a state or context.

  useEffect(() => {
    setHeight(Math.min(DEFAULT_WINDOW_HEIGHT, window.innerHeight * 0.8));
    setWidth(Math.min(DEFAULT_WINDOW_WIDTH, window.innerWidth * 0.7));
  }, []);

  // TODO: Resize from all directions or use diff lib
  // TODO: Make action bar more generic
    // Hover animation on actions
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
              <FontAwesomeIcon className={ styles.close } icon={ faTimesCircle } onClick={ onClose } />
            </div>
          </div>
          <div className={ styles.action_bar }>
            <div className={ styles.actions }>
              <FontAwesomeIcon icon={ faArrowLeft } />
              <FontAwesomeIcon icon={ faArrowRight } />
              <FontAwesomeIcon icon={ faHome } />
              <FontAwesomeIcon icon={ faComments } /> {/* TODO: CouchSurfing comments on main page, post specific comments on post pages */}
            </div>
            <div className={ styles.search }>
              <FontAwesomeIcon icon={ faSearch } />
              <input placeholder='Search' />
              {/* TODO: x to clear search content */}
            </div>
          </div>
          <div className={ styles.content } style={{ height: `${ height - WINDOW_BAR_HEIGHT }px` }}>
            { children }
          </div>
        </div>
      </Resizable>
    </Draggable>
  );
};
