type Bookmark = {
  icon: string;
  name: string;
  url: string;
};

export const bookmarks: Bookmark[] = [
  {
    icon: "/System/Icons/google.png",
    name: "Google",
    url: "https://www.google.com/webhp?igu=1",
  },
  {
    icon: "/System/Icons/minecraft.png",
    name: "Minecraft Classic",
    url: "https://classic.minecraft.net/",
  },
  {
    icon: "/System/Icons/jspaint.png",
    name: "JS Paint",
    url: "https://jspaint.app/",
  },
  {
    icon: "/System/Icons/diablo.png",
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

export const GOOGLE_SEARCH_QUERY = "https://www.google.com/search?igu=1&q=";
