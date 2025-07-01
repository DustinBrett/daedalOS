import { useRef, useEffect, memo } from "react";
import { useProcesses } from "contexts/process";

type PageProps = {
  canvas: HTMLCanvasElement;
  id: string;
  page: number;
};

const Page: FC<PageProps> = ({ canvas, id, page }) => {
  const containerRef = useRef<HTMLLIElement | null>(null);
  const {
    argument,
    processes: { [id]: process },
  } = useProcesses();
  const { componentWindow } = process || {};

  useEffect(() => {
    if (canvas) containerRef.current?.append(canvas);

    return () => canvas?.remove();
  }, [canvas]);

  useEffect(() => {
    const container = containerRef.current;
    // eslint-disable-next-line no-undef-init, unicorn/no-useless-undefined
    let observer: IntersectionObserver | undefined = undefined;

    if (
      container instanceof HTMLElement &&
      componentWindow instanceof HTMLElement
    ) {
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach(
            ({ isIntersecting }) => isIntersecting && argument(id, "page", page)
          ),
        { root: componentWindow, threshold: 0.5 }
      );

      observer.observe(container);
    }

    return () => observer?.disconnect();
  }, [argument, componentWindow, id, page]);

  return <li ref={containerRef} />;
};

export default memo(Page);
