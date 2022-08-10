import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Head from "next/head";
import desktopIcons from "public/.index/desktopIcons.json";
import { useEffect, useState } from "react";
import {
  FAVICON_BASE_PATH,
  HIGH_PRIORITY_ELEMENT,
  ICON_PATH,
  PACKAGE_DATA,
  USER_ICON_PATH,
} from "utils/constants";
import { getDpi, imageSrc, imageSrcs } from "utils/functions";

const { alias, description } = PACKAGE_DATA;

const Metadata: FC = () => {
  const [title, setTitle] = useState(alias);
  const [favIcon, setFavIcon] = useState("");
  const { foregroundId } = useSession();
  const { processes: { [foregroundId]: process } = {} } = useProcesses();
  const resetFaviconAndTitle = (): void => {
    setTitle(alias);
    setFavIcon((currentFavicon) =>
      currentFavicon ? FAVICON_BASE_PATH : currentFavicon
    );
  };

  useEffect(() => {
    if (process) {
      const documentTitle = `${process.title} - ${alias}`;

      if (title !== documentTitle) {
        setTitle(documentTitle);
        setFavIcon(process.icon || FAVICON_BASE_PATH);
      }
    } else {
      resetFaviconAndTitle();
    }
  }, [process, title]);

  useEffect(() => {
    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        resetFaviconAndTitle();
      }
    };
    const visibilityEventName =
      "webkitHidden" in document
        ? "webkitvisibilitychange"
        : "visibilitychange";

    document.addEventListener(visibilityEventName, onVisibilityChange, {
      passive: true,
    });

    return document.removeEventListener(
      visibilityEventName,
      onVisibilityChange
    );
  }, []);

  return (
    <Head>
      <title>{title}</title>
      {favIcon && (
        <link
          href={
            favIcon === FAVICON_BASE_PATH
              ? FAVICON_BASE_PATH
              : imageSrc(favIcon, 16, getDpi(), ".webp").split(" ")[0]
          }
          rel="icon"
          type="image/webp"
        />
      )}
      <meta
        content="width=device-width, initial-scale=1, minimum-scale=1"
        name="viewport"
      />
      <meta content={description} name="description" />
      {desktopIcons.map((icon) => {
        const isStaticIcon =
          !icon.startsWith(ICON_PATH) && !icon.startsWith(USER_ICON_PATH);

        return (
          <link
            key={icon}
            as="image"
            href={isStaticIcon ? icon : undefined}
            imageSrcSet={
              isStaticIcon ? undefined : imageSrcs(icon, 48, ".webp")
            }
            rel="preload"
            type="image/webp"
            {...HIGH_PRIORITY_ELEMENT}
          />
        );
      })}
    </Head>
  );
};

export default Metadata;
