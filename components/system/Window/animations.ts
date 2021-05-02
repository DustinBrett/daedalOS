import {
  MILLISECONDS_IN_SECOND,
  WINDOW_TRANSITION_DURATION_IN_MILLISECONDS
} from 'utils/constants';

export const windowOpenCloseTransitions = {
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0.05, scale: 0.95 },
  initial: { opacity: 0.05, scale: 0.95 },
  transition: {
    duration:
      WINDOW_TRANSITION_DURATION_IN_MILLISECONDS / MILLISECONDS_IN_SECOND
  }
};
