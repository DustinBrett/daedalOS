import StyledPeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekWindow";
import usePeekTransition from "components/system/Taskbar/TaskbarEntry/Peek/usePeekTransition";
import useWindowPeek from "components/system/Taskbar/TaskbarEntry/Peek/useWindowPeek";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { memo, useLayoutEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import { FOCUSABLE_ELEMENT, HIGH_PRIORITY_ELEMENT } from "utils/constants";
import { label, viewWidth } from "utils/functions";

type PeekWindowProps = {
  id: string;
};

const PeekWindow: FC<PeekWindowProps> = ({ id }) => {
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

  useLayoutEffect(() => {
    if (image) {
      const { left = 0, right = 0 } =
        peekRef.current?.getBoundingClientRect() || {};
      const vw = viewWidth();

      if (left < 0) {
        setOffsetX(Math.abs(left));
      } else if (right > vw) {
        setOffsetX(vw - right);
      }
    }
  }, [image]);

  return image ? (
    <StyledPeekWindow
      ref={peekRef}
      $offsetX={offsetX}
      className="peekWindow"
      onClick={onClick}
      {...peekTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <img
        alt={title}
        decoding="async"
        loading="eager"
        src={image}
        {...HIGH_PRIORITY_ELEMENT}
      />
      <Button onClick={onClose} {...label("Close")}>
        <CloseIcon />
      </Button>
    </StyledPeekWindow>
  ) : // eslint-disable-next-line unicorn/no-null
  null;
};

export default memo(PeekWindow);
