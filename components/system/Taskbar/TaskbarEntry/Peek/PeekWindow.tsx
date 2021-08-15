import StyledPeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekWindow";
import usePeekTransition from "components/system/Taskbar/TaskbarEntry/Peek/usePeekTransition";
import useWindowPeek from "components/system/Taskbar/TaskbarEntry/Peek/useWindowPeek";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import { FOCUSABLE_ELEMENT } from "utils/constants";

type PeekWindowProps = {
  id: string;
};

const PeekWindow = ({ id }: PeekWindowProps): JSX.Element => {
  const {
    minimize,
    processes: { [id]: { minimized = false, title = id } = {} },
  } = useProcesses();
  const { setForegroundId } = useSession();
  const { onClose } = useWindowActions(id);
  const [offsetX, setOffsetX] = useState(0);
  const image = useWindowPeek(id);
  const peekTransition = usePeekTransition();
  const peekRef = useRef<HTMLDivElement | null>(null);
  const onClick = (): void => {
    if (minimized) minimize(id);

    setForegroundId(id);
  };

  useEffect(() => {
    if (image) {
      const { left = 0, right = 0 } =
        peekRef.current?.getBoundingClientRect() || {};

      if (left < 0) {
        setOffsetX(Math.abs(left));
      } else if (right > window.innerWidth) {
        setOffsetX(window.innerWidth - right);
      }
    }
  }, [image]);

  return image ? (
    <StyledPeekWindow
      onClick={onClick}
      ref={peekRef}
      style={offsetX ? { transform: `translateX(${offsetX}px)` } : undefined}
      {...peekTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <img alt={title} src={image} />
      <Button onClick={onClose} title="Close">
        <CloseIcon />
      </Button>
    </StyledPeekWindow>
  ) : (
    <></>
  );
};

export default PeekWindow;
