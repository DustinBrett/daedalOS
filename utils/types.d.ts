/**
 * Functional Component
 */

type FC<TProps = Record<string, unknown>> = (
  props: React.PropsWithChildren<TProps>
) => React.JSX.Element | null;

type HTMLElementWithPriority<T> = T & {
  fetchPriority?: "auto" | "high" | "low";
};

declare module "utif" {
  export const bufferToURI: (data: Buffer) => string;
}
