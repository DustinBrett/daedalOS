import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import FileManager from "components/system/Files/FileManager";
import { useProcesses } from "contexts/process";
import { useEffect } from "react";

const FileExplorer = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    title,
    processes: { [id]: { closing = false, url = "" } = {} },
  } = useProcesses();

  useEffect(() => {
    if (url) title(id, url);
  }, [id, url, title]);

  return url ? <FileManager closing={closing} url={url} view="icon" /> : <></>;
};

export default FileExplorer;
