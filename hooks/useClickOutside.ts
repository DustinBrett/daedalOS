import { useRef, useEffect } from "react";

const defaultEvents = ["mousedown", "touchstart"];

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClickOutside: (event: Event) => void,
  excludeRefs: React.RefObject<HTMLElement | null>[] = [],
  events: string[] = defaultEvents
) {
  const savedCallback = useRef(onClickOutside);

  useEffect(() => {
    savedCallback.current = onClickOutside;
  }, [onClickOutside]);

  useEffect(() => {
    const handler = (event: Event) => {
      for (const excludeRef of excludeRefs) {
        const { current: excludeEl } = excludeRef;
        if (excludeEl && excludeEl.contains(event.target as Node)) return;
      }

      const { current: el } = ref;
      if (!el || el.contains(event.target as Node)) return;

      savedCallback.current(event);
    };

    for (const eventName of events) {
      document.addEventListener(eventName, handler);
    }

    return () => {
      for (const eventName of events) {
        document.removeEventListener(eventName, handler);
      }
    };
  }, [events, ref, excludeRefs]);
}
