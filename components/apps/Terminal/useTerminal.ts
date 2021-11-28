import {
  BACKSPACE,
  config,
  libs,
  PROMPT_CHARACTER,
} from "components/apps/Terminal/config";
import type { OnKeyEvent } from "components/apps/Terminal/types";
import useCommandInterpreter from "components/apps/Terminal/useCommandInterpreter";
import { haltEvent } from "components/system/Files/FileManager/functions";
import { useProcesses } from "contexts/process";
import { useCallback, useEffect, useState } from "react";
import { loadFiles } from "utils/functions";
import type { Terminal } from "xterm";

const getClipboardText = (): Promise<string> => navigator.clipboard.readText();

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
  const {
    cd,
    command,
    processCommand,
    setCommand,
    setHistoryPosition,
    welcome,
  } = useCommandInterpreter(id, terminal);
  const pasteToTerminal = useCallback(
    async (data: string, currentTerminal?: Terminal): Promise<void> => {
      currentTerminal?.write(data);
      setCommand((currentCommand) => `${currentCommand}${data}`);
    },
    [setCommand]
  );
  const keyHandler = useCallback(
    async ({ domEvent: { ctrlKey, code, key } }: OnKeyEvent) => {
      if (ctrlKey) {
        if (code === "KeyC") {
          terminal?.write(`\r\n\r\n${cd}${PROMPT_CHARACTER}`);
          setCommand("");
        } else if (code === "KeyV") {
          pasteToTerminal(await getClipboardText(), terminal);
        }
      } else
        switch (code) {
          case "Enter": {
            processCommand();
            break;
          }
          case "Backspace": {
            if (command.length > 0) terminal?.write(BACKSPACE);
            setCommand((currentCommand) => currentCommand.slice(0, -1));
            break;
          }
          case "ArrowDown":
            setHistoryPosition(+1);
            break;
          case "ArrowUp":
            setHistoryPosition(-1);
            break;
          default:
            if (key.length === 1) {
              terminal?.write(key);
              setCommand((currentCommand) => `${currentCommand}${key}`);
            }
        }
    },
    [
      cd,
      command,
      pasteToTerminal,
      processCommand,
      setCommand,
      setHistoryPosition,
      terminal,
    ]
  );

  useEffect(() => {
    if (url) pasteToTerminal(url, terminal);
  }, [pasteToTerminal, terminal, url]);

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.Terminal) setTerminal(new window.Terminal(config));
    });
  }, []);

  useEffect(() => {
    if (terminal && loading && containerRef.current) {
      containerRef.current.addEventListener("contextmenu", async (event) => {
        haltEvent(event);

        const textSelection = terminal.getSelection();

        if (textSelection) {
          navigator.clipboard.writeText(textSelection);
          terminal.clearSelection();
        } else {
          pasteToTerminal(await getClipboardText(), terminal);
        }
      });
      terminal.open(containerRef.current);

      setLoading(false);

      welcome();
      terminal.write(`\r\n${cd}${PROMPT_CHARACTER}`, () => terminal.focus());
    }

    return () => {
      if (terminal && closing) terminal.dispose();
    };
  }, [
    cd,
    closing,
    containerRef,
    loading,
    pasteToTerminal,
    setLoading,
    terminal,
    welcome,
  ]);

  useEffect(() => {
    const currentOnKey = terminal?.onKey(keyHandler);

    return () => currentOnKey?.dispose();
  }, [keyHandler, terminal]);
};

export default useTerminal;
