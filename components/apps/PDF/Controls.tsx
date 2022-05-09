import StyledControls from "components/apps/PDF/StyledControls";
import { scales } from "components/apps/PDF/usePDF";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";
import { label } from "utils/functions";

const Controls: FC<ComponentProcessProps> = ({ id }) => {
  const { argument, processes: { [id]: process } = {} } = useProcesses();
  const { count = 0, page: currentPage = 1, scale = 1 } = process || {};

  return (
    <StyledControls>
      <ol>
        {count !== 0 && (
          <li className="pages">
            <input enterKeyHint="go" value={currentPage} /> / {count}
          </li>
        )}
        <li className="scale">
          <Button
            disabled={scale === 0.25 || count === 0}
            onClick={() =>
              argument(id, "scale", scales[scales.indexOf(scale) - 1])
            }
            {...label("Zoom out")}
          >
            -
          </Button>
          <input
            disabled={count === 0}
            enterKeyHint="done"
            value={`${Math.round(scale * 100)}%`}
          />

          <Button
            disabled={scale === 5 || count === 0}
            onClick={() =>
              argument(id, "scale", scales[scales.indexOf(scale) + 1])
            }
            {...label("Zoom in")}
          >
            +
          </Button>
        </li>
      </ol>
    </StyledControls>
  );
};

export default Controls;
