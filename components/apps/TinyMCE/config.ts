const plugins = `
  code fullscreen help image link lists media paste
  preview print searchreplace table wordcount`;

const toolbar = `
  undo redo | formatselect | bold italic underline | forecolor backcolor |
  alignleft aligncenter alignright | bullist outdent indent | code | help`;

const config = {
  init: {
    branding: false,
    draggable_modal: true,
    image_advtab: true,
    plugins,
    toolbar,
  },
  tinymceScriptSrc: "/libs/tinymce/tinymce.min.js",
};

export default config;
