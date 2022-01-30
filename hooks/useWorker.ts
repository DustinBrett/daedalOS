import { useEffect, useState } from "react";

const useWorker = <T>(
  workerFunction: string | (() => void),
  name: string,
  onMessage?: (message: { data: T }) => void
): Worker | undefined => {
  const [worker, setWorker] = useState<Worker>();

  useEffect(() => {
    if (typeof workerFunction === "string") {
      setWorker(new Worker(workerFunction));
    } else if (typeof workerFunction === "function") {
      const workerUrl = URL.createObjectURL(
        new Blob(["(", workerFunction.toString(), ")()"], {
          type: "application/javascript",
        })
      );

      setWorker(new Worker(workerUrl, { name }));

      URL.revokeObjectURL?.(workerUrl);
    }
  }, [name, workerFunction]);

  useEffect(() => {
    if (onMessage) {
      worker?.addEventListener("message", onMessage, { passive: true });
    }

    worker?.postMessage("init");

    return () => {
      try {
        worker?.terminate();
      } catch (error) {
        if ((error as Error).message !== "Not Supported") throw error;
      }
    };
  }, [onMessage, worker]);

  return worker;
};

export default useWorker;
