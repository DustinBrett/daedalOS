const PASSIVE = { passive: true };

export const spotlightEffect = (
  element: HTMLElement | null,
  onlyBorder = false,
  border = 1,
  highlightHovered = false
): void => {
  if (!element) return;

  const removeStyle = (): void => element.removeAttribute("style");

  if (onlyBorder) {
    const mouseMove = ({ clientX, clientY }: MouseEvent): void => {
      if (element.isConnected) {
        const { x, y } = element.getBoundingClientRect();
        const hovered =
          highlightHovered &&
          document.elementFromPoint(clientX, clientY) === element;

        Object.assign(element.style, {
          borderImage: `radial-gradient(150% 150% at ${clientX - x}px ${clientY - y}px, rgba(${hovered ? "255, 255, 255" : "150, 150, 150"}, 60%), transparent) 1 / ${border}px / 0 stretch`,
        });
      } else {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseleave", removeStyle);
      }
    };

    document.addEventListener("mousemove", mouseMove, PASSIVE);
    document.addEventListener("mouseleave", removeStyle, PASSIVE);
  } else {
    element.addEventListener(
      "mousemove",
      ({ offsetX: x, offsetY: y }) =>
        Object.assign(element.style, {
          background: `radial-gradient(circle at ${x}px ${y}px, rgba(200, 200, 200, 30%), transparent)`,
          borderImage: `radial-gradient(50% 75% at ${x}px ${y}px, rgba(200, 200, 200, 60%), transparent) 1 / ${border}px / 0 stretch`,
        }),
      PASSIVE
    );
    element.addEventListener("mouseleave", removeStyle, PASSIVE);
  }
};
