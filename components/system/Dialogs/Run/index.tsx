import { basename, join } from "path";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { parseCommand } from "components/apps/Terminal/functions";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledRun from "components/system/Dialogs/Run/StyledRun";
import StyledButton from "components/system/Dialogs/StyledButton";
import {
  getProcessByFileExtension,
  getShortcutInfo,
} from "components/system/Files/FileEntry/functions";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import {
  DESKTOP_PATH,
  DISBALE_AUTO_INPUT_FEATURES,
  ICON_PATH,
  PACKAGE_DATA,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import { getExtension, haltEvent } from "utils/functions";
import { getIpfsFileName, getIpfsResource } from "utils/ipfs";
import spawnSheep from "utils/spawnSheep";
import Icon from "styles/common/Icon";

const OPEN_ID = "open";

export const resourceAliasMap: Record<string, string> = {
  cmd: "Terminal",
  code: "MonacoEditor",
  dos: "JSDOS",
  explorer: "FileExplorer",
  monaco: "MonacoEditor",
  mspaint: "Paint",
  vlc: "VideoPlayer",
};

const MESSAGE = `Type the name of a program, folder, document, or Internet resource, and ${PACKAGE_DATA.alias} will open it for you.`;

const notFound = (resource: string): void =>
  // eslint-disable-next-line no-alert
  alert(
    `Cannot find '${resource}'. Make sure you typed the name correctly, and then try again.`
  );

const utilCommandMap: Record<string, () => void> = {
  esheep: spawnSheep,
  sheep: spawnSheep,
};

const Run: FC<ComponentProcessProps> = ({ id }) => {
  const {
    open,
    closeWithTransition,
    processes: { Run: runProcess } = {},
  } = useProcesses();
  const { createPath, exists, lstat, readFile, updateFolder } = useFileSystem();
  const { foregroundId, runHistory, setRunHistory, updateRecentFiles } =
    useSession();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [isEmptyInput, setIsEmptyInput] = useState(!runHistory[0]);
  const [running, setRunning] = useState(false);
  const checkIsEmpty: React.KeyboardEventHandler | React.ChangeEventHandler = ({
    target,
  }: React.KeyboardEvent | React.ChangeEvent): void =>
    setIsEmptyInput(!(target as HTMLInputElement)?.value);
  const runResource = useCallback(
    async (resource?: string) => {
      if (!resource) return;

      setRunning(true);

      const addRunHistoryEntry = (): void =>
        setRunHistory((currentRunHistory) =>
          currentRunHistory[0] === resource
            ? currentRunHistory
            : [resource, ...currentRunHistory]
        );
      const [resourcePid, ...resourceUrl] = parseCommand(resource);
      let resourcePath = resource;
      let closeOnExecute = true;
      const resourceExists = await exists(resourcePath);

      if (!resourceExists) {
        resourcePath =
          resourceUrl.length > 0 ? resourceUrl.join(" ") : resourcePid;
      }

      const isNostr = resourcePath.startsWith("nostr:");

      if (isNostr) open("Messenger", { url: resourcePath });

      const isIpfs = resourcePath.startsWith("ipfs://");

      if (resourceExists || isNostr || isIpfs || (await exists(resourcePath))) {
        if (isIpfs) {
          try {
            const ipfsData = await getIpfsResource(resourcePath);

            resourcePath = join(
              DESKTOP_PATH,
              await createPath(
                await getIpfsFileName(resourcePath, ipfsData),
                DESKTOP_PATH,
                ipfsData
              )
            );
            updateFolder(DESKTOP_PATH, basename(resourcePath));
          } catch {
            // Ignore failure to get ipfs resource
          }
        }

        if ((await lstat(resourcePath)).isDirectory()) {
          open("FileExplorer", { url: resourcePath }, "");
          addRunHistoryEntry();
        } else if (
          resourcePid &&
          resourceUrl.length > 0 &&
          resourcePath !== resource
        ) {
          const pid = Object.keys(processDirectory).find(
            (processName) =>
              processName.toLowerCase() === resourcePid.toLowerCase()
          );

          if (pid) {
            const openUrl =
              pid === "Browser" && isIpfs
                ? resourceUrl.join(" ")
                : resourcePath;

            open(pid, { url: openUrl });
            addRunHistoryEntry();
            if (openUrl) updateRecentFiles(openUrl, pid);
          } else {
            notFound(resourcePid);
            closeOnExecute = false;
          }
        } else {
          const extension = getExtension(resourcePath);

          if (extension === SHORTCUT_EXTENSION) {
            const { pid, url } = getShortcutInfo(await readFile(resourcePath));

            if (pid) {
              open(pid, { url });
              if (url) updateRecentFiles(url, pid);
            }
          } else {
            const basePid = getProcessByFileExtension(extension) || "OpenWith";
            const openUrl =
              basePid === "Browser" && isIpfs ? resource : resourcePath;

            open(basePid, { url: openUrl });
            if (openUrl && basePid) updateRecentFiles(openUrl, basePid);
          }

          addRunHistoryEntry();
        }
      } else {
        const pid = Object.keys(processDirectory).find(
          (processName) =>
            processName.toLowerCase() ===
            (
              resourceAliasMap[resourcePath.toLowerCase()] || resourcePath
            ).toLowerCase()
        );

        if (pid) {
          open(pid);
          addRunHistoryEntry();
        } else if (utilCommandMap[resource.toLowerCase()]) {
          utilCommandMap[resource.toLowerCase()]();
          addRunHistoryEntry();
        } else {
          notFound(resource);
          closeOnExecute = false;
        }
      }

      setRunning(false);

      if (closeOnExecute) closeWithTransition(id);
    },
    [
      closeWithTransition,
      createPath,
      exists,
      id,
      lstat,
      open,
      readFile,
      setRunHistory,
      updateFolder,
      updateRecentFiles,
    ]
  );

  useLayoutEffect(() => {
    if (foregroundId === id) {
      inputRef.current?.focus(PREVENT_SCROLL);
      if (inputRef.current?.value) inputRef.current?.select();
    }
  }, [foregroundId, id]);

  useLayoutEffect(() => {
    if (runProcess?.url && inputRef.current) {
      inputRef.current.value = `${inputRef.current.value.trimEnd()} ${
        runProcess.url
      }`.trim();
      setIsEmptyInput(false);
    }
  }, [runProcess?.url]);

  return (
    <StyledRun
      {...useFileDrop({ id })}
      onContextMenu={(event) => {
        if (!(event.target instanceof HTMLInputElement)) {
          haltEvent(event);
        }
      }}
    >
      <figure>
        <Icon alt="Run" imgSize={32} src={`${ICON_PATH}/run.webp`} />
        <figcaption>{MESSAGE}</figcaption>
      </figure>
      <div>
        <label htmlFor={OPEN_ID}>Open:</label>
        <div>
          <input
            ref={inputRef}
            defaultValue={runHistory[0]}
            disabled={running}
            enterKeyHint="go"
            id={OPEN_ID}
            onBlurCapture={({ relatedTarget }) => {
              if (
                !runProcess?.componentWindow ||
                runProcess.componentWindow.contains(relatedTarget)
              ) {
                inputRef.current?.focus(PREVENT_SCROLL);
              } else {
                setIsInputFocused(false);
              }
            }}
            onChange={
              checkIsEmpty as React.ChangeEventHandler<HTMLInputElement>
            }
            onFocusCapture={() => setIsInputFocused(true)}
            onKeyDownCapture={(event) => {
              const { key } = event;

              if (key === "Enter") runResource(inputRef.current?.value.trim());
              if (key === "Escape") {
                haltEvent(event);
                closeWithTransition(id);
              }
            }}
            onKeyUp={
              checkIsEmpty as React.KeyboardEventHandler<HTMLInputElement>
            }
            type="text"
            {...DISBALE_AUTO_INPUT_FEATURES}
          />
          <select
            disabled={runHistory.length === 0}
            onChange={({ target }) => {
              if (inputRef.current) {
                inputRef.current.value = target.value;
                setIsEmptyInput(false);
              }
            }}
            onClick={({ target }) => {
              if (
                target instanceof HTMLSelectElement &&
                target.selectedIndex !== -1
              ) {
                // eslint-disable-next-line no-param-reassign
                target.selectedIndex = -1;
              }
            }}
          >
            {runHistory.map((entry, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <option key={`${entry}-${index}`} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
      </div>
      <nav>
        <StyledButton
          className={isInputFocused ? "focus" : ""}
          disabled={isEmptyInput || running}
          onClick={() => runResource(inputRef.current?.value.trim())}
        >
          OK
        </StyledButton>
        <StyledButton
          disabled={running}
          onClick={() => closeWithTransition(id)}
        >
          Cancel
        </StyledButton>
      </nav>
    </StyledRun>
  );
};

export default Run;
