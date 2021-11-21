import {
  closeProcess,
  maximizeProcess,
  minimizeProcess,
  openProcess,
  setIcon,
  setProcessElement,
  setTitle,
  setUrl,
} from "contexts/process/functions";
import type { ProcessElements, Processes } from "contexts/process/types";
import { useCallback, useState } from "react";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";

export type ProcessContextState = {
  close: (id: string, closing?: boolean) => void;
  closeProcessesByUrl: (closeUrl: string) => void;
  closeWithTransition: (id: string) => void;
  icon: (id: string, newIcon: string) => void;
  linkElement: (
    id: string,
    name: keyof ProcessElements,
    element: HTMLElement
  ) => void;
  maximize: (id: string) => void;
  minimize: (id: string) => void;
  open: (id: string, url: string, icon?: string) => void;
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
  const icon = useCallback(
    (id: string, newIcon: string) => setProcesses(setIcon(id, newIcon)),
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
    (id: string, openUrl: string, initialIcon?: string) =>
      setProcesses(openProcess(id, openUrl, initialIcon)),
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
  const closeWithTransition = useCallback(
    (id: string): void => {
      close(id, true);
      window.setTimeout(() => close(id), TRANSITIONS_IN_MILLISECONDS.WINDOW);
    },
    [close]
  );
  const closeProcessesByUrl = useCallback(
    (closeUrl: string): void =>
      Object.entries(processes).forEach(([id, { url: processUrl }]) => {
        if (processUrl === closeUrl) closeWithTransition(id);
      }),
    [closeWithTransition, processes]
  );

  return {
    close,
    closeProcessesByUrl,
    closeWithTransition,
    icon,
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
