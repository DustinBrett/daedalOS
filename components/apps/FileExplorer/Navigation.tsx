import { basename, dirname } from "path";
import { useEffect, useRef, useState } from "react";
import AddressBar from "components/apps/FileExplorer/AddressBar";
import {
  Back,
  Down,
  Forward,
  Up,
} from "components/apps/FileExplorer/NavigationIcons";
import SearchBar from "components/apps/FileExplorer/SearchBar";
import StyledNavigation from "components/apps/FileExplorer/StyledNavigation";
import useTitlebarContextMenu from "components/system/Window/Titlebar/useTitlebarContextMenu";
import { useMenu, useMenuActions } from "contexts/menu";
import {
  type CaptureTriggerEvent,
  type MenuState,
} from "contexts/menu/useMenuContextState";
import { useProcess, useProcessesActions } from "contexts/process";
import useHistory from "hooks/useHistory";
import useResizeObserver from "hooks/useResizeObserver";
import Button from "styles/common/Button";
import { ROOT_NAME } from "utils/constants";
import { haltEvent, label } from "utils/functions";

type NavigationProps = {
  addressBarRef: React.RefObject<HTMLInputElement | null>;
  hideSearch: boolean;
  id: string;
  searchBarRef: React.RefObject<HTMLInputElement | null>;
};

const CONTEXT_MENU_OFFSET = 3;

const Navigation: FC<NavigationProps> = ({
  addressBarRef,
  hideSearch,
  id,
  searchBarRef,
}) => {
  const { url: changeUrl } = useProcessesActions();
  const { url = "" } = useProcess(id);
  const upTo = url === "/" ? "" : basename(dirname(url));
  const { contextMenu, setMenu } = useMenuActions();
  const menu = useMenu();
  const { canGoBack, canGoForward, history, moveHistory, position } =
    useHistory(url, id);
  const recentItemsMenu = history
    .map((historyUrl, index) => ({
      action: () => moveHistory(index - position),
      checked: position === index,
      label: basename(historyUrl) || ROOT_NAME,
      primary: position === index,
    }))
    .reverse();
  const { onContextMenuCapture } = contextMenu(() => recentItemsMenu);
  const [isRecentMenuOpen, setIsRecentMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [removeSearch, setRemoveSearch] = useState(false);
  const resizeCallback: ResizeObserverCallback = ([{ contentRect }]) => {
    const tooSmallForSearch = contentRect.width < 260;

    if (removeSearch && !tooSmallForSearch) {
      setRemoveSearch(false);
    } else if (!removeSearch && tooSmallForSearch) {
      setRemoveSearch(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Lags a render so a click that blurs the open menu closes it instead of reopening
    setIsRecentMenuOpen(recentItemsMenu === menu.items);
  }, [menu.items, recentItemsMenu]);

  useResizeObserver(navRef, resizeCallback);

  return (
    <StyledNavigation
      ref={navRef}
      role="presentation"
      {...useTitlebarContextMenu(id)}
      onDragOver={haltEvent}
      onDrop={haltEvent}
    >
      <Button
        disabled={!canGoBack}
        onClick={() => moveHistory(-1)}
        {...label(
          canGoBack
            ? `Back to ${basename(history[position - 1]) || ROOT_NAME}`
            : "Back"
        )}
      >
        <Back />
      </Button>
      <Button
        disabled={!canGoForward}
        onClick={() => moveHistory(1)}
        {...label(
          canGoForward
            ? `Forward to ${basename(history[position + 1]) || ROOT_NAME}`
            : "Forward"
        )}
      >
        <Forward />
      </Button>
      <Button
        disabled={history.length === 1}
        onClick={(event) => {
          event.preventDefault();

          if (isRecentMenuOpen) setMenu(Object.create(null) as MenuState);
          else {
            const {
              height = 0,
              x = 0,
              y = 0,
            } = navRef.current?.getBoundingClientRect() || {};

            onContextMenuCapture(
              (x || y) && height
                ? ({
                    pageX: x,
                    pageY: y + height - CONTEXT_MENU_OFFSET,
                  } as CaptureTriggerEvent)
                : event
            );
          }
        }}
        {...label("Recent locations")}
      >
        <Down />
      </Button>
      <Button
        disabled={url === "/"}
        onClick={() => changeUrl(id, dirname(url))}
        {...label(
          url === "/"
            ? "Up one level"
            : `Up to "${upTo === "" ? ROOT_NAME : upTo}"`
        )}
      >
        <Up />
      </Button>
      <AddressBar ref={addressBarRef} id={id} />
      {!hideSearch && !removeSearch && <SearchBar ref={searchBarRef} id={id} />}
    </StyledNavigation>
  );
};

export default Navigation;
