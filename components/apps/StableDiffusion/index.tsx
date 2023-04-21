import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { runStableDiffusion } from "components/system/Desktop/Wallpapers/StableDiffusion";
import type { StableDiffusionConfig } from "components/system/Desktop/Wallpapers/StableDiffusion/types";
import useWorker from "hooks/useWorker";
import { useCallback, useMemo, useRef } from "react";
import StyledStableDiffusion from "./StyledStableDiffusion";

const SD_WORKER = (): Worker =>
  new Worker(
    new URL(
      "components/system/Desktop/Wallpapers/StableDiffusion/wallpaper.worker",
      import.meta.url
    ),
    { name: "Stable Diffusion" }
  );

const StableDiffusion: FC<ComponentProcessProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputPositiveRef = useRef<HTMLInputElement>(null);
  const inputNegativeRef = useRef<HTMLInputElement>(null);
  const generatedAnImage = useRef(false);
  const supportsOffscreenCanvas = useMemo(
    () => typeof window !== "undefined" && "OffscreenCanvas" in window,
    []
  );
  const sdWorker = useWorker<void>(SD_WORKER);
  const transferedCanvas = useRef(false);
  const generateImage = useCallback(async () => {
    if (
      canvasRef.current &&
      inputPositiveRef.current &&
      inputNegativeRef.current
    ) {
      const config: StableDiffusionConfig = {
        prompts: [
          [inputPositiveRef.current.value, inputNegativeRef.current.value],
        ],
      };

      if (supportsOffscreenCanvas && sdWorker.current) {
        if (transferedCanvas.current) {
          sdWorker.current.postMessage({ config });
        } else {
          const offscreenCanvas =
            canvasRef.current.transferControlToOffscreen();

          transferedCanvas.current = true;
          sdWorker.current.postMessage({ canvas: offscreenCanvas, config }, [
            offscreenCanvas,
          ]);
        }
      } else {
        await runStableDiffusion(config, canvasRef.current);
      }

      generatedAnImage.current = true;
    }
  }, [sdWorker, supportsOffscreenCanvas]);

  return (
    <StyledStableDiffusion $hasWebGPU={"gpu" in navigator}>
      <canvas ref={canvasRef} height={512} width={512} />
      <nav>
        <div>
          <input
            ref={inputPositiveRef}
            defaultValue="A photo of an astronaut riding a elephant on jupiter"
            placeholder="Input Prompt"
            type="text"
          />
          <input
            ref={inputNegativeRef}
            placeholder="Negative Prompt"
            type="text"
          />
        </div>
        <button onClick={generateImage} type="button">
          Generate
        </button>
      </nav>
    </StyledStableDiffusion>
  );
};

export default StableDiffusion;
