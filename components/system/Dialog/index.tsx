import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledDialog from "components/system/Dialog/StyledDialog";
import { useProcesses } from "contexts/process";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "styles/common/Button";
import type { FileReaders } from "utils/useDialog";

const MAX_TITLE_LENGTH = 37;

const Dialog = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    closeWithTransition,
    processes: { [id]: process } = {},
    title,
  } = useProcesses();
  const { fileReaders = [] } = process || {};
  const [[cd, { name = "" } = {}] = [], setCurrentTransfer] =
    useState<[string, File]>();
  const [progress, setProgress] = useState(0);
  const processReader = useCallback(
    ([[file, directory, reader], ...remainingReaders]: FileReaders) => {
      let fileProgress = 0;

      setCurrentTransfer([directory, file]);

      reader.addEventListener("progress", ({ loaded = 0 }) => {
        setProgress(
          (currentProgress) => currentProgress + (loaded - fileProgress)
        );
        fileProgress = loaded;
      });
      reader.addEventListener("loadend", () => {
        if (remainingReaders.length > 0) {
          processReader(remainingReaders);
        } else {
          closeWithTransition(id);
        }
      });
      reader.readAsArrayBuffer(file);
    },
    [closeWithTransition, id]
  );
  const totalTransferSize = useMemo(
    () => fileReaders.reduce((acc, [{ size = 0 }]) => acc + size, 0) || 0,
    [fileReaders]
  );

  useEffect(() => {
    if (fileReaders.length > 0) {
      title(id, "Copying...");
      processReader(fileReaders);
    } else {
      closeWithTransition(id);
    }
  }, [closeWithTransition, fileReaders, id, processReader, title]);

  return (
    <StyledDialog>
      <h1>
        {`Copying '${
          name.length >= MAX_TITLE_LENGTH
            ? `${name.slice(0, MAX_TITLE_LENGTH)}...`
            : name
        }'`}
      </h1>
      <div>
        <h2>{`To '${cd}'`}</h2>
        <progress max={totalTransferSize} value={progress} />
      </div>
      <nav>
        <Button
          onClick={() => {
            fileReaders.forEach(([, _, reader]) => reader.abort());
            closeWithTransition(id);
          }}
        >
          Cancel
        </Button>
      </nav>
    </StyledDialog>
  );
};

export default Dialog;
