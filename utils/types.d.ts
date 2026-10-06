/* eslint-disable @typescript-eslint/consistent-type-imports */

type FC<T = Record<string, unknown>> = (
  props: React.PropsWithChildren<T>
) => null | React.JSX.Element;

type FCWithRef<R = HTMLElement, T = Record<string, unknown>> = (
  props: React.PropsWithChildren<T> & { ref?: React.RefObject<null | R> }
) => null | React.JSX.Element;

declare module "utif" {
  export const bufferToURI: (data: Buffer) => string;
}

declare module "Burn-My-Windows/resources/shaders/*.frag" {
  const content: string;
  export default content;
}

declare module "Burn-My-Windows/resources/shaders/*.glsl" {
  const content: string;
  export default content;
}

declare module "Burn-My-Windows/schemas/*.xml" {
  const content: string;
  export default content;
}

declare module "stockfish/bin/*.js" {
  const content: string;
  export default content;
}

declare module "stockfish/bin/*.wasm" {
  const content: string;
  export default content;
}

declare module "@chrisoakman/chessboard2/dist/chessboard2.min.mjs" {
  export const Chessboard2: (
    target: HTMLElement,
    config?: import("components/apps/Chess/types").Chessboard2Config
  ) => import("components/apps/Chess/types").Chessboard2Instance;
}

declare module "ani-cursor/dist/parser" {
  export function parseAni(buffer: Buffer | Uint8Array): {
    images: Uint8Array[];
    metadata: { iDispRate?: number };
  };
}

declare module "next/dist/compiled/babel/core" {
  export * from "@babel/core";
}
