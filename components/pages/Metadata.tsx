import Head from "next/head";
import desktopIcons from "public/.index/desktopIcons.json";
import {
  HIGH_PRIORITY_ELEMENT,
  ICON_PATH,
  PACKAGE_DATA,
  USER_ICON_PATH,
} from "utils/constants";
import { imageSrcs } from "utils/functions";

const { alias, description } = PACKAGE_DATA;

const Metadata: FC = () => (
  <Head>
    <meta
      content="width=device-width, initial-scale=1, minimum-scale=1"
      name="viewport"
    />
    <meta content={description} name="description" />
    <title>{alias}</title>
    {desktopIcons.map((icon) => {
      const isStaticIcon =
        !icon.startsWith(ICON_PATH) && !icon.startsWith(USER_ICON_PATH);

      return (
        <link
          key={icon}
          as="image"
          href={isStaticIcon ? icon : undefined}
          imageSrcSet={isStaticIcon ? undefined : imageSrcs(icon, 48, ".webp")}
          rel="preload"
          type="image/webp"
          {...HIGH_PRIORITY_ELEMENT}
        />
      );
    })}
  </Head>
);

export default Metadata;
