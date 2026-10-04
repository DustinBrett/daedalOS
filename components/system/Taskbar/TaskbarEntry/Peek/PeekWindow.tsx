import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import StyledPeekWindow from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekWindow";
import usePeekTransition, {
  type PeekPosition,
} from "components/system/Taskbar/TaskbarEntry/Peek/usePeekTransition";
import useWindowPeek from "components/system/Taskbar/TaskbarEntry/Peek/useWindowPeek";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { CloseIcon } from "components/system/Window/Titlebar/WindowActionIcons";
import { useProcess, useProcessesActions } from "contexts/process";
import { useSessionActions } from "contexts/session";
import Button from "styles/common/Button";
import { FOCUSABLE_ELEMENT } from "utils/constants";
import { haltEvent, label, viewWidth } from "utils/functions";

type PeekWindowProps = {
  id: string;
  onHide: () => void;
};

type ShownPeek = { element: HTMLElement; hide: () => void };

// Windows' default mouse hover time, which taskbar thumbnails wait for
const PEEK_DELAY_MS = 400;

let shownPeek: ShownPeek | undefined;

const Pause = memo(() => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 29.328V2.672h2.672v26.656H8zM21.328 2.672H24v26.656h-2.672V2.672z" />
  </svg>
));

const Play = memo(() => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M28 16 8 30V2z" />
  </svg>
));

const PeekWindow: FC<PeekWindowProps> = ({ id, onHide }) => {
  const { minimize } = useProcessesActions();
  const { minimized = false, pause, paused, play, title = id } = useProcess(id);
  const { setForegroundId } = useSessionActions();
  const { onClose } = useWindowActions(id);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();
  const [hidden, setHidden] = useState(false);
  const [position, setPosition] = useState<PeekPosition>();
  const ready = useWindowPeek(id, canvas, shownPeek ? 0 : PEEK_DELAY_MS);
  const showControls = useMemo(() => Boolean(play && pause), [pause, play]);
  const peekTransition = usePeekTransition(showControls);
  const peekRef = useRef<HTMLDivElement | null>(null);
  const replacedPeekRef = useRef<ShownPeek>(undefined);
  const onClick = useCallback((): void => {
    if (minimized) minimize(id);

    setForegroundId(id);
  }, [id, minimize, minimized, setForegroundId]);
  const hide = useCallback((): void => {
    if (shownPeek?.element === peekRef.current) shownPeek = undefined;

    setHidden(true);
  }, []);
  // The replaced peek hides on the first slide frame, so no frame is empty
  const hideReplacedPeek = useCallback((): void => {
    const replacedPeek = replacedPeekRef.current;

    if (replacedPeek) {
      replacedPeek.element.style.visibility = "hidden";
      replacedPeek.hide();
      replacedPeekRef.current = undefined;
    }
  }, []);
  const onCloseClick = useCallback(
    (event: React.MouseEvent): void => {
      haltEvent(event);
      hide();
      onClose();
    },
    [hide, onClose]
  );

  useLayoutEffect(() => {
    const peek = peekRef.current;

    if (ready && peek) {
      const { left, right, width } = peek.getBoundingClientRect();
      const vw = viewWidth();
      const x = left < 0 ? -left : right > vw ? vw - right : 0;
      const previous = shownPeek;

      shownPeek = {
        element: peek,
        hide: () => {
          hide();
          onHide();
        },
      };

      if (previous) {
        const rect = previous.element.getBoundingClientRect();

        replacedPeekRef.current = previous;
        setPosition({
          from: {
            height: rect.height,
            x: rect.left + rect.width / 2 - (left + width / 2),
          },
          x,
        });
      } else {
        setPosition({ x });
      }
    } else {
      setPosition(undefined);
    }

    return () => {
      if (shownPeek?.element === peek) shownPeek = undefined;
    };
  }, [hide, onHide, ready]);

  // eslint-disable-next-line unicorn/no-null
  if (hidden) return null;

  return (
    <StyledPeekWindow
      ref={peekRef}
      animate={ready && position ? "active" : "initial"}
      aria-label={title}
      className="peekWindow"
      custom={position}
      inert={!ready || undefined}
      onClick={onClick}
      onUpdate={hideReplacedPeek}
      role="group"
      {...peekTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <canvas ref={setCanvas} />
      <Button className="close" onClick={onCloseClick} {...label("Close")}>
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
  );
};

export default memo(PeekWindow);
