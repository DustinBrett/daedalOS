import { useCallback, useEffect } from "react";

export type MessageEventHandler = (
  event: MessageEvent,
  sendToSender: (returnData: MessageEvent["data"]) => unknown
) => unknown;

export const postMessage = (
  data: MessageEvent["data"],
  target: MessageEvent["source"],
  origin = "*"
): void => {
  target?.postMessage(data, { targetOrigin: origin });
};

export const sendToParent = (data: MessageEvent["data"]): void => {
  const { opener } = <{ opener: MessageEvent["source"] }>globalThis;
  if (!opener) throw new Error("Parent window has closed");
  postMessage(data, opener);
};

export type UsePostMessage = {
  sendToParent: (data: MessageEvent["data"]) => void;
};

export const usePostMessage = (
  eventHandler?: MessageEventHandler
): UsePostMessage => {
  const onWatchMessageEventHandler = useCallback(
    (event: MessageEvent) => {
      // tslint:disable-next-line: @typescript-eslint/no-unsafe-assignment
      const { origin, source } = event;
      const sendToSender = (returnData: MessageEvent["data"]): void => {
        postMessage(returnData, source, origin);
      };
      if (typeof eventHandler === "function") {
        eventHandler(event, sendToSender);
      }
    },
    [eventHandler]
  );

  useEffect(() => {
    globalThis.addEventListener("message", onWatchMessageEventHandler);
    return () =>
      globalThis.removeEventListener("message", onWatchMessageEventHandler);
  }, [onWatchMessageEventHandler]);

  return { sendToParent };
};
