/* eslint-disable no-param-reassign */

const CAPTURE = { capture: true, passive: true };
const PASSIVE = { capture: false, passive: true };

export const spotlightEffect = (
  element: HTMLElement | null,
  onlyBorder = false,
  border = 1,
  highlightHovered = false
): void => {
  if (!element) return;

  requestAnimationFrame(() => {
    const removeStyle = (): void => {
      if (!onlyBorder) element.style.background = "";

      element.style.borderImage = "";
    };

    if (onlyBorder) {
      const mouseMove = ({ clientX, clientY }: MouseEvent): void => {
        if (element.isConnected) {
          const { x, y } = element.getBoundingClientRect();
          const hovered =
            highlightHovered &&
            document.elementFromPoint(clientX, clientY) === element;

          element.style.borderImage = `radial-gradient(75px at ${clientX - x}px ${clientY - y}px, rgba(${hovered ? "255, 255, 255, 80%" : "200, 200, 200, 60%"}), transparent) 1 / ${border}px / 0 stretch`;
        } else {
          document.removeEventListener("mousemove", mouseMove, CAPTURE);
          document.removeEventListener("mouseleave", removeStyle, CAPTURE);
        }
      };

      document.addEventListener("mousemove", mouseMove, CAPTURE);
      document.addEventListener("mouseleave", removeStyle, CAPTURE);
    } else {
      const mouseMove = ({ offsetX: x, offsetY: y }: MouseEvent): void => {
        element.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(200, 200, 200, 30%), transparent)`;
        element.style.borderImage = `radial-gradient(75px at ${x}px ${y}px, rgba(200, 200, 200, 60%), transparent) 1 / ${border}px / 0 stretch`;
      };

      element.addEventListener("mousemove", mouseMove, PASSIVE);
      element.addEventListener("mouseleave", removeStyle, PASSIVE);
    }
  });
};
