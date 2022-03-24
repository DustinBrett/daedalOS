type Bookmark = {
  icon: string;
  name: string;
  url: string;
};

export const bookmarks: Bookmark[] = [
  {
    icon: "/System/Icons/Favicons/google.png",
    name: "Google",
    url: "https://www.google.com/webhp?igu=1",
  },
  {
    icon: "/favicon.ico",
    name: "daedalOS",
    url: "https://dustinbrett.com/",
  },
  {
    icon: "/System/Icons/Favicons/win96.png",
    name: "Windows 96",
    url: "https://windows96.net/",
  },
  {
    icon: "/System/Icons/Favicons/aos.png",
    name: "AaronOS",
    url: "https://aaronos.dev/AaronOS/",
  },
  {
    icon: "/System/Icons/Favicons/jspaint.png",
    name: "JS Paint",
    url: "https://jspaint.app/",
  },
  {
    icon: "/System/Icons/Favicons/minecraft.png",
    name: "Minecraft Classic",
    url: "https://classic.minecraft.net/",
  },
  {
    icon: "/System/Icons/Favicons/diablo.png",
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
