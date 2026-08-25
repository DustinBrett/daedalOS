export type GalaxyInputMessage =
  | { type: "tilt"; x: number; y: number }
  | { type: "visibility"; visible: boolean };

type GalaxyInputHandlers = {
  onTilt: (x: number, y: number) => void;
  onVisibility: (visible: boolean) => void;
};

const TILT_RANGE_DEGREES = 18;
const POINTER_STRENGTH = 0.22;
const EMIT_INTERVAL = 16;
// Angle jump (degrees) no hand could produce between two sensor events:
// the deviceorientation gimbal ambiguity near vertical poses flips the
// reported angles discontinuously, and must not slew the view
const JUMP_DEGREES = 25;
// Neutral-pose recentering rates (fraction per second). The baseline glides
// to the current pose while the device rests, so any holding angle becomes
// center - but it must NOT chase a deliberate gesture: a chasing baseline
// eats part of the tilt and pays it back as drift after the hand stops,
// which reads as the image moving on its own, disconnected from the motion
const REST_FOLLOW_RATE = 0.3;
const MOTION_FOLLOW_RATE = 0.02;
// Angular speed (deg/s) at which a pose change counts as deliberate motion
const MOTION_THRESHOLD = 6;

/**
 * Feeds parallax input to the galaxy: device orientation on mobile (deltas
 * from a neutral pose that recenters while the device rests, so any holding
 * angle becomes home without fighting deliberate motion), pointer position
 * on desktop, plus page visibility for pausing.
 */
export const listenGalaxyInput = ({
  onTilt,
  onVisibility,
}: GalaxyInputHandlers): (() => void) => {
  let baseBeta: number | undefined;
  let baseGamma: number | undefined;
  let lastBeta = 0;
  let lastGamma = 0;
  let lastEventTime = 0;
  let motionRate = 0;
  let lastEmit = 0;

  const emitTilt = (x: number, y: number): void => {
    const now = Date.now();

    if (now - lastEmit < EMIT_INTERVAL) return;

    lastEmit = now;
    // Soft saturation instead of a hard clamp: linear for small tilts,
    // easing off toward the extremes so big gestures never slam a rail
    onTilt(Math.tanh(x), Math.tanh(y));
  };
  const orientationListener = ({
    beta,
    gamma,
    timeStamp,
  }: DeviceOrientationEvent): void => {
    if (beta === null || gamma === null) return;

    if (baseBeta === undefined || baseGamma === undefined) {
      baseBeta = beta;
      baseGamma = gamma;
    } else if (
      Math.abs(beta - lastBeta) > JUMP_DEGREES ||
      Math.abs(gamma - lastGamma) > JUMP_DEGREES
    ) {
      // Carry the baseline across the discontinuity so the emitted tilt
      // stays continuous instead of snapping to an odd angle
      baseBeta += beta - lastBeta;
      baseGamma += gamma - lastGamma;
    } else {
      const dt = Math.min(
        Math.max((timeStamp - lastEventTime) / 1000, 0.001),
        0.1
      );
      const rate =
        (Math.abs(beta - lastBeta) + Math.abs(gamma - lastGamma)) / dt;

      // Smoothed angular speed decides how much the pose is resting
      motionRate += (rate - motionRate) * Math.min(dt * 8, 1);

      const moving = Math.min(motionRate / MOTION_THRESHOLD, 1);
      const follow = Math.min(
        dt *
          (REST_FOLLOW_RATE + (MOTION_FOLLOW_RATE - REST_FOLLOW_RATE) * moving),
        1
      );

      baseBeta += (beta - baseBeta) * follow;
      baseGamma += (gamma - baseGamma) * follow;
    }

    lastBeta = beta;
    lastGamma = gamma;
    lastEventTime = timeStamp;

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
