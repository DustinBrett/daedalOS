import StyledStableDiffusion from "components/apps/StableDiffusion/StyledStableDiffusion";
import type { StableDiffusionConfig } from "components/apps/StableDiffusion/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { runStableDiffusion } from "components/system/Desktop/Wallpapers/StableDiffusion";
import { useWebGPUCheck } from "hooks/useWebGPUCheck";
import useWorker from "hooks/useWorker";
import { useCallback, useMemo, useRef, useState } from "react";

type WorkerMessage = { data: { message: string; type: string } };

const SD_WORKER = (): Worker =>
  new Worker(
    new URL("components/apps/StableDiffusion/sd.worker", import.meta.url),
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
  const [status, setStatus] = useState<string>("");
  const statusLogger = useCallback((type: string, message: string) => {
    setStatus(type && message ? `${type} ${message}` : "");
  }, []);
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
          sdWorker.current.addEventListener(
            "message",
            ({ data }: WorkerMessage) => {
              statusLogger(data.type, data.message);
            }
          );
        }
      } else {
        window.tvmjsGlobalEnv.logger = statusLogger;

        await runStableDiffusion(config, canvasRef.current);

        statusLogger("", "");
      }

      generatedAnImage.current = true;
    }
  }, [sdWorker, statusLogger, supportsOffscreenCanvas]);
  const hasWebGPU = useWebGPUCheck();

  return (
    <StyledStableDiffusion $hasWebGPU={hasWebGPU}>
      <canvas ref={canvasRef} height={512} width={512} />
      <nav>
        <div>
          {status && <div>{status}</div>}
          <input
            ref={inputPositiveRef}
            defaultValue="A photo of an astronaut riding a elephant on jupiter"
            placeholder="Input Prompt"
            style={{ display: status ? "none" : "block" }}
            type="text"
          />
          <input
            ref={inputNegativeRef}
            placeholder="Negative Prompt"
            style={{ display: status ? "none" : "block" }}
            type="text"
          />
        </div>
        <button disabled={!!status} onClick={generateImage} type="button">
          Generate
        </button>
      </nav>
    </StyledStableDiffusion>
  );
};

export default StableDiffusion;
