import Buttons from "components/system/Dialogs/Properties/Buttons";
import useStats from "components/system/Dialogs/Properties/useStats";
import extensions from "components/system/Files/FileEntry/extensions";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import type { FileStat } from "components/system/Files/FileManager/functions";
import { removeInvalidFilenameCharacters } from "components/system/Files/FileManager/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import directory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { basename, dirname, extname, join } from "path";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import Icon from "styles/common/Icon";
import { DEFAULT_LOCALE, DESKTOP_PATH, SHORTCUT_ICON } from "utils/constants";
import { getExtension, getFormattedSize } from "utils/functions";

type TabProps = {
  icon: string;
  id: string;
  isShortcut: boolean;
  pid: string;
  url: string;
};

const dateTimeString = (date?: Date): string =>
  date
    ?.toLocaleString(DEFAULT_LOCALE, {
      dateStyle: "long",
      timeStyle: "medium",
    })
    .replace(" at ", ", ") || "";

const GeneralTab: FC<TabProps> = ({ icon, id, isShortcut, pid, url }) => {
  const { closeWithTransition } = useProcesses();
  const { setIconPositions } = useSession();
  const extension = useMemo(() => getExtension(url || ""), [url]);
  const { type } = extensions[extension] || {};
  const extType = type || `${extension.toUpperCase().replace(".", "")} File`;
  const inputRef = useRef<HTMLInputElement>(null);
  const { readdir, rename, stat, updateFolder } = useFileSystem();
  const stats = useStats(url);
  const [fileCount, setFileCount] = useState(0);
  const [folderCount, setFolderCount] = useState(0);
  const [folderSize, setFolderSize] = useState(0);
  const isDirectory = useMemo(() => stats?.isDirectory(), [stats]);
  const entrySize = folderSize || (isDirectory ? 0 : stats?.size);
  const checkedFileCounts = useRef(false);
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    if (!checkedFileCounts.current && !isShortcut && isDirectory) {
      checkedFileCounts.current = true;
      abortControllerRef.current = new AbortController();

      const countContents = async (contentUrl: string): Promise<void> => {
        if (abortControllerRef.current?.signal.aborted) return;

        const entries = await readdir(contentUrl);
        let currentFileCount = 0;
        let currentFolderCount = 0;
        let currentFolderSize = 0;

        for (const entry of entries) {
          // eslint-disable-next-line no-await-in-loop
          const entryStats = await stat(join(contentUrl, entry));

          if (entryStats.isDirectory()) {
            currentFolderCount += 1;
            // eslint-disable-next-line no-await-in-loop
            await countContents(join(contentUrl, entry));
          } else {
            currentFileCount += 1;
            currentFolderSize += entryStats.size;
          }
        }

        setFolderSize((size) => size + currentFolderSize);
        setFileCount((count) => count + currentFileCount);
        setFolderCount((count) => count + currentFolderCount);
      };

      countContents(url);
    }
  }, [isDirectory, isShortcut, readdir, stat, url]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  return (
    <>
      <table>
        <tbody>
          <tr className="header">
            <th scope="row">
              <Icon imgSize={32} src={icon} />
              {isShortcut && <Icon imgSize={48} src={SHORTCUT_ICON} />}
            </th>
            <td>
              <input
                ref={inputRef}
                autoComplete="off"
                defaultValue={basename(
                  url,
                  isShortcut ? extname(url) : undefined
                )}
                spellCheck="false"
                type="text"
              />
            </td>
          </tr>
          <tr>
            <td className="spacer" colSpan={2} />
          </tr>
          <tr>
            <th scope="row">{isDirectory ? "Type:" : "Type of file:"}</th>
            <td>
              {isDirectory
                ? "File folder"
                : isShortcut || extType
                ? `${isShortcut ? "Shortcut" : extType} (${extension})`
                : "File"}
            </td>
          </tr>
          {!isDirectory && (
            <tr>
              <th scope="row">{pid ? "Opens with:" : "Description:"}</th>
              <td>
                {pid && directory[pid]?.icon && (
                  <Icon imgSize={16} src={directory[pid].icon} />
                )}
                {pid ? directory[pid]?.title || pid : basename(url || "")}
              </td>
            </tr>
          )}
          {!isDirectory && (
            <tr>
              <td className="spacer" colSpan={2} />
            </tr>
          )}
          <tr>
            <th scope="row">Location:</th>
            <td>{dirname(url)}</td>
          </tr>
          <tr>
            <th scope="row">Size</th>
            <td>
              {entrySize
                ? `${getFormattedSize(
                    entrySize
                  )} (${entrySize.toLocaleString()} byte${
                    entrySize === 1 ? "" : "s"
                  })`
                : "0 bytes"}
            </td>
          </tr>
          {isDirectory && (
            <tr>
              <th scope="row">Contains</th>
              <td>{`${fileCount.toLocaleString()} Files, ${folderCount.toLocaleString()} Folders`}</td>
            </tr>
          )}
          <tr>
            <td className="spacer" colSpan={2} />
          </tr>
          <tr>
            <th scope="row">Created:</th>
            <td>{dateTimeString(stats?.ctime)}</td>
          </tr>
          <tr>
            <th scope="row">Modified:</th>
            <td>
              {stats &&
                dateTimeString(
                  new Date(getModifiedTime(url, stats as FileStat))
                )}
            </td>
          </tr>
          <tr>
            <th scope="row">Accessed:</th>
            <td>{dateTimeString(stats?.atime)}</td>
          </tr>
        </tbody>
      </table>
      <Buttons
        id={id}
        onClick={async () => {
          if (
            inputRef.current &&
            url &&
            inputRef.current.value !== basename(url)
          ) {
            let newName = removeInvalidFilenameCharacters(
              inputRef.current.value
            ).trim();

            if (newName?.endsWith(".")) {
              newName = newName.slice(0, -1);
            }

            if (newName) {
              const directoryName = dirname(url);
              const renamedPath = `${join(directoryName, newName)}${
                isShortcut ? extname(url) : ""
              }`;

              if (await rename(url, renamedPath)) {
                updateFolder(directoryName, renamedPath, url);
              }

              if (dirname(url) === DESKTOP_PATH) {
                setIconPositions((currentPositions) => {
                  const { [url]: iconPosition, ...newPositions } =
                    currentPositions;

                  if (iconPosition) {
                    newPositions[renamedPath] = iconPosition;
                  }

                  return newPositions;
                });
              }
            }
          }

          closeWithTransition(id);
        }}
      />
    </>
  );
};

export default memo(GeneralTab);
