import { useRef, useState } from "react";
import {
  closeProcess,
  maximizeProcess,
  minimizeProcess,
  openProcess,
  setIcon,
  setProcessArgument,
  setProcessElement,
  setTitle,
  setUrl,
} from "contexts/process/functions";
import {
  type ProcessArguments,
  type ProcessElements,
  type Processes,
} from "contexts/process/types";
import { startCloseEffect } from "utils/closeEffect";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";

type ProcessContextState = {
  processes: Processes;
};

type ProcessContextActions = {
  argument: (
    id: string,
    name: keyof ProcessArguments,
    value: ProcessArguments[keyof ProcessArguments]
  ) => void;
  close: (id: string, closing?: boolean) => void;
  closeProcessesByUrl: (closeUrl: string) => void;
  closeWithTransition: (id: string) => void;
  icon: (id: string, newIcon: string) => void;
  linkElement: (
    id: string,
    name: keyof ProcessElements,
    element: HTMLElement
  ) => void;
  maximize: (id: string, maximized?: boolean) => void;
  minimize: (id: string) => void;
  open: (
    id: string,
    processArguments?: ProcessArguments,
    icon?: string
  ) => void;
  title: (id: string, newTitle: string) => void;
  url: (id: string, newUrl: string) => void;
};

const useProcessContextState = (
  getState: () => ProcessContextState
): {
  actions: ProcessContextActions;
  state: ProcessContextState;
} => {
  const [processes, setProcesses] = useState<Processes>(
    Object.create(null) as Processes
  );
  const closingIdsRef = useRef<Set<string>>(new Set());

  const argument = (
    id: string,
    name: keyof ProcessArguments,
    value: ProcessArguments[keyof ProcessArguments]
  ): void => setProcesses(setProcessArgument(id, name, value));
  const close = (id: string, closing?: boolean): void =>
    setProcesses(closeProcess(id, closing));
  const icon = (id: string, newIcon: string): void =>
    setProcesses(setIcon(id, newIcon));
  const maximize = (id: string, maximized?: boolean): void =>
    setProcesses(maximizeProcess(id, maximized));
  const minimize = (id: string): void => setProcesses(minimizeProcess(id));
  const open = (
    id: string,
    processArguments?: ProcessArguments,
    initialIcon?: string
  ): void => {
    if (id === "ExternalURL") {
      const { url: externalUrl = "" } = processArguments || {};

      if (externalUrl.startsWith("http:") || externalUrl.startsWith("https:")) {
        window.open(
          decodeURIComponent(externalUrl),
          "_blank",
          "noopener,noreferrer"
        );
      }
    } else {
      setProcesses(openProcess(id, processArguments || {}, initialIcon));
    }
  };
  const linkElement = (
    id: string,
    name: keyof ProcessElements,
    element: HTMLElement
  ): void => setProcesses(setProcessElement(id, name, element));
  const title = (id: string, newTitle: string): void =>
    setProcesses(setTitle(id, newTitle));
  const url = (id: string, newUrl: string): void =>
    setProcesses(setUrl(id, newUrl));
  const closeWithTransition = (id: string): void => {
    // Capturing the window for a close effect is async, so rapid close
    // requests could each spawn their own effect. Ignore repeats until
    // the process is fully closed.
    if (closingIdsRef.current.has(id)) return;

    closingIdsRef.current.add(id);

    const { componentWindow, hasWindow } = getState().processes[id] || {};
    let closeInitiated = false;
    const initClose = (): void => {
      if (closeInitiated) return;

      closeInitiated = true;
      close(id, true);
      window.setTimeout(() => {
        close(id);
        closingIdsRef.current.delete(id);
      }, TRANSITIONS_IN_MILLISECONDS.WINDOW);
    };

    if (componentWindow && hasWindow !== false) {
      startCloseEffect(componentWindow, initClose).catch(initClose);
    } else {
      initClose();
    }
  };
  const closeProcessesByUrl = (closeUrl: string): void =>
    setProcesses((currentProcesses) => {
      Object.entries(currentProcesses).forEach(([id, { url: processUrl }]) => {
        if (processUrl === closeUrl) closeWithTransition(id);
      });

      return currentProcesses;
    });

  return {
    actions: {
      argument,
      close,
      closeProcessesByUrl,
      closeWithTransition,
      icon,
      linkElement,
      maximize,
      minimize,
      open,
      title,
      url,
    },
    state: { processes },
  };
};

export default useProcessContextState;
