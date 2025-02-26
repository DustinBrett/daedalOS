import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import StyledPeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekWindow";
import usePeekTransition from "components/system/Taskbar/TaskbarEntry/Peek/usePeekTransition";
import useWindowPeek from "components/system/Taskbar/TaskbarEntry/Peek/useWindowPeek";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Button from "styles/common/Button";
import { FOCUSABLE_ELEMENT, HIGH_PRIORITY_ELEMENT } from "utils/constants";
import { haltEvent, label, viewWidth } from "utils/functions";

type PeekWindowProps = {
  id: string;
};

const Pause = memo(() => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 29.328V2.672h2.672v26.656H8zM21.328 2.672H24v26.656h-2.672V2.672z" />
  </svg>
));

const Play = memo(() => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 16 8 30V2z" />
  </svg>
));

const PeekWindow: FC<PeekWindowProps> = ({ id }) => {
  const {
    minimize,
    processes: { [id]: process },
  } = useProcesses();
  const { pause, paused, play, minimized = false, title = id } = process || {};
  const { setForegroundId } = useSession();
  const { onClose } = useWindowActions(id);
  const [offsetX, setOffsetX] = useState(0);
  const image = useWindowPeek(id);
  const showControls = useMemo(() => Boolean(play && pause), [pause, play]);
  const peekTransition = usePeekTransition(showControls);
  const peekRef = useRef<HTMLDivElement | null>(null);
  const onClick = useCallback((): void => {
    if (minimized) minimize(id);

    setForegroundId(id);
  }, [id, minimize, minimized, setForegroundId]);

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
      <Button className="close" onClick={onClose} {...label("Close")}>
        <CloseIcon />
      </Button>
      {showControls && (
        <div className="controls">
          {paused && (
            <Button
              onClick={(event) => {
                haltEvent(event);
                play?.();
              }}
              {...label("Play")}
              {...FOCUSABLE_ELEMENT}
            >
              <Play />
            </Button>
          )}
          {!paused && (
            <Button
              onClick={(event) => {
                haltEvent(event);
                pause?.();
              }}
              {...label("Pause")}
              {...FOCUSABLE_ELEMENT}
            >
              <Pause />
            </Button>
          )}
        </div>
      )}
    </StyledPeekWindow>
  ) : // eslint-disable-next-line unicorn/no-null
  null;
};

export default memo(PeekWindow);
