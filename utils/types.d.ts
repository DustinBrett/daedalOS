type FC<T = Record<string, unknown>> = (
  props: React.PropsWithChildren<T>
) => React.JSX.Element | null;

type FCWithRef<R = HTMLElement, T = Record<string, unknown>> = (
  props: React.PropsWithChildren<T> & { ref?: React.RefObject<R | null> }
) => React.JSX.Element | null;

declare module "utif" {
  export const bufferToURI: (data: Buffer) => string;
}
