import type Stats from "browserfs/dist/node/core/node_fs_stats";
import extensions from "components/system/Files/FileEntry/extensions";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import { UNKNOWN_ICON } from "components/system/Files/FileManager/icons";
import type { ResultInfo } from "components/system/Taskbar/Search/functions";
import { getResultInfo } from "components/system/Taskbar/Search/functions";
import { RightArrow } from "components/system/Taskbar/Search/Icons";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { basename, extname } from "path";
import { useEffect, useMemo, useState } from "react";
import Icon from "styles/common/Icon";
import { DEFAULT_LOCALE, FOLDER_ICON } from "utils/constants";

type ResultEntryProps = {
  active?: boolean;
  details?: boolean;
  searchTerm: string;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  url: string;
};

const ResultEntry: FC<ResultEntryProps> = ({
  active,
  details,
  searchTerm,
  setActiveItem,
  url,
}) => {
  const fs = useFileSystem();
  const { open } = useProcesses();
  const { updateRecentFiles } = useSession();
  const { stat } = fs;
  const [stats, setStats] = useState<Stats>();
  const [info, setInfo] = useState<ResultInfo>({
    icon: UNKNOWN_ICON,
  } as ResultInfo);
  const extension = extname(url);
  const name = useMemo(() => {
    let text = basename(url);

    try {
      text = text.replace(
        new RegExp(`(${searchTerm})`, "i"),
        "<span>$1</span>"
      );
    } catch {
      // Ignore failure to wrap search text
    }

    return text;
  }, [searchTerm, url]);
  const lastModified = useMemo(
    () =>
      stats
        ? `Last modified: ${new Date(
            getModifiedTime(url, stats)
          ).toLocaleString(DEFAULT_LOCALE, {
            dateStyle: "short",
            timeStyle: "short",
          })}`
        : "",
    [url, stats]
  );
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (details || hovered) stat(url).then(setStats);

    getResultInfo(fs, url).then(setInfo);
  }, [details, fs, hovered, stat, url]);

  // TODO: Search for directories also?

  return (
    <li
      className={active ? "active-item" : undefined}
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      onMouseOver={() => !details && setHovered(true)}
      title={lastModified ? `${url}\n\n${lastModified}` : url}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <figure
        className={details ? undefined : "simple"}
        onClick={() => {
          open(info?.pid, { url });
          if (url && info?.pid) updateRecentFiles(url, info?.pid);
        }}
      >
        <Icon
          displaySize={details ? 32 : 16}
          imgSize={details ? 32 : 16}
          src={stats?.isDirectory() ? FOLDER_ICON : info?.icon}
        />
        <figcaption>
          <h1
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: name,
            }}
          />
          {details && stats && (
            <>
              <h2>
                {stats.isDirectory()
                  ? "File folder"
                  : extensions[extension]?.type ||
                    `${extension.toUpperCase().replace(".", "")} File`}
              </h2>
              <h2>{lastModified}</h2>
            </>
          )}
        </figcaption>
      </figure>
      {!active && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className="select" onClick={() => setActiveItem(url)}>
          <RightArrow />
        </div>
      )}
    </li>
  );
};

export default ResultEntry;
