import { CAMERA } from "components/system/Desktop/Wallpapers/Galaxy/config";

type Mat4 = Float32Array;

// Scratch matrices reused every frame to keep the render loop allocation-free
const projectionMatrix = new Float32Array(16);
const viewMatrix = new Float32Array(16);
const viewProjectionMatrix = new Float32Array(16);

const multiply = (out: Mat4, a: Mat4, b: Mat4): void => {
  const target = out;

  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      let sum = 0;

      for (let term = 0; term < 4; term += 1) {
        sum += a[term * 4 + column] * b[row * 4 + term];
      }

      target[row * 4 + column] = sum;
    }
  }
};

const perspective = (
  out: Mat4,
  fovYRadians: number,
  aspect: number,
  near: number,
  far: number
): void => {
  const f = 1 / Math.tan(fovYRadians / 2);
  const target = out;

  target.fill(0);
  target[0] = f / aspect;
  target[5] = f;
  target[10] = (far + near) / (near - far);
  target[11] = -1;
  target[14] = (2 * far * near) / (near - far);
};

const lookAtOrigin = (
  out: Mat4,
  eyeX: number,
  eyeY: number,
  eyeZ: number
): void => {
  const zLength = Math.hypot(eyeX, eyeY, eyeZ) || 1;
  const zX = eyeX / zLength;
  const zY = eyeY / zLength;
  const zZ = eyeZ / zLength;
  // x = up (0, 0, 1) cross z
  let xX = -zY;
  let xY = zX;
  const xLength = Math.hypot(xX, xY) || 1;

  xX /= xLength;
  xY /= xLength;

  const yX = zY * 0 - zZ * xY;
  const yY = zZ * xX - zX * 0;
  const yZ = zX * xY - zY * xX;
  const target = out;

  target.fill(0);
  target[0] = xX;
  target[1] = yX;
  target[2] = zX;
  target[4] = xY;
  target[5] = yY;
  target[6] = zY;
  target[9] = yZ;
  target[10] = zZ;
  target[12] = -(xX * eyeX + xY * eyeY);
  target[13] = -(yX * eyeX + yY * eyeY + yZ * eyeZ);
  target[14] = -(zX * eyeX + zY * eyeY + zZ * eyeZ);
  target[15] = 1;
};

type CameraState = {
  azimuth: number;
  distance: number;
  elevation: number;
  panX?: number;
  panY?: number;
};

/**
 * Builds the combined view-projection matrix. Returns a matrix reused across
 * calls: consume it (upload/read) before the next call.
 */
export const buildViewProjection = (
  { azimuth, distance, elevation, panX = 0, panY = 0 }: CameraState,
  width: number,
  height: number
): Float32Array => {
  perspective(
    projectionMatrix,
    (CAMERA.fieldOfView * Math.PI) / 180,
    width / Math.max(height, 1),
    CAMERA.nearPlane,
    CAMERA.farPlane
  );
  lookAtOrigin(
    viewMatrix,
    distance * Math.cos(elevation) * Math.cos(azimuth),
    distance * Math.cos(elevation) * Math.sin(azimuth),
    distance * Math.sin(elevation)
  );
  multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  // Screen-space shifts (clip.xy += k * clip.w): a fixed upward shift so
  // the near rim of the tilted disk clears the bottom edge, plus the
  // parallax pan that glides the frame along with the tilt orbit
  const shiftY = CAMERA.screenShiftY + panY;

  for (let column = 0; column < 4; column += 1) {
    viewProjectionMatrix[column * 4] +=
      panX * viewProjectionMatrix[column * 4 + 3];
    viewProjectionMatrix[column * 4 + 1] +=
      shiftY * viewProjectionMatrix[column * 4 + 3];
  }

  return viewProjectionMatrix;
};

/** Scale factor from world-space point size to pixels at clip w = 1. */
export const pointScale = (height: number): number =>
  height / (2 * Math.tan((CAMERA.fieldOfView * Math.PI) / 360));
