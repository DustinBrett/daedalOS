import StyledControls from "components/apps/PDF/StyledControls";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";

const scales = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4,
  5,
];

const Controls = ({ id }: ComponentProcessProps): JSX.Element => {
  const { argument, processes: { [id]: process } = {} } = useProcesses();
  const { count = 0, page: currentPage = 1, scale = 1 } = process || {};

  return (
    <StyledControls>
      <ol>
        {count !== 0 && (
          <li className="pages">
            {currentPage} / {count}
          </li>
        )}
        <li className="scale">
          <Button
            disabled={scale === 0.25 || count === 0}
            onClick={() =>
              argument(id, "scale", scales[scales.indexOf(scale) - 1])
            }
            title="Zoom out"
          >
            -
          </Button>
          {Math.round(scale * 100)}%
          <Button
            disabled={scale === 5 || count === 0}
            onClick={() =>
              argument(id, "scale", scales[scales.indexOf(scale) + 1])
            }
            title="Zoom in"
          >
            +
          </Button>
        </li>
      </ol>
    </StyledControls>
  );
};

export default Controls;
