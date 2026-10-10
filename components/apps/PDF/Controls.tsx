import { basename } from "path";
import type * as PrintJs from "print-js";
import { useState } from "react";
import {
  Add,
  Download,
  Print,
  Subtract,
} from "components/apps/PDF//ControlIcons";
import StyledControls from "components/apps/PDF/StyledControls";
import { scales } from "components/apps/PDF/usePDF";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess, useProcessesActions } from "contexts/process";
import Button from "styles/common/Button";
import { MILLISECONDS_IN_SECOND } from "utils/constants";
import { bufferToUrl, isSafari, label } from "utils/functions";
import { isComposingKey } from "utils/keyboard";

declare global {
  interface Window {
    InstallTrigger?: boolean;
  }
}

const loadPrintJs = (): Promise<typeof PrintJs> => import("print-js");

// Like Edge, what is typed applies on Enter or on leaving, unless Escape
// puts it back
const useDraftInput = (
  value: string,
  apply: (draft: string) => void
): React.InputHTMLAttributes<HTMLInputElement> => {
  const [draft, setDraft] = useState<string>();
  const applyDraft = (): void => {
    if (draft !== undefined) apply(draft);
    setDraft(undefined);
  };

  return {
    onBlur: applyDraft,
    onChange: ({ target }) => setDraft(target.value),
    onKeyDown: (event) => {
      if (isComposingKey(event.nativeEvent)) return;
      if (event.key === "Enter") applyDraft();
      else if (event.key === "Escape" && draft !== undefined) {
        event.preventDefault();
        setDraft(undefined);
      }
    },
    value: draft ?? value,
  };
};

const Controls: FC<ComponentProcessProps> = ({ id }) => {
  const { readFile } = useFileSystemActions();
  const { argument } = useProcessesActions();
  const {
    componentWindow,
    count = 0,
    page: currentPage = 1,
    rendering = false,
    scale = 1,
    subTitle = "",
    url = "",
  } = useProcess(id);
  const pageInput = useDraftInput(String(currentPage), (draft) => {
    const newPage = Number(draft);

    if (Number.isInteger(newPage) && newPage >= 1 && newPage <= count) {
      argument(id, "page", newPage);
      componentWindow
        ?.querySelector(`ol.pages > li:nth-child(${newPage})`)
        ?.scrollIntoView();
    }
  });
  const scaleInput = useDraftInput(`${Math.round(scale * 100)}%`, (draft) => {
    const newScale = Number(draft.replace("%", "")) / 100;

    if (newScale > 0) {
      argument(
        id,
        "scale",
        scales.find((s) => s >= newScale) || scales[scales.length - 1]
      );
    }
  });

  return (
    <StyledControls role="presentation">
      <div className="side-menu">
        <span>{subTitle || basename(url)}</span>
      </div>
      <ol>
        {count !== 0 && (
          <li className="pages">
            <input
              aria-label="Page number"
              enterKeyHint="go"
              inputMode="numeric"
              {...pageInput}
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
            aria-label="Zoom level"
            disabled={rendering || count === 0}
            enterKeyHint="done"
            {...scaleInput}
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

            const { default: printJs } = await loadPrintJs();

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

export default Controls;
