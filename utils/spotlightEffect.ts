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
    ({ offsetX: x, offsetY: y }) =>
      Object.assign(element.style, {
        background: onlyBorder
          ? undefined
          : `radial-gradient(circle at ${x}px ${y}px, rgba(200, 200, 200, 30%), transparent)`,
        borderImage: `radial-gradient(50% 75% at ${x}px ${y}px, rgba(200, 200, 200, 60%), transparent) 1 / ${border}px / 0 stretch`,
      }),
    { passive: true }
  );
};
