import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FAVICON_BASE_PATH,
  ONE_TIME_PASSIVE_EVENT,
  PACKAGE_DATA,
} from "utils/constants";
import { useProcess } from "contexts/process";
import { useForegroundId } from "contexts/session";
import {
  isDynamicIcon,
  imageSrc,
  getDpi,
  getExtension,
  getMimeType,
} from "utils/functions";

const { alias } = PACKAGE_DATA;

export const useFaviconAndTitle = (): {
  Favicon: React.JSX.Element | null;
  title: string;
} => {
  const [title, setTitle] = useState(alias);
  const [favIcon, setFavIcon] = useState("");
  const foregroundId = useForegroundId();
  const {
    icon: processIcon,
    hideTaskbarEntry,
    title: processTitle,
  } = useProcess(foregroundId);
  const resetFaviconAndTitle = useCallback((): void => {
    setTitle(alias);
    setFavIcon((currentFavicon) =>
      currentFavicon ? FAVICON_BASE_PATH : currentFavicon
    );
  }, []);
  const Favicon = useMemo(() => {
    // eslint-disable-next-line unicorn/no-null
    if (!favIcon) return null;

    const current = isDynamicIcon(favIcon)
      ? imageSrc(favIcon, 16, getDpi(), getExtension(favIcon)).split(" ")[0]
      : favIcon;

    return <link href={current} rel="icon" type={getMimeType(current)} />;
  }, [favIcon]);

  useEffect(() => {
    if (!hideTaskbarEntry && (processIcon || processTitle)) {
      const documentTitle = processTitle ? `${processTitle} - ${alias}` : alias;

      if (title !== documentTitle) setTitle(documentTitle);
      if (favIcon !== processIcon || !favIcon) {
        setFavIcon(encodeURI(processIcon) || FAVICON_BASE_PATH);
      }
    } else {
      resetFaviconAndTitle();
    }
  }, [
    favIcon,
    hideTaskbarEntry,
    processIcon,
    processTitle,
    resetFaviconAndTitle,
    title,
  ]);

  useEffect(() => {
    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") resetFaviconAndTitle();
    };
    const onBeforeUnload = (): void => {
      const faviconLinkElement = document.querySelector("link[rel=icon]");

      if (faviconLinkElement instanceof HTMLLinkElement) {
        try {
          faviconLinkElement.href = FAVICON_BASE_PATH;
        } catch {
          // Ignore failure to set link href
        }
      }
    };

    window.addEventListener(
      "beforeunload",
      onBeforeUnload,
      ONE_TIME_PASSIVE_EVENT
    );
    document.addEventListener("visibilitychange", onVisibilityChange, {
      passive: true,
    });

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [resetFaviconAndTitle]);

  return { Favicon, title };
};
