import { DESKTOP_PATH } from "utils/constants";

const plugins = `
  code help image link save wordcount`;

const toolbar = `
  save undo redo | formatselect | bold italic underline | forecolor backcolor |
  alignleft aligncenter alignright | outdent indent | code help`;

export const config = {
  base_url: "/Program Files/TinyMCE/",
  branding: false,
  contextmenu: "",
  draggable_modal: true,
  help_accessibility: false,
  image_advtab: true,
  plugins,
  promotion: false,
  suffix: ".min",
  toolbar,
};

export const DEFAULT_SAVE_PATH = `${DESKTOP_PATH}/New Rich Text Document.whtml`;
