import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { runStableDiffusion } from "components/system/Desktop/Wallpapers/StableDiffusion";
import { useRef } from "react";
import StyledStableDiffusion from "./StyledStableDiffusion";

const StableDiffusion: FC<ComponentProcessProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputPositiveRef = useRef<HTMLInputElement>(null);
  const inputNegativeRef = useRef<HTMLInputElement>(null);

  return (
    <StyledStableDiffusion>
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
        <button
          onClick={() => {
            if (
              canvasRef.current &&
              inputPositiveRef.current &&
              inputNegativeRef.current
            ) {
              runStableDiffusion(
                {
                  prompts: [
                    [
                      inputPositiveRef.current.value,
                      inputNegativeRef.current.value,
                    ],
                  ],
                },
                canvasRef.current
              );
            }
          }}
          type="button"
        >
          Generate
        </button>
      </nav>
    </StyledStableDiffusion>
  );
};

export default StableDiffusion;
