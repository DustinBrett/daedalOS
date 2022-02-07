type SpotlightEffect = {
  onMouseLeave?: React.MouseEventHandler;
  onMouseMove?: React.MouseEventHandler;
};

export const spotlightEffect = (
  element: HTMLElement | null,
  onlyBorder = false
): SpotlightEffect =>
  element
    ? {
        onMouseLeave: () => element.removeAttribute("style"),
        onMouseMove: ({ clientX, clientY, target }) => {
          if (element.contains(target as Node)) {
            const { left, top } = element.getBoundingClientRect();
            const x = clientX - left;
            const y = clientY - top;

            Object.assign(element.style, {
              background: onlyBorder
                ? undefined
                : `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))`,
              borderImage: `radial-gradient(20% 75% at ${x}px ${y}px, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1)) 1 / 1px / 0px stretch`,
            });
          }
        },
      }
    : {};
