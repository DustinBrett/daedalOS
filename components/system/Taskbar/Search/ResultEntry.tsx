import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { useIsVisible } from "components/apps/Messenger/hooks";
import { getModifiedTime } from "components/system/Files/FileEntry/functions";
import { UNKNOWN_ICON } from "components/system/Files/FileManager/icons";
import type { ResultInfo } from "components/system/Taskbar/Search/functions";
import {
  fileType,
  getResultInfo,
} from "components/system/Taskbar/Search/functions";
import { RightArrow } from "components/system/Taskbar/Search/Icons";
import { useFileSystem } from "contexts/fileSystem";
import type { ProcessArguments } from "contexts/process/types";
import { useSession } from "contexts/session";
import { basename, extname } from "path";
import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "styles/common/Icon";
import { DEFAULT_LOCALE } from "utils/constants";
import { isYouTubeUrl } from "utils/functions";

type ResultEntryProps = {
  active?: boolean;
  details?: boolean;
  openApp: (pid: string, args?: ProcessArguments) => void;
  searchTerm: string;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  url: string;
};

const ResultEntry: FC<ResultEntryProps> = ({
  active,
  details,
  openApp,
  searchTerm,
  setActiveItem,
  url,
}) => {
  const fs = useFileSystem();
  const { updateRecentFiles } = useSession();
  const { stat } = fs;
  const [stats, setStats] = useState<Stats>();
  const [info, setInfo] = useState<ResultInfo>({
    icon: UNKNOWN_ICON,
  } as ResultInfo);
  const extension = extname(info?.url || url);
  const name = useMemo(() => {
    let text = basename(url, ".url");

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
  const isYTUrl = info?.url ? isYouTubeUrl(info.url) : false;
  const baseUrl = isYTUrl ? url : url || info?.url;
  const lastModified = useMemo(
    () =>
      stats
        ? `Last modified: ${new Date(
            getModifiedTime(baseUrl, stats)
          ).toLocaleString(DEFAULT_LOCALE, {
            dateStyle: "short",
            timeStyle: "short",
          })}`
        : "",
    [baseUrl, stats]
  );
  const [hovered, setHovered] = useState(false);
  const elementRef = useRef<HTMLLIElement | null>(null);
  const isVisible = useIsVisible(elementRef, ".list");
  const isAppShortcut = info?.pid
    ? url === info.url && extname(url) === ".url"
    : false;
  const isDirectory = stats?.isDirectory() || (!extension && !isYTUrl);
  const isNostrUrl = info?.url ? info.url.startsWith("nostr:") : false;

  useEffect(() => {
    const activeEntry = details || hovered;

    if (activeEntry || isVisible) {
      if (activeEntry) stat(url).then(setStats);

      getResultInfo(fs, url).then(setInfo);
    }
  }, [details, fs, hovered, isVisible, stat, url]);

  // TODO: Search for directories also?

  return (
    <li
      ref={elementRef}
      className={active ? "active-item" : undefined}
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      onMouseOver={() => !details && setHovered(true)}
      title={lastModified ? `${baseUrl}\n\n${lastModified}` : baseUrl}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <figure
        className={details ? undefined : "simple"}
        onClick={() => {
          openApp(info?.pid, isAppShortcut ? undefined : { url: baseUrl });
          if (baseUrl && info?.pid) updateRecentFiles(baseUrl, info?.pid);
        }}
      >
        <Icon
          displaySize={details ? 32 : 16}
          imgSize={details ? 32 : 16}
          src={info?.icon}
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
                {fileType(stats, extension, isYTUrl, isAppShortcut, isNostrUrl)}
              </h2>
              {!isYTUrl && !isAppShortcut && !isDirectory && (
                <h2>{lastModified}</h2>
              )}
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
