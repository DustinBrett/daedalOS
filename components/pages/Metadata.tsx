import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import Head from "next/head";
import desktopIcons from "public/.index/desktopIcons.json";
import { useEffect, useState } from "react";
import {
  HIGH_PRIORITY_ELEMENT,
  ICON_PATH,
  PACKAGE_DATA,
  USER_ICON_PATH,
} from "utils/constants";
import { imageSrcs } from "utils/functions";

const { alias, description } = PACKAGE_DATA;

const Metadata: FC = () => {
  const [title, setTitle] = useState(alias);
  const { foregroundId } = useSession();
  const { processes: { [foregroundId]: process } = {} } = useProcesses();

  useEffect(() => {
    if (process) {
      const documentTitle = `${process.title} - ${alias}`;

      if (title !== documentTitle) setTitle(documentTitle);
    } else {
      setTitle(alias);
    }
  }, [process, title]);

  return (
    <Head>
      <title>{title}</title>
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
