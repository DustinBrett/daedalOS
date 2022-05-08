type Bookmark = {
  icon: string;
  name: string;
  url: string;
};

export const bookmarks: Bookmark[] = [
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
    icon: "/favicon.ico",
    name: "daedalOS",
    url: "https://dustinbrett.com/",
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
  {
    icon: "/System/Icons/Favicons/jspaint.webp",
    name: "JS Paint",
    url: "https://jspaint.app/",
  },
  {
    icon: "/System/Icons/Favicons/minecraft.webp",
    name: "Minecraft Classic",
    url: "https://classic.minecraft.net/",
  },
  {
    icon: "/System/Icons/Favicons/diablo.webp",
    name: "Diablo",
    url: "https://d07riv.github.io/diabloweb/",
  },
];

export const config = {
  referrerPolicy: "no-referrer" as React.HTMLAttributeReferrerPolicy,
  sandbox:
    "allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts",
};

export const HOME_PAGE = "https://www.google.com/webhp?igu=1";
