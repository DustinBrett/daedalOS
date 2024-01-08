import { useCallback } from "react";
import { useProcesses } from "contexts/process";
import { FOCUSABLE_ELEMENT } from "utils/constants";

const useCloseOnEscape = (
  id: string
): {
  onKeyDownCapture: React.KeyboardEventHandler<HTMLElement>;
  tabIndex: number;
} => {
  const { closeWithTransition } = useProcesses();

  return {
    onKeyDownCapture: useCallback<React.KeyboardEventHandler<HTMLElement>>(
      ({ key }) => key === "Escape" && closeWithTransition(id),
      [closeWithTransition, id]
    ),
    ...FOCUSABLE_ELEMENT,
  };
};

export default useCloseOnEscape;
