import Head from "next/head";
import { basename, dirname, join } from "path";
import preloadIcons from "public/.index/preload.json";
import { ICON_PATH, PACKAGE_DATA, USER_ICON_PATH } from "utils/constants";

const { alias, description } = PACKAGE_DATA;

const Metadata: FC = () => (
  <Head>
    <meta
      content="width=device-width, initial-scale=1, minimum-scale=1"
      name="viewport"
    />
    <meta content={description} name="description" />
    <title>{alias}</title>
    {(preloadIcons as string[])?.map((icon) => (
      <link
        key={icon}
        as="image"
        href={
          icon.startsWith(ICON_PATH) || icon.startsWith(USER_ICON_PATH)
            ? join(dirname(icon), `48x48`, basename(icon)).replace(/\\/g, "/")
            : icon
        }
        rel="preload"
      />
    ))}
  </Head>
);

export default Metadata;
