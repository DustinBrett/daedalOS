import type { MotionProps } from "framer-motion";
import { TRANSITIONS_IN_SECONDS } from "utils/constants";

const menuTransition: MotionProps = {
  animate: { opacity: 1 },
  initial: { opacity: 0 },
  transition: {
    duration: TRANSITIONS_IN_SECONDS.WINDOW,
  },
};

export default menuTransition;
