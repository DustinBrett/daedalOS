import { extname } from 'path';

export const loadScript = (src: string): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedScripts = [...document.scripts];

    if (loadedScripts.find((script) => script.src.endsWith(src))) {
      resolve(new Event('Already loaded.'));
    } else {
      const script = document.createElement('script');

      script.async = false;
      script.src = src;
      script.onerror = (event) => reject(event);
      script.onload = (event) => resolve(event);

      document.head.appendChild(script);
    }
  });

export const loadStyle = (href: string): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedLinks = [...document.getElementsByTagName('link')];

    if (loadedLinks.find((link) => link.href.endsWith(href))) {
      resolve(new Event('Already loaded.'));
    } else {
      const link = document.createElement('link');

      link.rel = 'stylesheet';
      link.href = href;
      link.onerror = (event) => reject(event);
      link.onload = (event) => resolve(event);

      document.head.appendChild(link);
    }
  });

export const loadFiles = async (files: string[]): Promise<Event[]> =>
  Promise.all(
    files.reduce((filesToLoad: Promise<Event>[], file) => {
      const ext = extname(file);

      if (ext === '.css') filesToLoad.push(loadStyle(file));
      else if (ext === '.js') filesToLoad.push(loadScript(file));

      return filesToLoad;
    }, [])
  );

export const bufferToUrl = (buffer: Buffer): string =>
  URL.createObjectURL(new Blob([new Uint8Array(buffer)]));
