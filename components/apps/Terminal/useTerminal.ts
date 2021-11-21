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

const useTerminal = (
  id: string,
  _url: string,
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
  const pasteClipboard = useCallback(
    async (currentTerminal?: Terminal): Promise<void> => {
      const clipboardText = await navigator.clipboard.readText();

      currentTerminal?.write(clipboardText);
      setCommand((currentCommand) => `${currentCommand}${clipboardText}`);
    },
    [setCommand]
  );
  const keyHandler = useCallback(
    ({ domEvent: { ctrlKey, code, key } }: OnKeyEvent) => {
      if (ctrlKey) {
        if (code === "KeyC") {
          terminal?.write(`\r\n\r\n${cd}${PROMPT_CHARACTER}`);
          setCommand("");
        } else if (code === "KeyV") {
          pasteClipboard(terminal);
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
      pasteClipboard,
      processCommand,
      setCommand,
      setHistoryPosition,
      terminal,
    ]
  );

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
          pasteClipboard(terminal);
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
    pasteClipboard,
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
