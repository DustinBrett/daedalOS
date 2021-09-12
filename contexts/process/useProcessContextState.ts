import {
  closeProcess,
  maximizeProcess,
  minimizeProcess,
  openProcess,
  setProcessElement,
  setTitle,
  setUrl,
} from "contexts/process/functions";
import type { ProcessElements, Processes } from "contexts/process/types";
import { useCallback, useState } from "react";

export type ProcessContextState = {
  close: (id: string, closing?: boolean) => void;
  linkElement: (
    id: string,
    name: keyof ProcessElements,
    element: HTMLElement
  ) => void;
  maximize: (id: string) => void;
  minimize: (id: string) => void;
  open: (id: string, url: string) => void;
  processes: Processes;
  title: (id: string, newTitle: string) => void;
  url: (id: string, newUrl: string) => void;
};

const useProcessContextState = (): ProcessContextState => {
  const [processes, setProcesses] = useState<Processes>({});
  const close = useCallback(
    (id: string, closing?: boolean) => setProcesses(closeProcess(id, closing)),
    []
  );
  const maximize = useCallback(
    (id: string) => setProcesses(maximizeProcess(id)),
    []
  );
  const minimize = useCallback(
    (id: string) => setProcesses(minimizeProcess(id)),
    []
  );
  const open = useCallback(
    (id: string, url: string) => setProcesses(openProcess(id, url)),
    []
  );
  const linkElement = useCallback(
    (id: string, name: keyof ProcessElements, element: HTMLElement) =>
      setProcesses(setProcessElement(id, name, element)),
    []
  );
  const title = useCallback(
    (id: string, newTitle: string) => setProcesses(setTitle(id, newTitle)),
    []
  );
  const url = useCallback(
    (id: string, newUrl: string) => setProcesses(setUrl(id, newUrl)),
    []
  );

  return {
    close,
    linkElement,
    maximize,
    minimize,
    open,
    processes,
    title,
    url,
  };
};

export default useProcessContextState;
