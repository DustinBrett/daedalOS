import {
  config,
  libs,
  PROMPT_CHARACTER,
} from "components/apps/Terminal/config";
import type {
  FitAddon,
  LocalEcho,
  OnKeyEvent,
} from "components/apps/Terminal/types";
import useCommandInterpreter from "components/apps/Terminal/useCommandInterpreter";
import { haltEvent } from "components/system/Files/FileManager/functions";
import { useProcesses } from "contexts/process";
import packageJson from "package.json";
import { useCallback, useEffect, useState } from "react";
import { HOME } from "utils/constants";
import { loadFiles } from "utils/functions";
import useResizeObserver from "utils/useResizeObserver";
import type { IDisposable, Terminal } from "xterm";

const { alias, author, license, name, version } = packageJson;

export const displayLicense = `${license} License`;

export const displayVersion = (): string => {
  const { commit } = window;

  return `${version}${commit ? `-${commit}` : ""}`;
};

const pasteToLocalEcho = (text: string, localEcho: LocalEcho): void => {
  const { _cursor: cursor, _input: input } = localEcho;
  const newInput = `${input.slice(0, cursor)}${text}${input.slice(cursor)}`;

  localEcho.print(text);

  /* eslint-disable no-param-reassign */
  localEcho._input = newInput;
  localEcho._cursor = cursor + text.length;
  /* eslint-enable no-param-reassign */
};

const useTerminal = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const {
    processes: { [id]: { closing = false } = {} },
  } = useProcesses();
  const [terminal, setTerminal] = useState<Terminal>();
  const [fitAddon, setFitAddon] = useState<FitAddon>();
  const [localEcho, setLocalEcho] = useState<LocalEcho>();
  const [prompted, setPrompted] = useState(false);
  const processCommand = useCommandInterpreter(id, terminal, localEcho);
  const autoFit = useCallback(() => fitAddon?.fit(), [fitAddon]);

  useEffect(() => {
    if (localEcho && url) pasteToLocalEcho(url, localEcho);
  }, [localEcho, url]);

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.Terminal) setTerminal(new window.Terminal(config));
    });
  }, []);

  useEffect(() => {
    if (
      terminal &&
      loading &&
      containerRef.current &&
      window.FitAddon &&
      window.LocalEchoController
    ) {
      const newFitAddon = new window.FitAddon.FitAddon();
      const newLocalEcho = new window.LocalEchoController(undefined, {
        historySize: 1000,
      });

      terminal.loadAddon(newLocalEcho);
      terminal.loadAddon(newFitAddon);
      terminal.open(containerRef.current);

      newFitAddon.fit();

      setFitAddon(newFitAddon);
      setLocalEcho(newLocalEcho);

      containerRef.current.addEventListener("contextmenu", (event) => {
        haltEvent(event);

        const textSelection = terminal.getSelection();

        if (textSelection) {
          navigator.clipboard.writeText(textSelection);
          terminal.clearSelection();
        } else {
          navigator.clipboard
            .readText()
            .then((clipboardText) =>
              pasteToLocalEcho(clipboardText, newLocalEcho)
            );
        }
      });

      setLoading(false);
    }

    return () => {
      if (terminal && closing) terminal.dispose();
    };
  }, [closing, containerRef, loading, setLoading, terminal]);

  useEffect(() => {
    let currentOnKey: IDisposable;

    if (terminal && localEcho) {
      currentOnKey = terminal.onKey(
        ({ domEvent: { ctrlKey, code } }: OnKeyEvent) => {
          if (ctrlKey && code === "KeyV") {
            navigator.clipboard
              .readText()
              .then((clipboardText) =>
                pasteToLocalEcho(clipboardText, localEcho)
              );
          }
        }
      );
    }

    return () => currentOnKey?.dispose();
  }, [localEcho, terminal]);

  useEffect(() => {
    if (localEcho && terminal && !prompted) {
      const prompt = (cd: string): Promise<void> =>
        localEcho
          .read(`\r\n${cd}${PROMPT_CHARACTER}`)
          .then((command) => processCommand(command).then(prompt));

      localEcho.println(`${alias || name} [Version ${displayVersion()}]`);
      localEcho.println(`By ${author}. ${displayLicense}.`);

      prompt(HOME);
      setPrompted(true);
      terminal.focus();
    }
  }, [localEcho, processCommand, prompted, terminal]);

  useResizeObserver(containerRef.current, autoFit);
};

export default useTerminal;
