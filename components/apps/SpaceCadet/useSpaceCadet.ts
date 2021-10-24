import { useEffect, useState } from "react";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    Module: {
      canvas: HTMLCanvasElement;
    };
  }
}

const useSpaceCadet = (
  _id: string,
  _url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();

  useEffect(() => {
    const containerCanvas = containerRef.current?.querySelector("canvas");

    if (containerCanvas instanceof HTMLCanvasElement) {
      window.Module = { canvas: containerCanvas };
      setCanvas(containerCanvas);
    }
  }, [containerRef]);

  useEffect(() => {
    if (canvas) {
      loadFiles(["/Program Files/SpaceCadet/SpaceCadetPinball.js"]).then(() =>
        setLoading(false)
      );
    }
  }, [canvas, setLoading]);
};

export default useSpaceCadet;
