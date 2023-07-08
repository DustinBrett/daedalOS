export const spotlightEffect = (
  element: HTMLElement | null,
  onlyBorder = false,
  border = 1
): void => {
  if (!element) return;

  element.addEventListener(
    "mouseleave",
    () => element.removeAttribute("style"),
    { passive: true }
  );

  element.addEventListener(
    "mousemove",
    ({ clientX, clientY, target }) => {
      if (element.contains(target as Node)) {
        const { left, top } = element.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;

        Object.assign(element.style, {
          background: onlyBorder
            ? undefined
            : `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))`,
          borderImage: `radial-gradient(20% 75% at ${x}px ${y}px, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1)) 1 / ${border}px / 0px stretch`,
        });
      }
    },
    { passive: true }
  );
};
