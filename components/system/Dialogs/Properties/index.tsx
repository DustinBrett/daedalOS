import { basename, extname } from "path";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import useCloseOnEscape from "components/system/Dialogs/useCloseOnEscape";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import GeneralTab from "components/system/Dialogs/Properties/GeneralTab";
import StyledProperties from "components/system/Dialogs/Properties/StyledProperties";
import useStats from "components/system/Dialogs/Properties/useStats";
import StyledButton from "components/system/Dialogs/StyledButton";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import useTitle from "components/system/Window/useTitle";
import { useProcesses } from "contexts/process";
import { haltEvent } from "utils/functions";
import { PREVENT_SCROLL } from "utils/constants";

const DetailsTab = dynamic(
  () => import("components/system/Dialogs/Properties/DetailsTab")
);

const MEDIA_APPS = new Set([
  "PDF",
  "Photos",
  "Ruffle",
  "VideoPlayer",
  "Webamp",
]);

const EXIF_TYPES = new Set([".jpg", "jpeg", ".tif", ".tiff"]);

export type MetaData = Record<string, Record<string, string | number>>;

export type PropertiesMetaData = {
  exif?: MetaData;
  mediaType?: MetaData;
};

const Properties: FC<ComponentProcessProps> = ({ id }) => {
  const { icon: setIcon, processes: { [id]: process } = {} } = useProcesses();
  const { shortcutPath, url } = process || {};
  const generalUrl = shortcutPath || url || "";
  const stats = useStats(generalUrl);
  const [{ getIcon, icon, pid }] = useFileInfo(
    generalUrl,
    stats?.isDirectory()
  );
  const { prependFileToTitle } = useTitle(id);
  const getIconAbortController = useRef<AbortController>(undefined);
  const propertiesRef = useRef<HTMLDivElement>(null);
  const closeOnEscape = useCloseOnEscape(id);
  const [currentTab, setCurrentTab] = useState<"general" | "details">(
    "general"
  );
  const isShortcut = Boolean(process?.shortcutPath);
  const [metaData, setMetaData] = useState<PropertiesMetaData>({});
  const onGeneral = currentTab === "general";
  const onDetails = currentTab === "details";
  const extension = useMemo(() => extname(generalUrl), [generalUrl]);

  useEffect(() => {
    setIcon(id, icon);

    if (typeof getIcon === "function" && extension.toLowerCase() === ".exe") {
      getIconAbortController.current = new AbortController();
      getIcon(getIconAbortController.current.signal);
    }

    if (generalUrl) {
      prependFileToTitle(
        basename(generalUrl, shortcutPath ? extension : undefined),
        false,
        true
      );
    }
  }, [
    extension,
    generalUrl,
    getIcon,
    icon,
    id,
    prependFileToTitle,
    setIcon,
    shortcutPath,
  ]);

  useEffect(
    () => () => {
      try {
        getIconAbortController?.current?.abort?.();
      } catch {
        // Failed to abort getIcon
      }
    },
    []
  );

  useEffect(() => propertiesRef.current?.focus(PREVENT_SCROLL), []);

  return (
    <StyledProperties
      ref={propertiesRef}
      onContextMenu={(event) => {
        if (!(event.target instanceof HTMLInputElement)) {
          haltEvent(event);
        }
      }}
      {...closeOnEscape}
    >
      <nav className="tabs">
        <StyledButton
          className={onGeneral ? undefined : "inactive"}
          onClick={onGeneral ? undefined : () => setCurrentTab("general")}
        >
          General
        </StyledButton>
        {MEDIA_APPS.has(pid) && !isShortcut && (
          <StyledButton
            className={onDetails ? undefined : "inactive"}
            onClick={onDetails ? undefined : () => setCurrentTab("details")}
          >
            Details
          </StyledButton>
        )}
      </nav>
      {onGeneral && (
        <GeneralTab
          icon={icon}
          id={id}
          isShortcut={isShortcut}
          pid={pid}
          url={generalUrl}
        />
      )}
      {onDetails && (
        <DetailsTab
          hasExif={EXIF_TYPES.has(extension.toLowerCase())}
          id={id}
          metaData={metaData}
          setMetaData={setMetaData}
          url={url}
        />
      )}
    </StyledProperties>
  );
};

export default memo(Properties);
