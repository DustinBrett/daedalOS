import { memo, useCallback, useEffect, useRef, useState } from "react";
import useCloseOnEscape from "components/system/Dialogs/useCloseOnEscape";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledOpenWith from "components/system/Dialogs/OpenWith/StyledOpenWith";
import StyledOpenWithList from "components/system/Dialogs/OpenWith/StyledOpenWithList";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import { useProcess, useProcessesActions } from "contexts/process";
import directory from "contexts/process/directory";
import { useForegroundId, useSessionActions } from "contexts/session";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { PREVENT_SCROLL, TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { getExtension, haltEvent } from "utils/functions";

const INCLUDED_PROCESSES = new Set([
  "BoxedWine",
  "JSDOS",
  "Marked",
  "MonacoEditor",
  "OpenType",
  "PDF",
  "Paint",
  "Photos",
  "Ruffle",
  "TinyMCE",
  "V86",
  "VideoPlayer",
  "Vim",
  "Webamp",
]);

type OpenWithEntryProps = {
  icon: string;
  onClick: () => void;
  selected: boolean;
  title: string;
};

const OpenWithEntry: FC<OpenWithEntryProps> = ({
  icon,
  onClick,
  selected,
  title,
}) => (
  <li className={selected ? "selected" : ""}>
    <Button aria-pressed={selected} onClick={onClick}>
      <figure>
        <Icon alt="" displaySize={24} imgSize={32} src={icon} />
        <figcaption>{title}</figcaption>
      </figure>
    </Button>
  </li>
);

const OpenWith: FC<ComponentProcessProps> = ({ id }) => {
  // Process ids can contain paths with spaces, which are invalid in id
  // attributes and split aria-labelledby's IDREF list
  const primaryLabelId = `openwith-primary-${id}`.replace(/\s/g, "_");
  const otherLabelId = `openwith-other-${id}`.replace(/\s/g, "_");
  const { closeWithTransition, open } = useProcessesActions();
  const { setForegroundId, updateRecentFiles } = useSessionActions();
  const foregroundId = useForegroundId();
  const { url } = useProcess(id);
  const urlExtension = url ? getExtension(url) : "";
  const primaryExtensionProcesses = getProcessByFileExtension(urlExtension);
  const { title: primaryTitle, icon: primaryIcon } =
    (primaryExtensionProcesses && directory[primaryExtensionProcesses]) || {};
  const [selectedPid, setSelectedPid] = useState(primaryExtensionProcesses);
  const [closeOnBlur, setCloseOnBlur] = useState(false);
  const recentlySelectedPid = useRef("");
  const runApp = useCallback(
    (pid: string): void => {
      open(pid, { url });
      closeWithTransition(id);
      if (url && pid) updateRecentFiles(url, pid);
    },
    [closeWithTransition, id, open, updateRecentFiles, url]
  );
  const updateSelectedPid = useCallback(
    (pid: string) => {
      if (recentlySelectedPid.current === pid) {
        runApp(pid);
      } else {
        recentlySelectedPid.current = pid;

        setTimeout(() => {
          recentlySelectedPid.current = "";
        }, TRANSITIONS_IN_MILLISECONDS.DOUBLE_CLICK);

        setSelectedPid(pid);
      }
    },
    [runApp]
  );
  const closeOnEscape = useCloseOnEscape(id);

  useEffect(() => {
    const isForeground = foregroundId === id;
    let cleanup: (() => void) | undefined;

    if (closeOnBlur) {
      if (!isForeground) closeWithTransition(id);
    } else {
      if (!isForeground) setForegroundId(id);

      const timeoutId = window.setTimeout(
        () => setCloseOnBlur(true),
        TRANSITIONS_IN_MILLISECONDS.WINDOW
      );

      cleanup = () => window.clearTimeout(timeoutId);
    }

    return cleanup;
  }, [closeOnBlur, closeWithTransition, foregroundId, id, setForegroundId]);

  return (
    <StyledOpenWith
      ref={(element) => {
        element?.focus(PREVENT_SCROLL);
      }}
      onContextMenu={haltEvent}
      {...closeOnEscape}
    >
      <h2>How do you want to open this file?</h2>
      <div>
        {primaryTitle && primaryIcon && (
          <>
            <h4 aria-level={3} id={primaryLabelId}>
              Keep using this app
            </h4>
            <StyledOpenWithList
              aria-labelledby={primaryLabelId}
              {...closeOnEscape}
            >
              <OpenWithEntry
                key={primaryTitle}
                icon={primaryIcon}
                onClick={() => updateSelectedPid(primaryExtensionProcesses)}
                selected={selectedPid === primaryExtensionProcesses}
                title={primaryTitle}
              />
            </StyledOpenWithList>
            <h4 aria-level={3} id={otherLabelId}>
              Other options
            </h4>
          </>
        )}
        <StyledOpenWithList
          $hideBorder={!primaryTitle || !primaryIcon}
          {...(primaryTitle &&
            primaryIcon && { "aria-labelledby": otherLabelId })}
        >
          {Object.entries(directory)
            .filter(
              ([pid]) =>
                INCLUDED_PROCESSES.has(pid) && pid !== primaryExtensionProcesses
            )
            .map(([pid, { icon, title }]) => (
              <OpenWithEntry
                key={title}
                icon={icon}
                onClick={() => updateSelectedPid(pid)}
                selected={selectedPid === pid}
                title={title}
              />
            ))}
        </StyledOpenWithList>
      </div>
      <nav role="presentation">
        <Button onClick={() => runApp(selectedPid)}>OK</Button>
      </nav>
    </StyledOpenWith>
  );
};

export default memo(OpenWith);
