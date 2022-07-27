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
import { getDpi, imageSrc, imageSrcs, supportsWebp } from "utils/functions";

const { alias, description } = PACKAGE_DATA;

const Metadata: FC = () => {
  const [title, setTitle] = useState(alias);
  const [favIcon, setFavIcon] = useState("");
  const { foregroundId } = useSession();
  const { processes: { [foregroundId]: process } = {} } = useProcesses();

  useEffect(() => {
    if (process) {
      const documentTitle = `${process.title} - ${alias}`;

      if (title !== documentTitle) {
        setTitle(documentTitle);
        setFavIcon(process.icon || FAVICON_BASE_PATH);
      }
    } else {
      setTitle(alias);
      setFavIcon((currentFavicon) =>
        currentFavicon ? FAVICON_BASE_PATH : currentFavicon
      );
    }
  }, [process, title]);

  return (
    <Head>
      <title>{title}</title>
      {favIcon && (
        <link
          href={
            favIcon === FAVICON_BASE_PATH
              ? FAVICON_BASE_PATH
              : imageSrc(
                  favIcon,
                  16,
                  getDpi(),
                  supportsWebp() ? ".webp" : ".png"
                ).split(" ")[0]
          }
          rel="icon"
          type={supportsWebp() ? "image/webp" : "image/png"}
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
