import { basename } from "path";
import { memo } from "react";
import {
  Add,
  Download,
  Print,
  Subtract,
} from "components/apps/PDF//ControlIcons";
import StyledControls from "components/apps/PDF/StyledControls";
import { scales } from "components/apps/PDF/usePDF";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";
import { MILLISECONDS_IN_SECOND } from "utils/constants";
import { bufferToUrl, isSafari, label } from "utils/functions";

declare global {
  interface Window {
    InstallTrigger?: boolean;
  }
}

const Controls: FC<ComponentProcessProps> = ({ id }) => {
  const { readFile } = useFileSystem();
  const { argument, processes: { [id]: process } = {} } = useProcesses();
  const {
    count = 0,
    page: currentPage = 1,
    componentWindow,
    rendering = false,
    scale = 1,
    subTitle = "",
    url = "",
  } = process || {};

  return (
    <StyledControls>
      <div className="side-menu">
        <span>{subTitle || basename(url)}</span>
      </div>
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
            className="subtract"
            disabled={rendering || scale === 0.25 || count === 0}
            onClick={() =>
              argument(id, "scale", scales[scales.indexOf(scale) - 1])
            }
            {...label("Zoom out")}
          >
            <Subtract />
          </Button>
          <input
            disabled={rendering || count === 0}
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
            className="add"
            disabled={rendering || scale === 5 || count === 0}
            onClick={() =>
              argument(id, "scale", scales[scales.indexOf(scale) + 1])
            }
            {...label("Zoom in")}
          >
            <Add />
          </Button>
        </li>
      </ol>
      <div className="side-menu">
        <Button
          className="download"
          disabled={count === 0}
          onClick={async () => {
            const link = document.createElement("a");

            link.href = bufferToUrl(await readFile(url));
            link.download = basename(url);

            link.click();
          }}
          {...label("Download")}
        >
          <Download />
        </Button>
        <Button
          disabled={count === 0}
          onClick={async () => {
            if (isSafari()) {
              // Trick print-js into adding print delay
              window.InstallTrigger = true;
              setTimeout(() => {
                delete window.InstallTrigger;
              }, 5 * MILLISECONDS_IN_SECOND);
            }

            const { default: printJs } = await import("print-js");

            printJs({
              base64: true,
              printable: (await readFile(url)).toString("base64"),
              type: "pdf",
            });
          }}
          {...label("Print")}
        >
          <Print />
        </Button>
      </div>
    </StyledControls>
  );
};

export default memo(Controls);
