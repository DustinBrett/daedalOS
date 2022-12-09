
type Bookmark = {
  icon: string;
  name: string;
  url: string;
};

export const bookmarks: Bookmark[] = [
 {
   icon: "/System/Icons/Favicons/fishy-icons-01.webp",
   name: "Analog Rock Machine studio",
   url: "https://analogrockmachinestudio.com/",
 },
 {
   icon: "/System/Icons/Favicons/fishy-icons-02.webp",
   name: "Deep Sea",
   url: "https://neal.fun/deep-sea/",
 },
 {
   icon: "/System/Icons/Favicons/fishy-icons-03.webp",
   name: "Forming Hawaii",
   url: "https://education.nationalgeographic.org/resource/chain-islands-hawaiian-hot-spot",
 },
 {
   icon: "/System/Icons/Favicons/fishy-icons-05.webp",
   name: "8 Bit",
   url: "https://www.8bit.com/",
 },
  {
   icon: "/System/Icons/Favicons/fishy-icons-06.webp",
   name: "Silk",
   url: "http://weavesilk.com/",
 },
];

export const config = {
  referrerPolicy: "no-referrer" as React.HTMLAttributeReferrerPolicy,
  sandbox:
    "allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts",
};

export const HOME_PAGE = "https://www.google.com/webhp?igu=1";
