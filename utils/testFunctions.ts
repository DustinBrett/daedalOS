export const mockOnLoadEventListener = (
  type: string,
  listener: EventListenerOrEventListenerObject
): void => {
  if (type === "load" && typeof listener === "function") listener({} as Event);
};
