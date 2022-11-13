import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Head from "next/head";
import desktopIcons from "public/.index/desktopIcons.json";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FAVICON_BASE_PATH,
  HIGH_PRIORITY_ELEMENT,
  ICON_CACHE_EXTENSION,
  ICON_PATH,
  PACKAGE_DATA,
  USER_ICON_PATH,
} from "utils/constants";
import { getDpi, imageSrc, imageSrcs } from "utils/functions";

const { alias, description } = PACKAGE_DATA;

const PreloadDesktopIcons: FC = () => (
  <>
    {desktopIcons.map((icon) => {
      const isCacheIcon = icon.endsWith(ICON_CACHE_EXTENSION);
      const isStaticIcon =
        isCacheIcon ||
        ((!icon.startsWith(ICON_PATH) || icon.includes("/16x16/")) &&
          !icon.startsWith(USER_ICON_PATH));

      return (
        <link
          key={icon}
          as="image"
          href={isStaticIcon ? icon : undefined}
          imageSrcSet={isStaticIcon ? undefined : imageSrcs(icon, 48, ".webp")}
          rel="preload"
          type={isCacheIcon ? undefined : "image/webp"}
          {...HIGH_PRIORITY_ELEMENT}
        />
      );
    })}
  </>
);

const visibilityEventName =
  typeof document !== "undefined" && "webkitHidden" in document
    ? "webkitvisibilitychange"
    : "visibilitychange";

const Metadata: FC = () => {
  const [title, setTitle] = useState(alias);
  const [favIcon, setFavIcon] = useState("");
  const { foregroundId } = useSession();
  const { processes: { [foregroundId]: process } = {} } = useProcesses();
  const resetFaviconAndTitle = useCallback((): void => {
    setTitle(alias);
    setFavIcon((currentFavicon) =>
      currentFavicon ? FAVICON_BASE_PATH : currentFavicon
    );
  }, []);
  const currentFavIcon = useMemo(
    () =>
      !favIcon ||
      favIcon === FAVICON_BASE_PATH ||
      favIcon.startsWith("https://")
        ? favIcon
        : imageSrc(favIcon, 16, getDpi(), ".webp").split(" ")[0],
    [favIcon]
  );

  useEffect(() => {
    if (process) {
      const documentTitle = `${process.title} - ${alias}`;

      if (title !== documentTitle) setTitle(documentTitle);
      if (favIcon !== process.icon || !favIcon) {
        setFavIcon(process.icon || FAVICON_BASE_PATH);
      }
    } else {
      resetFaviconAndTitle();
    }
  }, [favIcon, process, resetFaviconAndTitle, title]);

  useEffect(() => {
    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") resetFaviconAndTitle();
    };

    document.addEventListener(visibilityEventName, onVisibilityChange, {
      passive: true,
    });

    return () =>
      document.removeEventListener(visibilityEventName, onVisibilityChange);
  }, [resetFaviconAndTitle]);

  return (
    <Head>
      <title>{title}</title>
      {currentFavIcon && (
        <link href={currentFavIcon} rel="icon" type="image/webp" />
      )}
      <meta
        content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
        name="viewport"
      />
      <meta content={description} name="description" />
      <PreloadDesktopIcons />
    </Head>
  );
};

export default Metadata;
