/**
 * Functional Component
 */

type FC<TProps = Record<string, unknown>> = (
  props: React.PropsWithChildren<TProps>
) => JSX.Element;

type HTMLElementWithPriority<T> = T & {
  fetchPriority?: "auto" | "high" | "low";
};
