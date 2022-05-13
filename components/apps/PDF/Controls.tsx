import StyledControls from "components/apps/PDF/StyledControls";
import { scales } from "components/apps/PDF/usePDF";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";
import { label } from "utils/functions";

const Controls: FC<ComponentProcessProps> = ({ id }) => {
  const { argument, processes: { [id]: process } = {} } = useProcesses();
  const {
    count = 0,
    page: currentPage = 1,
    componentWindow,
    scale = 1,
  } = process || {};

  return (
    <StyledControls>
      <ol>
        {count !== 0 && (
          <li className="pages">
            <input
              enterKeyHint="go"
              onChange={({ target }) => {
                const newPage = Number(target.value);

                if (Number.isNaN(newPage) || newPage < 1 || newPage > count) {
                  return;
                }

                argument(id, "page", newPage);

                componentWindow
                  ?.querySelectorAll("li")
                  [newPage - 1].scrollIntoView();
              }}
              value={currentPage}
            />{" "}
            / {count}
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
            onChange={({ target }) => {
              if (
                !target.value.endsWith("%") ||
                target.value.length > 4 ||
                target.value.length < 2
              ) {
                return;
              }

              const newScale = Number(target.value.replace("%", "")) / 100;

              if (
                Number.isNaN(newScale) ||
                newScale > scales[scales.length - 1] ||
                newScale < scales[0]
              ) {
                return;
              }

              argument(
                id,
                "scale",
                scales[scales.findIndex((s) => s >= newScale)]
              );
            }}
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
