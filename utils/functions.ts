export const loadScript = (src: string, callback: () => void): void => {
  const script = document.createElement('script');

  script.src = src;
  script.onload = () => callback?.();

  document.head.appendChild(script);
};

export const bufferToUrl = (buffer: Buffer): string =>
  URL.createObjectURL(new Blob([new Uint8Array(buffer)]));
