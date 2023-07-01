import Buttons from "components/system/Dialogs/Properties/Buttons";
import useStats from "components/system/Dialogs/Properties/useStats";
import extensions from "components/system/Files/FileEntry/extensions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import directory from "contexts/process/directory";
import { basename, dirname, extname, join } from "path";
import { useMemo, useRef } from "react";
import Icon from "styles/common/Icon";
import { SHORTCUT_ICON } from "utils/constants";
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
    ?.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "medium",
    })
    .replace(" at ", ", ") || "";

const GeneralTab: FC<TabProps> = ({ icon, id, isShortcut, pid, url }) => {
  const { closeWithTransition } = useProcesses();
  const extension = useMemo(() => getExtension(url || ""), [url]);
  const { type } = extensions[extension] || {};
  const extType = type || `${extension.toUpperCase().replace(".", "")} File`;
  const inputRef = useRef<HTMLInputElement>(null);
  const { rename, updateFolder } = useFileSystem();
  const stats = useStats(url);

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
            <th scope="row">
              {stats?.isDirectory() ? "Type:" : "Type of file:"}
            </th>
            <td>
              {stats?.isDirectory()
                ? "File folder"
                : isShortcut || extType
                ? `${isShortcut ? "Shortcut" : extType} (${extension})`
                : "File"}
            </td>
          </tr>
          {!stats?.isDirectory() && (
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
          {!stats?.isDirectory() && (
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
              {stats?.size
                ? `${getFormattedSize(
                    stats?.size
                  )} (${stats?.size.toLocaleString()} bytes)`
                : "0 bytes"}
            </td>
          </tr>
          <tr>
            <td className="spacer" colSpan={2} />
          </tr>
          <tr>
            <th scope="row">Created:</th>
            <td>{dateTimeString(stats?.birthtime)}</td>
          </tr>
          <tr>
            <th scope="row">Modified:</th>
            <td>{dateTimeString(stats?.mtime)}</td>
          </tr>
          <tr>
            <th scope="row">Accessed:</th>
            <td>{dateTimeString(stats?.atime)}</td>
          </tr>
        </tbody>
      </table>
      <Buttons
        id={id}
        onClick={() => {
          if (
            inputRef.current &&
            url &&
            inputRef.current.value !== basename(url)
          ) {
            const directoryName = dirname(url);

            rename(
              url,
              `${join(directoryName, inputRef.current.value)}${
                isShortcut ? extname(url) : ""
              }`
            );
            updateFolder(directoryName);
          }

          closeWithTransition(id);
        }}
      />
    </>
  );
};

export default GeneralTab;
