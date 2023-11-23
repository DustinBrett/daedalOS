/**
 * Functional Component
 */

type FC<TProps = Record<string, unknown>> = (
  props: React.PropsWithChildren<TProps>
) => React.JSX.Element | null;

type HTMLElementWithPriority<T> = T & {
  fetchPriority?: "auto" | "high" | "low";
};
