import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledButton from "components/system/Dialog/StyledButton";
import StyledRun from "components/system/Dialog/StyledRun";
import { getProcessByFileExtension } from "components/system/Files/FileEntry/functions";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useSession } from "contexts/session";
import { extname } from "path";
import { useCallback, useEffect, useRef, useState } from "react";

const OPEN_ID = "open";

const Run: FC<ComponentProcessProps> = () => {
  const { open, close, processes: { Run: runProcess } = {} } = useProcesses();
  const { exists, stat } = useFileSystem();
  const { foregroundId } = useSession();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [isEmptyInput, setIsEmptyInput] = useState(true);
  const runResource = useCallback(
    async (resource?: string) => {
      if (!resource) return;

      if (await exists(resource)) {
        const stats = await stat(resource);

        if (stats.isDirectory()) {
          open("FileExplorer", { url: resource }, "");
        } else {
          const basePid = getProcessByFileExtension(extname(resource));

          if (basePid) open(basePid, { url: resource });
        }
      } else if (
        Object.keys(processDirectory).some(
          (processName) => processName.toLowerCase() === resource.toLowerCase()
        )
      ) {
        open(resource);
      } else {
        throw new Error(`${resource} not found`);
      }

      close("Run");
    },
    [close, exists, open, stat]
  );

  useEffect(() => {
    if (inputRef.current && foregroundId === "Run") {
      inputRef.current.focus();
    }
  }, [foregroundId]);

  return (
    <StyledRun>
      <figure>
        <img alt="Run" src="/System/Icons/32x32/run.webp" />
        <figcaption>
          Type the name of a program, folder, document, or Internet resource,
          and daedalOS will open it for you.
        </figcaption>
      </figure>
      <div>
        <label htmlFor={OPEN_ID}>Open:</label>
        <input
          ref={inputRef}
          autoComplete="off"
          enterKeyHint="go"
          id={OPEN_ID}
          onBlurCapture={({ relatedTarget }) => {
            if (
              !runProcess?.componentWindow ||
              runProcess.componentWindow.contains(relatedTarget)
            ) {
              inputRef.current?.focus();
            } else {
              setIsInputFocused(false);
            }
          }}
          onFocus={() => setIsInputFocused(true)}
          onKeyDown={({ key }) => {
            if (key === "Enter") runResource(inputRef.current?.value.trim());
          }}
          onKeyUp={({ target }) =>
            setIsEmptyInput(!(target as HTMLInputElement)?.value)
          }
          spellCheck="false"
          type="text"
        />
      </div>
      <nav>
        <StyledButton
          $active={isInputFocused}
          disabled={isEmptyInput}
          onClick={() => runResource(inputRef.current?.value.trim())}
        >
          OK
        </StyledButton>
        <StyledButton onClick={() => close("Run")}>Cancel</StyledButton>
      </nav>
    </StyledRun>
  );
};

export default Run;
