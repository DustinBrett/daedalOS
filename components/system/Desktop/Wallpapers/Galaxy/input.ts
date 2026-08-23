export type GalaxyInputMessage =
  | { type: "tilt"; x: number; y: number }
  | { type: "visibility"; visible: boolean };

type GalaxyInputHandlers = {
  onTilt: (x: number, y: number) => void;
  onVisibility: (visible: boolean) => void;
};

const TILT_RANGE_DEGREES = 12;
const BASELINE_FOLLOW = 0.0025;
const POINTER_STRENGTH = 0.22;
const EMIT_INTERVAL = 33;

/**
 * Feeds parallax input to the galaxy: device orientation on mobile (deltas
 * from a slowly self-calibrating neutral pose, so any holding angle works),
 * pointer position on desktop, plus page visibility for pausing.
 */
export const listenGalaxyInput = ({
  onTilt,
  onVisibility,
}: GalaxyInputHandlers): (() => void) => {
  let baseBeta: number | undefined;
  let baseGamma: number | undefined;
  let lastEmit = 0;

  const emitTilt = (x: number, y: number): void => {
    const now = Date.now();

    if (now - lastEmit < EMIT_INTERVAL) return;

    lastEmit = now;
    onTilt(Math.min(Math.max(x, -1), 1), Math.min(Math.max(y, -1), 1));
  };
  const orientationListener = ({
    beta,
    gamma,
  }: DeviceOrientationEvent): void => {
    if (beta === null || gamma === null) return;

    baseBeta = baseBeta === undefined ? beta : baseBeta;
    baseGamma = baseGamma === undefined ? gamma : baseGamma;
    baseBeta += (beta - baseBeta) * BASELINE_FOLLOW;
    baseGamma += (gamma - baseGamma) * BASELINE_FOLLOW;

    const deltaBeta = (beta - baseBeta) / TILT_RANGE_DEGREES;
    const deltaGamma = (gamma - baseGamma) / TILT_RANGE_DEGREES;
    const angle =
      (typeof window.screen?.orientation?.angle === "number"
        ? window.screen.orientation.angle
        : 0) % 360;

    if (angle === 90) emitTilt(deltaBeta, -deltaGamma);
    else if (angle === 180) emitTilt(-deltaGamma, -deltaBeta);
    else if (angle === 270) emitTilt(-deltaBeta, deltaGamma);
    else emitTilt(deltaGamma, deltaBeta);
  };
  const pointerListener = ({
    buttons,
    clientX,
    clientY,
  }: PointerEvent): void => {
    // No parallax while dragging (buttons held): the background staying
    // still keeps window drags and menu interactions steady
    if (buttons !== 0) return;

    emitTilt(
      (clientX / window.innerWidth - 0.5) * 2 * POINTER_STRENGTH,
      (clientY / window.innerHeight - 0.5) * 2 * POINTER_STRENGTH
    );
  };
  const visibilityListener = (): void => onVisibility(!document.hidden);

  // No permission prompts, ever: orientation events are used only where
  // they fire freely (Android/desktop on secure contexts). Platforms that
  // gate them behind a prompt (iOS 13+) silently skip sensor parallax.
  window.addEventListener("deviceorientation", orientationListener, {
    passive: true,
  });
  window.addEventListener("pointermove", pointerListener, { passive: true });
  document.addEventListener("visibilitychange", visibilityListener, {
    passive: true,
  });

  return () => {
    window.removeEventListener("deviceorientation", orientationListener);
    window.removeEventListener("pointermove", pointerListener);
    document.removeEventListener("visibilitychange", visibilityListener);
  };
};
