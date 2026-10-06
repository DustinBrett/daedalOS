import { extname } from "path";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type IDisposable, type Terminal } from "xterm";
import { config, PROMPT_CHARACTER } from "components/apps/Terminal/config";
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

const setHistory = (localEcho: LocalEcho, entries: string[]): void => {
  const { history } = localEcho;

  history.entries = entries;
};

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
  const initialCommand = useRef("");
  const prompted = useRef(false);
  const processCommand = useCommandInterpreter(id, cd, terminal, localEcho);
  const autoFit = (): void => fitAddon?.fit();
  const foregroundId = useForegroundId();

  useEffect(() => {
    if (url) {
      if (localEcho) {
        localEcho.handleCursorInsert(url.includes(" ") ? `"${url}"` : url);
      } else {
        const fileExtension = getExtension(url);
        const { command: extCommand = "" } = extensions[fileExtension] || {};

        if (extCommand) {
          initialCommand.current = `${extCommand} ${url.includes(" ") ? `"${url}"` : url}`;
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
            if (navigator.clipboard) {
              navigator.clipboard.writeText(textSelection);
            }

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
        ({ domEvent: { code, ctrlKey } }: OnKeyEvent) => {
          if (ctrlKey && code === "KeyV") {
            readClipboardToTerminal(localEcho, terminal);
          }
        }
      );
    }

    return () => currentOnKey?.dispose();
  }, [localEcho, terminal]);

  useEffect(() => {
    if (localEcho && terminal && !prompted.current) {
      const prompt = (): Promise<void> =>
        localEcho
          .read(`\r\n${cd.current}${PROMPT_CHARACTER}`)
          .then((command) => processCommand.current?.(command).then(prompt));

      localEcho.println(`${alias} [Version ${displayVersion()}]`);
      localEcho.println(`By ${author.name}. ${displayLicense}.`);

      if (initialCommand.current) {
        localEcho.println(
          `\r\n${cd.current}${PROMPT_CHARACTER}${initialCommand.current}\r\n`
        );
        setHistory(localEcho, [initialCommand.current]);
        processCommand.current(initialCommand.current).then(prompt);
      } else {
        prompt();
      }

      prompted.current = true;
      terminal.focus();
      autoFit();

      autoComplete([], localEcho);
      readdir(cd.current).then((files) => {
        autoComplete(files, localEcho);
        containerRef.current
          ?.querySelector(".terminal")
          // eslint-disable-next-line unicorn/prefer-dom-node-dataset
          ?.setAttribute("data-autocomplete-files", "true");
      });
    }
  }, [autoFit, containerRef, localEcho, processCommand, readdir, terminal]);

  useLayoutEffect(() => {
    if (id === foregroundId && !loading) {
      terminal?.textarea?.focus(PREVENT_SCROLL);
    }
  }, [foregroundId, id, loading, terminal]);

  useResizeObserver(containerRef, autoFit);
};

export default useTerminal;
