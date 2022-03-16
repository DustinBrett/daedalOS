import { useEffect, useRef, useState } from "react";

const useWorker = <T>(
  workerInit: () => Worker,
  onMessage?: (message: { data: T }) => void
): React.MutableRefObject<Worker | undefined> => {
  const [initialized, setInitialized] = useState(false);
  const worker = useRef<Worker>();

  useEffect(() => {
    if (!worker.current) {
      worker.current = workerInit();

      if (onMessage) {
        worker.current.addEventListener("message", onMessage);
      }

      worker.current.postMessage("init");

      setInitialized(true);
    }
  }, [onMessage, workerInit]);

  useEffect(
    () => () => {
      if (initialized) {
        worker.current?.terminate();
        worker.current = undefined;
      }
    },
    [initialized]
  );

  return worker;
};

export default useWorker;
