import { useRef, useState } from "react";

export const useMenuPreload = (
  preloadCallback: () => Promise<unknown>
): {
  onMouseOverCapture?: React.MouseEventHandler<
    HTMLButtonElement | HTMLDivElement
  >;
} => {
  const [preloaded, setPreloaded] = useState(false);
  const initalizedPreload = useRef(false);
  const preloadMenu = (): void => {
    if (initalizedPreload.current) return;

    initalizedPreload.current = true;

    preloadCallback().then(() => setPreloaded(true));
  };

  return preloaded ? {} : { onMouseOverCapture: preloadMenu };
};
