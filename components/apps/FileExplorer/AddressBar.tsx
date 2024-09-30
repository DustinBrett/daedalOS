import { basename } from "path";
import { forwardRef, useEffect, useState } from "react";
import { Refresh } from "components/apps/FileExplorer/NavigationIcons";
import StyledAddressBar from "components/apps/FileExplorer/StyledAddressBar";
import useAddressBarContextMenu from "components/apps/FileExplorer/useAddressBarContextMenu";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { DISBALE_AUTO_INPUT_FEATURES, ROOT_NAME } from "utils/constants";
import { getExtension, label } from "utils/functions";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";

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

const AddressBar = forwardRef<HTMLInputElement, AddressBarProps>(
  ({ id }, ref) => {
    const addressBarRef =
      ref as React.MutableRefObject<HTMLInputElement | null>;
    const {
      open,
      url: changeUrl,
      processes: {
        [id]: { icon, url = "" },
      },
    } = useProcesses();
    const displayName = basename(url) || ROOT_NAME;
    const [addressBar, setAddressBar] = useState(displayName);
    const { exists, stat, updateFolder } = useFileSystem();

    useEffect(() => {
      if (addressBarRef.current) {
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
          onBlurCapture={() => setAddressBar(displayName)}
          onChange={({ target }) => setAddressBar(target.value)}
          onFocusCapture={() => setAddressBar(url)}
          onKeyDown={async ({ key }) => {
            if (key === "Enter" && addressBarRef.current) {
              const { value } = addressBarRef.current;
              if (value && (await exists(value))) {
                if ((await stat(value)).isDirectory()) changeUrl(id, value);
                else {
                  open(
                    getProcessByFileExtension(getExtension(value)) ||
                      "OpenWith",
                    { url: value }
                  );
                }
              }
              addressBarRef.current.blur();
            }
          }}
          value={addressBar}
          {...ADDRESS_INPUT_PROPS}
          {...useAddressBarContextMenu(url)}
        />
        <Button
          className="refresh"
          onClick={() => updateFolder(url)}
          {...label(`Refresh "${displayName}" (F5)`)}
        >
          <Refresh />
        </Button>
      </StyledAddressBar>
    );
  }
);

export default AddressBar;
