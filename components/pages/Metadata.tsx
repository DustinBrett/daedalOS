import { getFirstAniImage } from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Head from "next/head";
import { extname } from "path";
import desktopIcons from "public/.index/desktopIcons.json";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FAVICON_BASE_PATH,
  HIGH_PRIORITY_ELEMENT,
  ICON_CACHE_EXTENSION,
  ICON_PATH,
  ONE_TIME_PASSIVE_EVENT,
  PACKAGE_DATA,
  USER_ICON_PATH,
} from "utils/constants";
import { getDpi, imageSrc, imageSrcs, imageToBufferUrl } from "utils/functions";

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
          {...HIGH_PRIORITY_ELEMENT}
        />
      );
    })}
  </>
);

const MemoizedPreloadDesktopIcons = memo(PreloadDesktopIcons);

const Metadata: FC = () => {
  const [title, setTitle] = useState(alias);
  const [favIcon, setFavIcon] = useState("");
  const { readFile } = useFileSystem();
  const [customCursor, setCustomCursor] = useState("");
  const { cursor, foregroundId } = useSession();
  const { processes: { [foregroundId]: process } = {} } = useProcesses();
  const { icon: processIcon, title: processTitle } = process || {};
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
  const getCursor = useCallback(
    async (path: string) => {
      const imageBuffer = await readFile(path);
      const image =
        extname(path) === ".ani"
          ? await getFirstAniImage(imageBuffer)
          : imageBuffer;

      return image ? imageToBufferUrl(path, image) : "";
    },
    [readFile]
  );

  useEffect(() => {
    if (processIcon || processTitle) {
      const documentTitle = processTitle ? `${processTitle} - ${alias}` : alias;

      if (title !== documentTitle) setTitle(documentTitle);
      if (favIcon !== processIcon || !favIcon) {
        setFavIcon(encodeURI(processIcon) || FAVICON_BASE_PATH);
      }
    } else {
      resetFaviconAndTitle();
    }
  }, [favIcon, processIcon, processTitle, resetFaviconAndTitle, title]);

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

  useEffect(() => {
    if (cursor) getCursor(cursor).then(setCustomCursor);
  }, [cursor, getCursor]);

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
      <MemoizedPreloadDesktopIcons />
      {customCursor && (
        <style>{`*, *::before, *::after { cursor: url(${customCursor}), default !important; }`}</style>
      )}
    </Head>
  );
};

export default memo(Metadata);
