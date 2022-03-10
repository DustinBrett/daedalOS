import { useEffect, useRef, useState } from "react";

const useWorker = <T>(
  workerInit: () => Worker,
  onMessage?: (message: { data: T }) => void
): React.MutableRefObject<Worker | null> => {
  const [initialized, setInitialized] = useState(false);
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (worker.current === null) {
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
      if (initialized) worker.current?.terminate();
    },
    [initialized]
  );

  return worker;
};

export default useWorker;
