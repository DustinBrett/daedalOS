import { memo } from "react";
import Head from "next/head";
import { useFaviconAndTitle } from "components/pages/hooks/useFaviconAndTitle";
import { useCursor } from "components/pages/hooks/useCursor";
import desktopIcons from "public/.index/desktopIcons.json";
import { HIGH_PRIORITY_ELEMENT, PACKAGE_DATA } from "utils/constants";
import {
  getExtension,
  getMimeType,
  imageSrcs,
  isDynamicIcon,
} from "utils/functions";

const { alias, author, description } = PACKAGE_DATA;

const PreloadIcons = memo(() =>
  desktopIcons.map((icon) => {
    const isSubIcon = icon.includes("/16x16/");
    const dynamicIcon = !isSubIcon && isDynamicIcon(icon);
    const extension = getExtension(icon);

    return (
      <link
        key={icon}
        as="image"
        href={dynamicIcon || isSubIcon ? undefined : icon}
        imageSrcSet={
          dynamicIcon
            ? imageSrcs(icon, 48, extension)
            : isSubIcon
              ? imageSrcs(icon.replace("16x16/", ""), 16, extension)
              : undefined
        }
        rel="preload"
        type={getMimeType(extension)}
        {...HIGH_PRIORITY_ELEMENT}
      />
    );
  })
);

const Metadata: FC = () => {
  const { title, Favicon } = useFaviconAndTitle();

  return (
    <Head>
      <title>{title}</title>
      {Favicon}
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
      <PreloadIcons />
      {useCursor()}
    </Head>
  );
};

export default memo(Metadata);
