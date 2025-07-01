import { basename, dirname } from "path";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import { UNKNOWN_ICON } from "components/system/Files/FileManager/icons";
import {
  Open,
  OpenFolder,
  RightArrow,
} from "components/system/Taskbar/Search/Icons";
import StyledDetails from "components/system/Taskbar/Search/StyledDetails";
import {
  type ResultInfo,
  fileType,
  getResultInfo,
} from "components/system/Taskbar/Search/functions";
import { useFileSystem } from "contexts/fileSystem";
import { type ProcessArguments } from "contexts/process/types";
import { useSession } from "contexts/session";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { DEFAULT_LOCALE, ROOT_NAME, SHORTCUT_EXTENSION } from "utils/constants";
import { getExtension, isYouTubeUrl } from "utils/functions";
import SubIcons from "components/system/Files/FileEntry/SubIcons";

const Details: FC<{
  openApp: (pid: string, args?: ProcessArguments) => void;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  singleLineView: boolean;
  url: string;
}> = ({ openApp, setActiveItem, singleLineView, url }) => {
  const { fs, stat } = useFileSystem();
  const [stats, setStats] = useState<Stats>();
  const [info, setInfo] = useState<ResultInfo>({
    icon: UNKNOWN_ICON,
  } as ResultInfo);
  const extension = useMemo(
    () => getExtension(info?.url || url),
    [info?.url, url]
  );
  const { updateRecentFiles } = useSession();
  const openFile = useCallback(() => {
    openApp(info?.pid, { url: info?.url });
    if (info?.url && info?.pid) updateRecentFiles(info?.url, info?.pid);
  }, [info?.pid, info?.url, openApp, updateRecentFiles]);
  const elementRef = useRef<HTMLDivElement>(null);
  const isYTUrl = useMemo(
    () => (info?.url ? isYouTubeUrl(info.url) : false),
    [info?.url]
  );
  const isNostrUrl = useMemo(
    () => (info?.url ? info.url.startsWith("nostr:") : false),
    [info?.url]
  );
  const isAppShortcut = useMemo(
    () =>
      info?.pid
        ? url === info.url && getExtension(url) === SHORTCUT_EXTENSION
        : false,
    [info?.pid, info?.url, url]
  );
  const isDirectory = useMemo(
    () => stats?.isDirectory() || (!extension && !isYTUrl && !isNostrUrl),
    [extension, isNostrUrl, isYTUrl, stats]
  );
  const baseUrl = isYTUrl || isNostrUrl ? url : info?.url;
  const currentUrlRef = useRef(url);
  const name = useMemo(
    () =>
      baseUrl === "/"
        ? ROOT_NAME
        : baseUrl
          ? basename(baseUrl, SHORTCUT_EXTENSION)
          : "",
    [baseUrl]
  );

  useEffect(() => {
    stat(url).then(
      (newStats) => currentUrlRef.current === url && setStats(newStats)
    );
    getResultInfo(fs, url).then(
      (newInfo) => newInfo && currentUrlRef.current === url && setInfo(newInfo)
    );
  }, [fs, stat, url]);

  useEffect(() => {
    elementRef.current?.scrollTo({ behavior: "smooth", top: 0 });
    currentUrlRef.current = url;
  }, [url]);

  return info?.url && stats ? (
    <StyledDetails ref={elementRef}>
      {singleLineView && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className="back" onClick={() => setActiveItem("")}>
          <RightArrow />
        </div>
      )}
      <Icon displaySize={64} imgSize={96} src={info?.icon} />
      <SubIcons
        alt={name}
        icon={info?.icon}
        imgSize={64}
        showShortcutIcon={false}
        subIcons={info?.subIcons}
        view="icon"
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <h1 onClick={openFile}>{name}</h1>
      <h2>{fileType(stats, extension, isYTUrl, isAppShortcut, isNostrUrl)}</h2>
      {!isAppShortcut && info?.url && (
        <table>
          <tbody>
            <tr>
              <th>Location</th>
              <td onClick={openFile}>{info.url}</td>
            </tr>
            {!isYTUrl && !isNostrUrl && !isDirectory && (
              <tr>
                <th>Last modified</th>
                <td>
                  {new Date(getModifiedTime(info.url, stats)).toLocaleString(
                    DEFAULT_LOCALE
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <ol>
        <li>
          <Button onClick={openFile}>
            <Open />
            Open
          </Button>
        </li>
        {dirname(baseUrl) !== "." && (
          <li>
            <Button
              onClick={() =>
                openApp("FileExplorer", {
                  url: dirname(baseUrl),
                })
              }
            >
              <OpenFolder />
              Open {isDirectory ? "folder" : "file"} location
            </Button>
          </li>
        )}
      </ol>
    </StyledDetails>
  ) : (
    <> </>
  );
};

export default memo(Details);
