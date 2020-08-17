import type { ResizeDirection } from "re-resizable";

import styles from '../styles/Window.module.scss';
import { useContext, useEffect, useState } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import { AgentContext } from "./Agent";
import { motion, useDragControls } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faArrowRight, faHome, faComments,
  faMinusCircle, faPlusCircle, faTimesCircle,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

// TODO: Icons are in front of window during animation
// TODO: Each window can have it's own defaults
const DEFAULT_WINDOW_DIMENSION = 350,
      MIN_WINDOW_DIMENSION = 200;

const AnimatedFontAwesomeIcon = ({ icon }) => (
  <motion.div
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 1.1 }}
  >
    <FontAwesomeIcon icon={ icon } />
  </motion.div>
);

export type WindowType = {
  children: Array<React.ReactNode> | React.ReactNode | undefined,
  id: string,
  title: string
};

export function Window({ children, id, title }: WindowType) {
  const { agent } = useContext(AgentContext),
    { apps = {}, updateApp = () => {} } = useContext(AppsContext),
    [height, setHeight] = useState(0),
    [width, setWidth] = useState(0),
    dragControls = useDragControls(),
    onResizeStop = (_e: MouseEvent | TouchEvent, _dir: ResizeDirection, elementRef: HTMLDivElement) => {
      setHeight(Number(elementRef.style.height));
      setWidth(Number(elementRef.style.width));
    },
    onMinimize = () => (updateApp as Function)({ id, minimized: true }),
    onMaximize = () => (updateApp as Function)({ id, maximized: !apps[id].maximized }),
    onClose = () => (updateApp as Function)({ id, opened: false }), // agent.play('Sad')
    onSearching = () => agent.play('Searching'), // TODO: Debounce
    startDrag = (event) => {
      dragControls.start(event);
    };

  useEffect(() => {
    // TODO: This needs lots of work, multi window, mobile, etc.
    // Instead of math.min/max, use the min/max stuff in Rnd, pass this data in from the app data
    setHeight(window.innerHeight * 0.6);
    setWidth(window.innerWidth * 0.6);
  }, []);

  // TODO: Make action bar more generic
  // TODO: Fix dragging on mobile
  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      // dragPropagation={true}
      initial={{ x: 115, y: 40 }}
      dragConstraints={{
        left: 0,
        // right: 0,
        top: 0,
        // bottom: 0,
      }}
      className={ styles.window }>
      <div className={ `${ styles.title_bar } handle` } onMouseDown={startDrag}>
        <div className={ styles.title }>{ title }</div>
        <div className={ `${ styles.actions } cancel` }>
          {/* Lower opacity of icons, relative to tilebar */}
          <FontAwesomeIcon className={ styles.minimize } icon={ faMinusCircle } onClick={ onMinimize } />
          <FontAwesomeIcon className={ styles.maximize } icon={ faPlusCircle } onClick={ onMaximize } />
          <FontAwesomeIcon className={ styles.close } icon={ faTimesCircle } onClick={ onClose } />
        </div>
      </div>
      <div className={ `${ styles.action_bar } handle` } onMouseDown={startDrag}>
        <div className={ `${ styles.actions } cancel` }>
          {/* TODO: Move to BlogActions | { app.actions && <app.actions /> } */}
          <AnimatedFontAwesomeIcon icon={ faArrowLeft } />
          <AnimatedFontAwesomeIcon icon={ faArrowRight } />
          <AnimatedFontAwesomeIcon icon={ faHome } />
          <AnimatedFontAwesomeIcon icon={ faComments } />
        </div>
        <div className={ `${ styles.search } cancel` }>
          <FontAwesomeIcon icon={ faSearch } />
          <input placeholder='Search' onInput={ onSearching } /> {/* TODO: i18n */}
          {/* TODO: x to clear search content */}
        </div>
      </div>
      <div className={ styles.content }>
        { children }
      </div>
    </motion.div>
  );
};
