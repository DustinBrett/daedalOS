import { DESKTOP_PATH } from "utils/constants";

const plugins = `
  code fullscreen help image link lists media paste
  preview print save searchreplace table wordcount`;

const toolbar = `
  save undo redo | formatselect | bold italic underline | forecolor backcolor |
  alignleft aligncenter alignright | bullist outdent indent | code | help`;

export const config = {
  base_url: "/Program Files/TinyMCE/",
  branding: false,
  draggable_modal: true,
  image_advtab: true,
  plugins,
  suffix: ".min",
  toolbar,
};

export const libs = ["/Program Files/TinyMCE/tinymce.min.js"];

export const DEFAULT_SAVE_PATH = `${DESKTOP_PATH}/New Rich Text Document.whtml`;
