import { FAVICON_BASE_PATH } from "utils/constants";

type Bookmark = {
  icon: string;
  name: string;
  path?: string;
  url: string;
};

export type WaybackUrlInfo = {
  archived_snapshots: { closest: { url: string } };
};

export const DINO_GAME = {
  icon: "/System/Icons/Favicons/dino.webp",
  name: "T-Rex Chrome Dino Game",
  path: "/Program Files/Browser/dino/index.html",
  url: "chrome://dino",
};

export const bookmarks: Bookmark[] = [
  {
    icon: FAVICON_BASE_PATH,
    name: "daedalOS",
    url: "https://dustinbrett.com/",
  },
  {
    icon: "/System/Icons/Favicons/dir.webp",
    name: "Index of /",
    url: "http://localhost/",
  },
  DINO_GAME,
  {
    icon: "/System/Icons/Favicons/google.webp",
    name: "Google",
    url: "https://www.google.com/webhp?igu=1",
  },
  {
    icon: "/System/Icons/Favicons/wikipedia.webp",
    name: "Wikipedia",
    url: "https://www.wikipedia.org/",
  },
  {
    icon: "/System/Icons/Favicons/archive.webp",
    name: "Internet Archive",
    url: "https://archive.org/",
  },
  {
    icon: "/System/Icons/webamp.webp",
    name: "Winamp Skin Museum",
    url: "https://skins.webamp.org/",
  },
  {
    icon: "/System/Icons/Favicons/win96.webp",
    name: "Windows 96",
    url: "https://windows96.net/",
  },
  {
    icon: "/System/Icons/Favicons/aos.webp",
    name: "AaronOS",
    url: "https://aaronos.dev/",
  },
];

export const HOME_PAGE = "https://www.google.com/webhp?igu=1";

export const LOCAL_HOST = new Set(["127.0.0.1", "localhost"]);

export const NOT_FOUND =
  '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"><html><head><title>404 Not Found</title><style>h1{display:inline;}</style></head><body><h1>Not Found</h1><p>The requested URL was not found on this server.</p></body></html>';

export const OLD_NET_PROXY =
  "https://theoldnet.com/get?scripts=true&decode=true&year=<year>&url=";

export const OLD_NET_SUPPORTED_YEARS = [
  1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
  2009, 2010, 2011, 2012,
];

export const WAYBACK_URL_INFO = "https://archive.org/wayback/available?url=";
