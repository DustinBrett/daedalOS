import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { runStableDiffusion } from "components/system/Desktop/Wallpapers/StableDiffusion";
import type { StableDiffusionConfig } from "components/system/Desktop/Wallpapers/StableDiffusion/types";
import { removeInvalidFilenameCharacters } from "components/system/Files/FileManager/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import useWorker from "hooks/useWorker";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { DESKTOP_PATH } from "utils/constants";
import { generatePrettyTimestamp } from "utils/functions";
import StyledStableDiffusion from "./StyledStableDiffusion";

type CanvasRenderingContextWebGPU = {
  getCurrentTexture: () => unknown;
};

const StableDiffusion: FC<ComponentProcessProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputPositiveRef = useRef<HTMLInputElement>(null);
  const inputNegativeRef = useRef<HTMLInputElement>(null);
  const { createPath, updateFolder } = useFileSystem();
  const { contextMenu } = useMenu();
  const generatedAnImage = useRef(false);
  const supportsOffscreenCanvas = useMemo(
    () => typeof window !== "undefined" && "OffscreenCanvas" in window,
    []
  );
  const sdWorker = useWorker<void>(
    () =>
      new Worker(
        new URL(
          "components/system/Desktop/Wallpapers/StableDiffusion/wallpaper.worker",
          import.meta.url
        ),
        { name: "Stable Diffusion" }
      )
  );
  const downloadContextMenu = useMemo(
    () =>
      contextMenu?.(() => [
        {
          action: () => {
            if (!canvasRef.current) return;

            (
              canvasRef.current.getContext(
                "webgpu"
              ) as unknown as CanvasRenderingContextWebGPU
            )?.getCurrentTexture();

            setTimeout(() => {
              canvasRef.current?.toBlob(async (blob) => {
                if (!blob) return;

                const fileName = await createPath(
                  `${removeInvalidFilenameCharacters(
                    inputPositiveRef.current?.value || "Stable Diffusion"
                  )} (${generatePrettyTimestamp()}).jpg`,
                  DESKTOP_PATH,
                  Buffer.from(await blob?.arrayBuffer())
                );

                updateFolder(DESKTOP_PATH, fileName);
              });
            }, 100);
          },
          disabled: !generatedAnImage.current,
          label: "Save Image",
        },
      ]),
    [contextMenu, createPath, updateFolder]
  );
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

  useEffect(() => {
    if (supportsOffscreenCanvas && sdWorker.current) {
      sdWorker.current.postMessage("init");
    }
  }, [sdWorker, supportsOffscreenCanvas]);

  return (
    <StyledStableDiffusion
      $hasWebGPU={"gpu" in navigator}
      {...downloadContextMenu}
    >
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
