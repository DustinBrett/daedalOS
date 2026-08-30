import { memo, useCallback, useEffect, useRef, useState } from "react";
import useCanvasContextMenu from "components/apps/StableDiffusion/useCanvasContextMenu";
import StyledStableDiffusion from "components/apps/StableDiffusion/StyledStableDiffusion";
import {
  type Prompt,
  type StableDiffusionConfig,
} from "components/apps/StableDiffusion/types";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { runStableDiffusion } from "components/system/Desktop/Wallpapers/StableDiffusion";
import { useWebGPUCheck } from "hooks/useWebGPUCheck";
import useWorker from "hooks/useWorker";
import { hasOffscreenCanvasSupport } from "utils/functions";

type WorkerMessage = { data: { message: string; type: string } };

const SD_WORKER = (): Worker =>
  new Worker(
    new URL("components/apps/StableDiffusion/sd.worker", import.meta.url),
    { name: "Stable Diffusion" }
  );

const DEFAULT_PROMPT: Prompt = [
  "A photo of an astronaut riding a horse on Mars",
  "",
];
const NO_WEBGPU_SUPPORT = "No WebGPU Support";

const StableDiffusion: FC<ComponentProcessProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState<Prompt>(DEFAULT_PROMPT);
  const generatedAnImage = useRef(false);
  const sdWorker = useWorker<void>(SD_WORKER);
  const transferedCanvas = useRef(false);
  const [status, setStatus] = useState<string>(NO_WEBGPU_SUPPORT);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const generateImage = useCallback(async () => {
    if (canvasRef.current) {
      const config: StableDiffusionConfig = { prompts: [prompt] };

      setGeneratedPrompt(prompt[0]);

      if (hasOffscreenCanvasSupport() && sdWorker.current) {
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
            ({ data }: WorkerMessage) => setStatus(data.message)
          );
        }
      } else {
        window.tvmjsGlobalEnv.logger = setStatus;

        await runStableDiffusion(config, canvasRef.current);

        setStatus("");
      }

      generatedAnImage.current = true;
    }
  }, [prompt, sdWorker]);
  const hasWebGPU = useWebGPUCheck();
  const { onContextMenuCapture } = useCanvasContextMenu(
    canvasRef,
    prompt[0],
    generatedAnImage.current && !status
  );

  useEffect(() => {
    if (hasWebGPU && status === NO_WEBGPU_SUPPORT) setStatus("");
  }, [hasWebGPU, status]);

  return (
    <StyledStableDiffusion>
      <nav role="presentation">
        <div className="prompts">
          <textarea
            aria-label="Input Prompt"
            defaultValue={prompt[0]}
            onChange={({ target }) =>
              setPrompt(([, negativePrompt]) => [
                target.value.trim(),
                negativePrompt,
              ])
            }
            placeholder="Input Prompt"
          />
          <textarea
            aria-label="Negative Prompt"
            defaultValue={prompt[1]}
            onChange={({ target }) =>
              setPrompt(([positivePrompt]) => [
                positivePrompt,
                target.value.trim(),
              ])
            }
            placeholder="Negative Prompt"
          />
        </div>
        <button
          disabled={
            !!status || !hasWebGPU || (prompt[0] === "" && prompt[1] === "")
          }
          onClick={generateImage}
          type="button"
        >
          Generate
        </button>
      </nav>
      <div className="image">
        <canvas
          ref={canvasRef}
          // Busy only while actually generating (the WebGPU-unsupported
          // status is an idle state), and never on an ancestor of the
          // role="status" region or its announcements may be withheld
          aria-busy={
            (Boolean(status) && status !== NO_WEBGPU_SUPPORT) || undefined
          }
          aria-label={generatedPrompt || "Generated image"}
          height={512}
          onContextMenuCapture={onContextMenuCapture}
          role="img"
          width={512}
        />
        <div className="status" role="status">
          {status}
        </div>
      </div>
    </StyledStableDiffusion>
  );
};

export default memo(StableDiffusion);
