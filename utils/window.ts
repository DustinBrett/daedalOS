import type { HandleClasses } from 'react-rnd';

export const resizeHandleClasses = (styles: {
  [className: string]: string;
}): HandleClasses => ({
  top: styles.resizeTop,
  right: styles.resizeRight,
  bottom: styles.resizeBottom,
  left: styles.resizeLeft,
  topRight: styles.resizeTopRight,
  bottomRight: styles.resizeBottomRight,
  bottomLeft: styles.resizeBottomLeft,
  topLeft: styles.resizeTopLeft
});
