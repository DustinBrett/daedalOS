import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { runStableDiffusion } from "components/system/Desktop/Wallpapers/StableDiffusion";
import { removeInvalidFilenameCharacters } from "components/system/Files/FileManager/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useMenu } from "contexts/menu";
import { useCallback, useMemo, useRef } from "react";
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
  const generateImage = useCallback(async () => {
    if (
      canvasRef.current &&
      inputPositiveRef.current &&
      inputNegativeRef.current
    ) {
      await runStableDiffusion(
        {
          prompts: [
            [inputPositiveRef.current.value, inputNegativeRef.current.value],
          ],
        },
        canvasRef.current
      );

      generatedAnImage.current = true;
    }
  }, []);

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
