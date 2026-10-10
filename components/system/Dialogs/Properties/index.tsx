import { basename, extname } from "path";
import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import GeneralTab from "components/system/Dialogs/Properties/GeneralTab";
import StyledProperties from "components/system/Dialogs/Properties/StyledProperties";
import useStats from "components/system/Dialogs/Properties/useStats";
import StyledButton from "components/system/Dialogs/StyledButton";
import useCloseOnEscape from "components/system/Dialogs/useCloseOnEscape";
import useFileInfo from "components/system/Files/FileEntry/useFileInfo";
import useTitle from "components/system/Window/useTitle";
import { useProcess, useProcessesActions } from "contexts/process";
import { PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";

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

const EXIF_TYPES = new Set([".jpeg", ".jpg", ".tif", ".tiff"]);

export type MetaData = Record<string, Record<string, number | string>>;

export type PropertiesMetaData = {
  exif?: MetaData;
  mediaType?: MetaData;
};

const Properties: FC<ComponentProcessProps> = ({ id }) => {
  const { icon: setIcon } = useProcessesActions();
  const process = useProcess(id);
  const { shortcutPath, url } = process;
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
  const [currentTab, setCurrentTab] = useState<"details" | "general">(
    "general"
  );
  const isShortcut = Boolean(process?.shortcutPath);
  const [metaData, setMetaData] = useState<PropertiesMetaData>({});
  const onGeneral = currentTab === "general";
  const onDetails = currentTab === "details";
  const hasDetails = MEDIA_APPS.has(pid) && !isShortcut;
  const tabsId = useId();
  const tabPanel = {
    "aria-labelledby": `${tabsId}${currentTab}`,
    id: `${tabsId}panel`,
    role: "tabpanel",
  };
  // Like a property sheet, arrow keys switch tabs, stopping at the ends
  const onTabKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const right = event.key === "ArrowRight";
      const tab = (
        right
          ? event.currentTarget.nextElementSibling
          : event.currentTarget.previousElementSibling
      ) as HTMLElement | null;

      if (tab) {
        haltEvent(event);
        setCurrentTab(right ? "details" : "general");
        tab.focus(PREVENT_SCROLL);
      }
    }
  };
  const extension = extname(generalUrl);

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

  useEffect(() => () => getIconAbortController.current?.abort(), []);

  // Like Windows, the dialog opens on its selected tab
  useEffect(
    () =>
      propertiesRef.current
        ?.querySelector<HTMLElement>("[role=tab][aria-selected=true]")
        ?.focus(PREVENT_SCROLL),
    []
  );

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
      <div className="tabs" role="tablist">
        <StyledButton
          aria-controls={onGeneral ? tabPanel.id : undefined}
          aria-selected={onGeneral}
          className={onGeneral ? undefined : "inactive"}
          id={`${tabsId}general`}
          onClick={onGeneral ? undefined : () => setCurrentTab("general")}
          onKeyDown={onTabKeyDown}
          role="tab"
        >
          General
        </StyledButton>
        {hasDetails && (
          <StyledButton
            aria-controls={onDetails ? tabPanel.id : undefined}
            aria-selected={onDetails}
            className={onDetails ? undefined : "inactive"}
            id={`${tabsId}details`}
            onClick={onDetails ? undefined : () => setCurrentTab("details")}
            onKeyDown={onTabKeyDown}
            role="tab"
          >
            Details
          </StyledButton>
        )}
      </div>
      {onGeneral && (
        <GeneralTab
          icon={icon}
          id={id}
          isShortcut={isShortcut}
          pid={pid}
          tabPanel={tabPanel}
          url={generalUrl}
        />
      )}
      {onDetails && (
        <DetailsTab
          hasExif={EXIF_TYPES.has(extension.toLowerCase())}
          id={id}
          metaData={metaData}
          setMetaData={setMetaData}
          tabPanel={tabPanel}
          url={url}
        />
      )}
    </StyledProperties>
  );
};

export default Properties;
