import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import desktopIcons from "public/.index/desktopIcons.json";
import {
  FAVICON_BASE_PATH,
  HIGH_PRIORITY_ELEMENT,
  ONE_TIME_PASSIVE_EVENT,
  PACKAGE_DATA,
} from "utils/constants";
import {
  getDpi,
  getExtension,
  imageSrc,
  imageSrcs,
  imageToBufferUrl,
  isDynamicIcon,
} from "utils/functions";

const { alias, author, description } = PACKAGE_DATA;

const Metadata: FC = () => {
  const [title, setTitle] = useState(alias);
  const [favIcon, setFavIcon] = useState("");
  const { readFile } = useFileSystem();
  const [customCursor, setCustomCursor] = useState("");
  const { cursor, foregroundId } = useSession();
  const { processes: { [foregroundId]: process } = {} } = useProcesses();
  const {
    icon: processIcon,
    hideTaskbarEntry,
    title: processTitle,
  } = process || {};
  const resetFaviconAndTitle = useCallback((): void => {
    setTitle(alias);
    setFavIcon((currentFavicon) =>
      currentFavicon ? FAVICON_BASE_PATH : currentFavicon
    );
  }, []);
  const currentFavIcon = useMemo(
    () =>
      isDynamicIcon(favIcon)
        ? imageSrc(favIcon, 16, getDpi(), ".webp").split(" ")[0]
        : favIcon,
    [favIcon]
  );
  const getCursor = useCallback(
    async (path: string) => {
      const { getFirstAniImage, getLargestIcon } = await import(
        "utils/imageDecoder"
      );
      const imageBuffer = await readFile(path);
      const extension = getExtension(path);
      let image: Buffer | undefined = imageBuffer;

      if (extension === ".ani") {
        image = await getFirstAniImage(imageBuffer);
      } else {
        const largestIcon = await getLargestIcon(imageBuffer, 128);

        if (largestIcon) return largestIcon;
      }

      return image ? imageToBufferUrl(extension, image) : "";
    },
    [readFile]
  );

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
        content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, interactive-widget=resizes-content"
        name="viewport"
      />
      <meta content={description} name="description" />
      <meta content={alias} property="og:title" />
      <meta content="website" property="og:type" />
      <meta content={author.url} property="og:url" />
      <meta content={`${author.url}/screenshot.png`} property="og:image" />
      <meta content={description} property="og:description" />
      <link
        href={`${author.url}/rss.xml`}
        rel="alternate"
        title={`RSS Feed for ${alias}`}
        type="application/rss+xml"
      />
      {desktopIcons.map((icon) => {
        const isSubIcon = icon.includes("/16x16/");
        const dynamicIcon = !isSubIcon && isDynamicIcon(icon);

        return (
          <link
            key={icon}
            as="image"
            href={dynamicIcon || isSubIcon ? undefined : icon}
            imageSrcSet={
              dynamicIcon
                ? imageSrcs(icon, 48, ".webp")
                : isSubIcon
                  ? imageSrcs(icon.replace("16x16/", ""), 16, ".webp")
                  : undefined
            }
            rel="preload"
            {...HIGH_PRIORITY_ELEMENT}
          />
        );
      })}
      {customCursor && (
        <style>{`*, *::before, *::after { cursor: url(${customCursor}), default !important; }`}</style>
      )}
    </Head>
  );
};

export default memo(Metadata);
