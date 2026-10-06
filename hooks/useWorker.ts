import { useEffect, useRef } from "react";

// The default keeps the generic parseable as TSX, so Next compiles this file
const useWorker = <T = unknown>(
  workerInit?: () => Worker,
  onMessage?: (message: MessageEvent<T>) => void
): React.RefObject<undefined | Worker> => {
  const worker = useRef<Worker>(undefined);

  useEffect(() => {
    if (workerInit && !worker.current) {
      worker.current = workerInit();

      if (onMessage) {
        worker.current.addEventListener("message", onMessage, {
          passive: true,
        });
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
