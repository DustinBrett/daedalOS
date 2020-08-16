import type { ResizeDirection } from "re-resizable";

import styles from '../styles/Window.module.scss';
import { useContext, useEffect, useState } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import { AgentContext } from "../resources/AgentProvider";
import posed, { PoseGroup } from 'react-pose';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faArrowRight, faHome, faComments,
  faMinusCircle, faPlusCircle, faTimesCircle,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { Agent } from "https";

// TODO: Icons are in front of window during animation
// TODO: Each window can have it's own defaults
const DEFAULT_WINDOW_DIMENSION = 350,
      MIN_WINDOW_DIMENSION = 200;

const PosedDiv = posed.div({
  hoverable: true,
  init: { scale: 1 },
  hover: { scale: 1.2 }
});

const PosedFontAwesomeIcon = ({ icon }) => (
  <PosedDiv>
    <FontAwesomeIcon icon={ icon } />
  </PosedDiv>
);

export type WindowType = {
  children: Array<React.ReactNode> | React.ReactNode | undefined,
  id: string,
  title: string
};

export function Window({ children, id, title }: WindowType) {
  const { agent } = useContext(AgentContext),
  { apps = {}, updateApp } = useContext(AppsContext),
    [height, setHeight] = useState(0),
    [width, setWidth] = useState(0),
    onResizeStop = (_e: MouseEvent | TouchEvent, _dir: ResizeDirection, elementRef: HTMLDivElement) => {
      setHeight(Number(elementRef.style.height));
      setWidth(Number(elementRef.style.width));
    },
    onMinimize = () => updateApp({ id, minimized: true }),
    onMaximize = () => updateApp({ id, maximized: !apps[id].maximized }),
    onClose = () => {
      updateApp({ id, opened: false });
      agent.play('Wave');
    };

  useEffect(() => {
    // TODO: This needs lots of work, multi window, mobile, etc.
    // Instead of math.min/max, use the min/max stuff in Rnd, pass this data in from the app data
    setHeight(500); // window.innerHeight * .6
    setWidth(734); // window.innerWidth * .5
  }, []);

  // TODO: Make action bar more generic
  // TODO: Resize hooks are maybe too big?
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
      resizeHandleStyles={{
        bottom: { cursor: 'ns-resize' },
        bottomLeft: { cursor: 'nesw-resize' },
        bottomRight: { cursor: 'nwse-resize' },
        left: { cursor: 'ew-resize' },
        right: { cursor: 'ew-resize' },
        top: { cursor: 'ns-resize' },
        topLeft: { cursor: 'nwse-resize' },
        topRight: { cursor: 'nesw-resize' }
      }}
      size={{ width, height }}
    >
      <div className={ `${ styles.title_bar } handle` }>
        <div className={ styles.title }>{ title }</div>
        <div className={ `${ styles.actions } cancel` }>
          {/* Lower opacity of icons, relative to tilebar */}
          <FontAwesomeIcon className={ styles.minimize } icon={ faMinusCircle } onClick={ onMinimize } />
          <FontAwesomeIcon className={ styles.maximize } icon={ faPlusCircle } onClick={ onMaximize } />
          <FontAwesomeIcon className={ styles.close } icon={ faTimesCircle } onClick={ onClose } />
        </div>
      </div>
      <div className={ `${ styles.action_bar } handle` }>
        <div className={ `${ styles.actions } cancel` }>
          {/* TODO: Move to BlogActions | { app.actions && <app.actions /> } */}
          {/* Animate instead of color change */}
          <PosedFontAwesomeIcon icon={ faArrowLeft } />
          <PosedFontAwesomeIcon icon={ faArrowRight } />
          <PosedFontAwesomeIcon icon={ faHome } />
          <PosedFontAwesomeIcon icon={ faComments } /> {/* TODO: CouchSurfing comments on main page, post specific comments on post pages */}
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
