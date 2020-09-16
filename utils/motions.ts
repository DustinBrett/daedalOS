export const taskbarEntriesMotionSettings = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: {
    x: {
      type: 'spring'
    }
  },
  exit: { opacity: 0, width: 0, transition: { duration: 0.3 }, x: -100 }
};
