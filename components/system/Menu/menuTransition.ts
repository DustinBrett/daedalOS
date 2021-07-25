import type { MotionProps } from "framer-motion";
import {
  MILLISECONDS_IN_SECOND,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";

const menuTransition: MotionProps = {
  animate: { opacity: 1 },
  initial: { opacity: 0 },
  transition: {
    duration: TRANSITIONS_IN_MILLISECONDS.WINDOW / MILLISECONDS_IN_SECOND,
  },
};

export default menuTransition;
