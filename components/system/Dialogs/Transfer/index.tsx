import { basename, dirname } from "path";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useCloseOnEscape from "components/system/Dialogs/useCloseOnEscape";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledButton from "components/system/Dialogs/StyledButton";
import StyledTransfer from "components/system/Dialogs/Transfer/StyledTransfer";
import {
  type FileReaders,
  type ObjectReaders,
  type Operation,
} from "components/system/Dialogs/Transfer/useTransferDialog";
import { useProcesses } from "contexts/process";
import { ONE_TIME_PASSIVE_EVENT } from "utils/constants";
import { haltEvent } from "utils/functions";

const MAX_TITLE_LENGTH = 37;

const isFileReaders = (
  readers?: FileReaders | ObjectReaders
): readers is FileReaders => Array.isArray(readers?.[0]);

const Transfer: FC<ComponentProcessProps> = ({ id }) => {
  const {
    argument,
    closeWithTransition,
    processes: { [id]: process } = {},
    title,
  } = useProcesses();
  const { closing, fileReaders, operation: baseOperation, url } = process || {};
  const [currentTransfer, setCurrentTransfer] = useState<[string, File]>();
  const [cd = "", { name = "" } = {}] = currentTransfer || [];
  const [progress, setProgress] = useState<number>(0);
  const currentOperation = useRef<Operation>(undefined);
  const actionName = useMemo(() => {
    if (closing || !process) return currentOperation.current;

    let operation: Operation = "Copying";
    const { operation: objectOperation } =
      (fileReaders as ObjectReaders)?.[0] || {};

    if (objectOperation) operation = objectOperation;
    else if (url && !fileReaders) operation = baseOperation || "Extracting";

    currentOperation.current = operation;

    return operation;
  }, [baseOperation, closing, fileReaders, process, url]);
  const processing = useRef(false);
  const completeTransfer = useCallback(() => {
    processing.current = false;
    closeWithTransition(id);
  }, [closeWithTransition, id]);
  const processObjectReader = useCallback(
    ([reader, ...remainingReaders]: ObjectReaders) => {
      const isComplete = remainingReaders.length === 0;

      reader.read().then(() => {
        setProgress((currentProgress) => currentProgress + 1);

        if (isComplete) {
          reader.done?.();
          completeTransfer();
        } else {
          const [{ directory, name: nextName }] = remainingReaders;

          setCurrentTransfer([directory, { name: nextName } as File]);
        }
      });

      if (!isComplete) processObjectReader(remainingReaders);
    },
    [completeTransfer]
  );
  const processFileReader = useCallback(
    ([[file, directory, reader], ...remainingReaders]: FileReaders) => {
      let fileProgress = 0;

      setCurrentTransfer([directory, file]);

      reader.addEventListener(
        "progress",
        ({ loaded = 0 }) => {
          const progressLoaded = loaded - fileProgress;

          setProgress((currentProgress) => currentProgress + progressLoaded);
          fileProgress = loaded;
        },
        { passive: true }
      );
      reader.addEventListener(
        "loadend",
        () => {
          if (remainingReaders.length > 0) {
            processFileReader(remainingReaders);
          } else {
            completeTransfer();
          }
        },
        ONE_TIME_PASSIVE_EVENT
      );
      // eslint-disable-next-line unicorn/prefer-blob-reading-methods
      reader.readAsArrayBuffer(file);
    },
    [completeTransfer]
  );
  const totalTransferSize = useMemo(
    () =>
      isFileReaders(fileReaders)
        ? fileReaders.reduce((acc, [{ size = 0 }]) => acc + size, 0)
        : fileReaders?.length || Number.POSITIVE_INFINITY,
    [fileReaders]
  );
  const closeOnEscape = useCloseOnEscape(id);

  useEffect(() => {
    if (!processing.current) {
      if (fileReaders) {
        if (fileReaders?.length > 0) {
          processing.current = true;

          if (isFileReaders(fileReaders)) {
            processFileReader(fileReaders);
          } else {
            const [{ directory, name: firstName }] = fileReaders;

            setCurrentTransfer([directory, { name: firstName } as File]);
            processObjectReader(fileReaders);
          }
        } else {
          closeWithTransition(id);
        }
      } else if (url) {
        setCurrentTransfer([dirname(url), { name: basename(url) } as File]);
      }
    }
  }, [
    closeWithTransition,
    fileReaders,
    id,
    processFileReader,
    processObjectReader,
    url,
  ]);

  useEffect(() => {
    if (processing.current) {
      const progressPercent = Math.floor((progress / totalTransferSize) * 100);

      argument(id, "progress", progressPercent);
      title(id, `${progressPercent}% complete`);
    }
  }, [argument, id, progress, title, totalTransferSize]);

  useEffect(() => title(id, `${actionName}...`), [actionName, id, title]);

  useEffect(
    () => () => {
      if (closing && processing.current) {
        if (isFileReaders(fileReaders)) {
          // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
          fileReaders.forEach(([, , reader]) => reader.abort());
        } else {
          fileReaders?.forEach((reader) => reader.abort());
          fileReaders?.[0]?.done?.();
        }
      }
    },
    [closing, fileReaders]
  );

  return (
    <StyledTransfer onContextMenu={haltEvent} {...closeOnEscape}>
      <h1>
        {name
          ? `${actionName} '${
              name.length >= MAX_TITLE_LENGTH
                ? `${name.slice(0, MAX_TITLE_LENGTH)}...`
                : name
            }'`
          : ""}
      </h1>
      <div>
        <h2>{cd ? `To '${cd}'` : ""}</h2>
        <progress
          max={totalTransferSize}
          value={
            totalTransferSize === Number.POSITIVE_INFINITY
              ? undefined
              : progress
          }
        />
      </div>
      <nav>
        <StyledButton onClick={() => closeWithTransition(id)}>
          Cancel
        </StyledButton>
      </nav>
    </StyledTransfer>
  );
};

export default memo(Transfer);
