import { useEffect, useState } from "react";
import { useProcess } from "contexts/process";
import { useForegroundId } from "contexts/session";
import {
  FAVICON_BASE_PATH,
  ONE_TIME_PASSIVE_EVENT,
  PACKAGE_DATA,
} from "utils/constants";
import {
  getDpi,
  getExtension,
  getMimeType,
  imageSrc,
  isDynamicIcon,
} from "utils/functions";

const { alias } = PACKAGE_DATA;

const createFavicon = (favIcon: string): null | React.JSX.Element => {
  // eslint-disable-next-line unicorn/no-null
  if (!favIcon) return null;

  const current = isDynamicIcon(favIcon)
    ? imageSrc(favIcon, 16, getDpi(), getExtension(favIcon)).split(" ")[0]
    : favIcon;

  return <link href={current} rel="icon" type={getMimeType(current)} />;
};

export const useFaviconAndTitle = (): {
  Favicon: null | React.JSX.Element;
  title: string;
} => {
  const [title, setTitle] = useState(alias);
  const [favIcon, setFavIcon] = useState("");
  const foregroundId = useForegroundId();
  const {
    hideTaskbarEntry,
    icon: processIcon,
    title: processTitle,
  } = useProcess(foregroundId);
  const resetFaviconAndTitle = (): void => {
    setTitle(alias);
    setFavIcon((currentFavicon) =>
      currentFavicon ? FAVICON_BASE_PATH : currentFavicon
    );
  };
  const Favicon = createFavicon(favIcon);

  useEffect(() => {
    if (!hideTaskbarEntry && (processIcon || processTitle)) {
      const documentTitle = processTitle ? `${processTitle} - ${alias}` : alias;

      // eslint-disable-next-line react/set-state-in-effect -- Mirrors the foreground window into the document head
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
