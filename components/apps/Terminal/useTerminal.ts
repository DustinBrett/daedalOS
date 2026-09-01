import { extname } from "path";
import { type IDisposable, type Terminal } from "xterm";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PROMPT_CHARACTER, config } from "components/apps/Terminal/config";
import {
  autoComplete,
  readClipboardToTerminal,
} from "components/apps/Terminal/functions";
import {
  type FitAddon,
  type LocalEcho,
  type OnKeyEvent,
} from "components/apps/Terminal/types";
import useCommandInterpreter from "components/apps/Terminal/useCommandInterpreter";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import extensions from "components/system/Files/FileEntry/extensions";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess, useProcessesActions } from "contexts/process";
import { useForegroundId } from "contexts/session";
import useResizeObserver from "hooks/useResizeObserver";
import { HOME, PACKAGE_DATA, PREVENT_SCROLL } from "utils/constants";
import {
  displayVersion,
  getExtension,
  haltEvent,
  loadFiles,
} from "utils/functions";

const { alias, author, license } = PACKAGE_DATA;

export const displayLicense = `${license} License`;

const useTerminal = ({
  containerRef,
  id,
  loading,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { url: setUrl } = useProcessesActions();
  const { closing = false, libs = [] } = useProcess(id);
  const { readdir } = useFileSystemActions();
  const [terminal, setTerminal] = useState<Terminal>();
  const [fitAddon, setFitAddon] = useState<FitAddon>();
  const [localEcho, setLocalEcho] = useState<LocalEcho>();
  const cd = useRef((!localEcho && url && !extname(url) ? url : "") || HOME);
  const [initialCommand, setInitialCommand] = useState("");
  const [prompted, setPrompted] = useState(false);
  const processCommand = useCommandInterpreter(id, cd, terminal, localEcho);
  const autoFit = useCallback(() => fitAddon?.fit(), [fitAddon]);
  const foregroundId = useForegroundId();

  useEffect(() => {
    if (url) {
      if (localEcho) {
        localEcho.handleCursorInsert(url.includes(" ") ? `"${url}"` : url);
      } else {
        const fileExtension = getExtension(url);
        const { command: extCommand = "" } = extensions[fileExtension] || {};

        if (extCommand) {
          setInitialCommand(
            `${extCommand} ${url.includes(" ") ? `"${url}"` : url}`
          );
        }
      }

      setUrl(id, "");
    }
  }, [id, localEcho, setUrl, url]);

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.Terminal) {
        const highContrast =
          window.matchMedia("(forced-colors: active)").matches ||
          window.matchMedia("(prefers-contrast: more)").matches;

        setTerminal(
          new window.Terminal({
            ...config,
            ...(highContrast && {
              minimumContrastRatio: 4.5,
              screenReaderMode: true,
            }),
          })
        );
      }
    });
  }, [libs]);

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

      const onContextMenu = (event: MouseEvent): void => {
        haltEvent(event);

        const textSelection = terminal.getSelection();

        if (textSelection) {
          try {
            navigator.clipboard?.writeText(textSelection);
            terminal.clearSelection();
          } catch {
            // Ignore failure to write to clipboard
          }
        } else {
          readClipboardToTerminal(newLocalEcho, terminal);
        }
      };
      const onFocus = (): void => terminal?.textarea?.focus(PREVENT_SCROLL);
      const containerElement = containerRef.current;
      const sectionElement = containerElement.closest("section");

      containerElement.addEventListener("contextmenu", onContextMenu);
      sectionElement?.addEventListener("focus", onFocus, { passive: true });

      setLoading(false);

      return () => {
        if (terminal && closing) {
          terminal.dispose();
          containerElement.removeEventListener("contextmenu", onContextMenu);
          sectionElement?.removeEventListener("focus", onFocus);
        }
      };
    }

    return () => {
      if (terminal && closing) terminal.dispose();
    };
  }, [closing, containerRef, loading, setLoading, terminal]);

  useEffect(() => {
    let currentOnKey: IDisposable;

    if (terminal && localEcho) {
      terminal.textarea?.setAttribute("enterkeyhint", "send");
      currentOnKey = terminal.onKey(
        ({ domEvent: { ctrlKey, code } }: OnKeyEvent) => {
          if (ctrlKey && code === "KeyV") {
            readClipboardToTerminal(localEcho, terminal);
          }
        }
      );
    }

    return () => currentOnKey?.dispose();
  }, [localEcho, terminal]);

  useEffect(() => {
    if (localEcho && terminal && !prompted) {
      const prompt = (): Promise<void> =>
        localEcho
          .read(`\r\n${cd.current}${PROMPT_CHARACTER}`)
          .then((command) => processCommand.current?.(command).then(prompt));

      localEcho.println(`${alias} [Version ${displayVersion()}]`);
      localEcho.println(`By ${author.name}. ${displayLicense}.`);

      if (initialCommand) {
        localEcho.println(
          `\r\n${cd.current}${PROMPT_CHARACTER}${initialCommand}\r\n`
        );
        localEcho.history.entries = [initialCommand];
        processCommand.current(initialCommand).then(prompt);
      } else {
        prompt();
      }

      setPrompted(true);
      terminal.focus();
      autoFit();

      autoComplete([], localEcho);
      readdir(cd.current).then((files) => {
        autoComplete(files, localEcho);
        containerRef.current
          ?.querySelector(".terminal")
          ?.setAttribute("data-autocomplete-files", "true");
      });
    }
  }, [
    autoFit,
    containerRef,
    initialCommand,
    localEcho,
    processCommand,
    prompted,
    readdir,
    terminal,
  ]);

  useLayoutEffect(() => {
    if (id === foregroundId && !loading) {
      terminal?.textarea?.focus(PREVENT_SCROLL);
    }
  }, [foregroundId, id, loading, terminal]);

  useResizeObserver(containerRef.current, autoFit);
};

export default useTerminal;
