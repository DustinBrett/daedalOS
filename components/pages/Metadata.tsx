import Head from "next/head";
import { basename, dirname, join } from "path";
import preloadIcons from "public/.index/preload.json";
import {
  HIGH_PRIORITY_ELEMENT,
  ICON_PATH,
  PACKAGE_DATA,
  USER_ICON_PATH,
} from "utils/constants";

const { alias, description } = PACKAGE_DATA;

const contentSecurityPolicy = `
  base-uri 'self';
  connect-src 'self' blob: https: wss:;
  default-src 'none';
  font-src 'self' data:;
  frame-src 'self' https:;
  img-src 'self' blob: data: https:;
  media-src 'self' blob:;
  script-src 'unsafe-eval' blob: https:;
  script-src-elem 'self' blob: https://www.youtube.com;
  style-src 'self' 'unsafe-inline';
  worker-src 'self' blob:;
`;

const Metadata: FC = () => (
  <Head>
    <meta
      content="width=device-width, initial-scale=1, minimum-scale=1"
      name="viewport"
    />
    <meta content={description} name="description" />
    {process?.env?.NODE_ENV === "production" && (
      <meta
        content={contentSecurityPolicy.trim()}
        httpEquiv="Content-Security-Policy"
      />
    )}
    <title>{alias}</title>
    {preloadIcons?.map((icon) => (
      <link
        key={icon}
        as="image"
        href={
          icon.startsWith(ICON_PATH) || icon.startsWith(USER_ICON_PATH)
            ? join(dirname(icon), `48x48`, basename(icon)).replace(/\\/g, "/")
            : icon
        }
        rel="preload"
        {...HIGH_PRIORITY_ELEMENT}
      />
    ))}
  </Head>
);

export default Metadata;
