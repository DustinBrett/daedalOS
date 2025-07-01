import { basename } from "path";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoTo, Refresh } from "components/apps/FileExplorer/NavigationIcons";
import StyledAddressBar from "components/apps/FileExplorer/StyledAddressBar";
import useAddressBarContextMenu from "components/apps/FileExplorer/useAddressBarContextMenu";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  DISBALE_AUTO_INPUT_FEATURES,
  ROOT_NAME,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { getExtension, label, notFound } from "utils/functions";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import { useSession } from "contexts/session";

type AddressBarProps = {
  id: string;
};

export const ADDRESS_INPUT_PROPS = {
  "aria-label": "Address",
  enterKeyHint: "go",
  inputMode: "url",
  name: "address",
  ...DISBALE_AUTO_INPUT_FEATURES,
} as React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const AddressBar: FCWithRef<HTMLInputElement, AddressBarProps> = ({
  id,
  ref: addressBarRef,
}) => {
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const {
    open,
    url: changeUrl,
    processes: {
      [id]: { icon, url = "" },
    },
  } = useProcesses();
  const displayName = useMemo(() => basename(url) || ROOT_NAME, [url]);
  const [addressBar, setAddressBar] = useState(displayName);
  const { exists, stat, updateFolder } = useFileSystem();
  const { updateRecentFiles } = useSession();
  const inputing = useMemo(
    () =>
      addressBar !== displayName &&
      addressBar !== url &&
      addressBarRef &&
      document.activeElement === addressBarRef.current,
    [addressBar, addressBarRef, displayName, url]
  );
  const goToAddress = useCallback(async () => {
    if (addressBar && (await exists(addressBar))) {
      if ((await stat(addressBar)).isDirectory()) changeUrl(id, addressBar);
      else {
        const openPid = getProcessByFileExtension(getExtension(addressBar));

        open(openPid || "OpenWith", { url: addressBar });

        if (openPid) {
          updateRecentFiles(addressBar, openPid);
        }
      }
    } else {
      notFound(addressBar);
    }

    addressBarRef?.current?.blur();
  }, [
    addressBar,
    addressBarRef,
    changeUrl,
    exists,
    id,
    open,
    stat,
    updateRecentFiles,
  ]);

  useEffect(() => {
    if (addressBarRef?.current) {
      if (addressBar === url) {
        addressBarRef.current.select();
      } else if (addressBar === displayName) {
        window.getSelection()?.removeAllRanges();
      } else if (document.activeElement !== addressBarRef.current) {
        setAddressBar(displayName);
      }
    }
  }, [addressBar, addressBarRef, displayName, url]);

  return (
    <StyledAddressBar>
      <Icon alt={displayName} imgSize={16} src={icon} />
      <input
        ref={addressBarRef}
        className={inputing ? "inputing" : ""}
        onBlurCapture={({ relatedTarget }) => {
          if (actionButtonRef.current !== relatedTarget) {
            setAddressBar(displayName);
          }
        }}
        onChange={({ target }) => setAddressBar(target.value)}
        onFocusCapture={() => setAddressBar(url)}
        onKeyDown={({ key }) => {
          if (key === "Enter") goToAddress();
        }}
        value={addressBar}
        {...ADDRESS_INPUT_PROPS}
        {...useAddressBarContextMenu(url)}
      />
      <Button
        ref={actionButtonRef}
        className="action"
        onClick={() => {
          setAddressBar(displayName);

          if (inputing) goToAddress();
          else updateFolder(url);
        }}
        onFocusCapture={() =>
          setTimeout(
            () => setAddressBar(displayName),
            TRANSITIONS_IN_MILLISECONDS.DOUBLE_CLICK / 2
          )
        }
        {...label(
          inputing ? `Go to "${addressBar}"` : `Refresh "${displayName}" (F5)`
        )}
      >
        {inputing ? <GoTo /> : <Refresh />}
      </Button>
    </StyledAddressBar>
  );
};

export default memo(AddressBar);
