import type Stats from "browserfs/dist/node/core/node_fs_stats";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledProperties from "components/system/Dialogs/Properties/StyledProperties";
import StyledButton from "components/system/Dialogs/StyledButton";
import extensions from "components/system/Files/FileEntry/extensions";
import { getIconByFileExtension } from "components/system/Files/FileEntry/functions";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, dirname, extname, join } from "path";
import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "styles/common/Icon";
import { getFormattedSize } from "utils/functions";

const dateTimeString = (date?: Date): string =>
  date
    ?.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "medium",
    })
    .replace(" at ", ", ") || "";

const Properties: FC<ComponentProcessProps> = ({ id }) => {
  const {
    icon: setIcon,
    processes: { [id]: process } = {},
    closeWithTransition,
  } = useProcesses();
  const { prependFileToTitle } = useTitle(id);
  const { rename, stat, updateFolder } = useFileSystem();
  const { isShortcut, url } = process || {};
  const [stats, setStats] = useState<Stats>();
  const [{ icon }] = useFileInfo(url || "", stats?.isDirectory() || false);
  const extension = useMemo(() => extname(url || ""), [url]);
  const { process: [defaultProcess] = [], type } = extensions[extension] || {};
  const extType = type || `${extension.toUpperCase().replace(".", "")} File`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (url && !stats) {
      stat(url).then(setStats);
    }
  }, [stat, stats, url]);

  useEffect(() => {
    setIcon(id, icon);

    if (url) prependFileToTitle(basename(url), false, true);
  }, [icon, id, prependFileToTitle, setIcon, url]);

  return (
    <StyledProperties>
      <nav className="tabs">
        <StyledButton>General</StyledButton>
      </nav>
      <table>
        <tbody>
          <tr className="header">
            <th scope="row">
              <Icon imgSize={32} src={icon} />
            </th>
            <td>
              <input
                ref={inputRef}
                autoComplete="off"
                defaultValue={basename(
                  url || "",
                  isShortcut ? extname(url || "") : ""
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
              {isShortcut
                ? `Shortcut (${extension})`
                : stats?.isDirectory()
                ? "File folder"
                : extType
                ? `${extType} (${extension})`
                : "File"}
            </td>
          </tr>
          {!stats?.isDirectory() && (
            <tr>
              <th scope="row">
                {defaultProcess ? "Opens with:" : "Description:"}
              </th>
              <td>
                {defaultProcess && (
                  <Icon imgSize={16} src={getIconByFileExtension(extension)} />
                )}
                {defaultProcess || basename(url || "")}
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
            <td>{dirname(url || "")}</td>
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
      <nav className="buttons">
        <StyledButton
          onClick={() => {
            if (
              inputRef.current &&
              url &&
              inputRef.current.value !== basename(url)
            ) {
              const directory = dirname(url);

              rename(url, join(directory, inputRef.current.value));
              updateFolder(directory);
            }

            closeWithTransition(id);
          }}
        >
          OK
        </StyledButton>
        <StyledButton onClick={() => closeWithTransition(id)}>
          Cancel
        </StyledButton>
      </nav>
    </StyledProperties>
  );
};

export default Properties;
