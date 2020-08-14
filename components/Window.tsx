import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { ResizeDirection } from "re-resizable";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faArrowRight, faHome, faComments,
  faMinusCircle, faPlusCircle, faTimesCircle,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/Window.module.scss';

import type { AppType } from '../resources/apps';

// TODO: Each window can have it's own defaults
const DEFAULT_WINDOW_DIMENSION = 350,
      MIN_WINDOW_DIMENSION = 200;

export type WindowType = {
  app: AppType,
  children: Array<React.ReactNode> | React.ReactNode | undefined,
  title: string
};

export function Window({ app, children, title }: WindowType) {
  const [height, setHeight] = useState(0),
    [width, setWidth] = useState(0),
    onResizeStop = (_e: MouseEvent | TouchEvent, _dir: ResizeDirection, elementRef: HTMLDivElement) => {
      setHeight(Number(elementRef.style.height));
      setWidth(Number(elementRef.style.width));
    },
    onClose = () => console.log('onClose');

  useEffect(() => {
    // TODO: This needs lots of work, multi window, mobile, etc.
    setHeight(window.innerHeight * .6);
    setWidth(window.innerWidth * .5);
  }, []);

  // TODO: Make action bar more generic
  return (
    <Rnd
      className={ styles.window }
      default={{
        height: DEFAULT_WINDOW_DIMENSION,
        width: DEFAULT_WINDOW_DIMENSION,
        x: 115,
        y: 40
      }}
      bounds='body'
      cancel='.cancel'
      dragHandleClassName='handle'
      enableUserSelectHack={ false }
      minHeight={ MIN_WINDOW_DIMENSION }
      minWidth={ MIN_WINDOW_DIMENSION }
      onResizeStop={ onResizeStop }
      size={{ width, height }}
    >
      <div className={ `${ styles.title_bar } handle` }>
        <div className={ styles.title }>{ title }</div>
        <div className={ `${ styles.actions } cancel` }>
          <FontAwesomeIcon className={ styles.minimize } icon={ faMinusCircle } />
          <FontAwesomeIcon className={ styles.maximize } icon={ faPlusCircle } />
          <FontAwesomeIcon className={ styles.close } icon={ faTimesCircle } onClick={ onClose } />
        </div>
      </div>
      <div className={ `${ styles.action_bar } handle` }>
        <div className={ `${ styles.actions } cancel` }>
          {/* TODO: Move to BlogActions | { app.actions && <app.actions /> } */}
          <FontAwesomeIcon icon={ faArrowLeft } />
          <FontAwesomeIcon icon={ faArrowRight } />
          <FontAwesomeIcon icon={ faHome } />
          <FontAwesomeIcon icon={ faComments } /> {/* TODO: CouchSurfing comments on main page, post specific comments on post pages */}
        </div>
        <div className={ `${ styles.search } cancel` }>
          <FontAwesomeIcon icon={ faSearch } />
          <input placeholder='Search' /> {/* TODO: i18n */}
          {/* TODO: x to clear search content */}
        </div>
      </div>
      <div className={ styles.content }>
        { children }
      </div>
    </Rnd>
  );
};
