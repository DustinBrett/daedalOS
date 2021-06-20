import type { Size } from 'components/system/Window/RndWindow/useResizable';
import type { Position } from 'react-rnd';

export const DEFAULT_LOCALE = 'en';

export const DEFAULT_WINDOW_POSITION: Position = {
  x: 0,
  y: 0
};

export const DEFAULT_WINDOW_SIZE: Size = {
  height: '200px',
  width: '250px'
};

export const DOUBLE_CLICK_TIMEOUT_IN_MILLISECONDS = 500;

export const IMAGE_FILE_EXTENSIONS = [
  '.apng',
  '.avif',
  '.bmp',
  '.cur',
  '.gif',
  '.ico',
  '.jfif',
  '.jif',
  '.jpe',
  '.jpeg',
  '.jpg',
  '.pjp',
  '.pjpeg',
  '.png',
  '.tif',
  '.tiff',
  '.webp',
  '.xbm'
];

export const MILLISECONDS_IN_SECOND = 1000;

export const MOUNTABLE_EXTENSIONS = ['.iso', '.zip'];

export const PROCESS_DELIMITER = '__';

export const SHORTCUT_EXTENSION = '.url';

export const WINDOW_TRANSITION_DURATION_IN_MILLISECONDS = 250;
