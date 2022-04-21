import { useEffect, useRef } from "react";

const useWorker = <T>(
  workerInit: () => Worker,
  onMessage?: (message: MessageEvent<T>) => void
): React.MutableRefObject<Worker | undefined> => {
  const worker = useRef<Worker>();

  useEffect(() => {
    if (!worker.current) {
      worker.current = workerInit();

      if (onMessage) {
        worker.current.addEventListener("message", onMessage);
      }

      worker.current.postMessage("init");
    }

    return () => {
      worker.current?.terminate();
      worker.current = undefined;
    };
  }, [onMessage, workerInit]);

  return worker;
};

export default useWorker;
