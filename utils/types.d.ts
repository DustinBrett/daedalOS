/**
 * Functional Component
 */
// eslint-disable-next-line @typescript-eslint/ban-types
type FC<TProps = {}> = (props: React.PropsWithChildren<TProps>) => JSX.Element;

type HTMLElementWithPriority<T> = T & {
  fetchPriority?: "auto" | "high" | "low";
};
