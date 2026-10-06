import { useProcessesActions } from "contexts/process";
import { FOCUSABLE_ELEMENT } from "utils/constants";

const useCloseOnEscape = (
  id: string
): {
  onKeyDownCapture: React.KeyboardEventHandler<HTMLElement>;
  tabIndex: number;
} => {
  const { closeWithTransition } = useProcessesActions();

  return {
    onKeyDownCapture: ({ key }) => key === "Escape" && closeWithTransition(id),
    ...FOCUSABLE_ELEMENT,
  };
};

export default useCloseOnEscape;
