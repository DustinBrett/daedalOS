import { DESKTOP_PATH } from "utils/constants";

const plugins = `
  code help image link lists media
  preview save searchreplace table wordcount`;

const toolbar = `
  save undo redo | formatselect | bold italic underline | forecolor backcolor |
  alignleft aligncenter alignright | bullist outdent indent | code | help`;

export const config = {
  base_url: "/Program Files/TinyMCE/",
  branding: false,
  draggable_modal: true,
  help_accessibility: false,
  image_advtab: true,
  plugins,
  promotion: false,
  suffix: ".min",
  toolbar,
};

export const DEFAULT_SAVE_PATH = `${DESKTOP_PATH}/New Rich Text Document.whtml`;
