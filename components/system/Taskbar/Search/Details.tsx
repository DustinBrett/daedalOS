import type Stats from "browserfs/dist/node/core/node_fs_stats";
import extensions from "components/system/Files/FileEntry/extensions";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import { UNKNOWN_ICON } from "components/system/Files/FileManager/icons";
import {
  Open,
  OpenFolder,
  RightArrow,
} from "components/system/Taskbar/Search/Icons";
import StyledDetails from "components/system/Taskbar/Search/StyledDetails";
import type { ResultInfo } from "components/system/Taskbar/Search/functions";
import { getResultInfo } from "components/system/Taskbar/Search/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { basename, dirname, extname } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { DEFAULT_LOCALE, FOLDER_ICON } from "utils/constants";

const Details: FC<{
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  singleLineView: boolean;
  url: string;
}> = ({ setActiveItem, singleLineView, url }) => {
  const fs = useFileSystem();
  const { stat } = fs;
  const [stats, setStats] = useState<Stats>();
  const [info, setInfo] = useState<ResultInfo>({
    icon: UNKNOWN_ICON,
  } as ResultInfo);
  const { open } = useProcesses();
  const extension = extname(url);
  const { updateRecentFiles } = useSession();
  const openFile = useCallback(() => {
    open(info?.pid, { url: info?.url });
    if (info?.url && info?.pid) updateRecentFiles(info?.url, info?.pid);
  }, [info?.pid, info?.url, open, updateRecentFiles]);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stat(url).then(setStats);
    getResultInfo(fs, url).then(setInfo);
  }, [fs, stat, url]);

  useEffect(() => {
    elementRef.current?.scrollTo({ behavior: "smooth", top: 0 });
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [url]);

  return info?.url && stats ? (
    <StyledDetails ref={elementRef}>
      {singleLineView && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className="back" onClick={() => setActiveItem("")}>
          <RightArrow />
        </div>
      )}
      <Icon
        displaySize={64}
        imgSize={96}
        src={stats?.isDirectory() ? FOLDER_ICON : info?.icon}
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <h1 onClick={openFile}>{basename(info?.url)}</h1>
      <h2>
        {stats?.isDirectory()
          ? "File folder"
          : extensions[extension]?.type ||
            `${extension.toUpperCase().replace(".", "")} File`}
      </h2>
      <table>
        <tbody>
          <tr>
            <th>Location</th>
            <td onClick={openFile}>{info?.url}</td>
          </tr>
          <tr>
            <th>Last modified</th>
            <td>
              {new Date(getModifiedTime(url, stats)).toLocaleString(
                DEFAULT_LOCALE
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <ol>
        <li>
          <Button onClick={openFile}>
            <Open />
            Open
          </Button>
        </li>
        {dirname(info?.url) !== "." && (
          <li>
            <Button
              onClick={() => open("FileExplorer", { url: dirname(info?.url) })}
            >
              <OpenFolder />
              Open file location
            </Button>
          </li>
        )}
      </ol>
    </StyledDetails>
  ) : (
    <> </>
  );
};

export default Details;
