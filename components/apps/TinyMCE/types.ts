import { type TinyMCE } from "tinymce";

declare global {
  interface Window {
    tinymce: TinyMCE;
  }
}

export interface IRTFJS {
  RTFJS: {
    Document: new (documentData: Buffer) => {
      render: () => Promise<HTMLElement[]>;
    };
  };
}
