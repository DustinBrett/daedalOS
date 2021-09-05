import Editor, { loader } from "@monaco-editor/react";
import { overrideSubMenuStyling } from "components/apps/MonacoEditor/functions";
import StyledMonacoEditor from "components/apps/MonacoEditor/StyledMonacoEditor";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";

const MonacoEditor = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    processes: { [id]: { url = "" } = {} },
  } = useProcesses();
  const { fs } = useFileSystem();
  const { appendFileToTitle } = useTitle(id);
  const [value, setValue] = useState("");

  useEffect(() => {
    fs?.readFile(url, (error, contents = EMPTY_BUFFER) => {
      if (!error) {
        setValue(contents.toString());
        appendFileToTitle(basename(url));
      }
    });
  }, [appendFileToTitle, fs, url]);

  loader.config({ paths: { vs: "/libs/monaco/vs" } });

  return (
    <StyledMonacoEditor onBlur={overrideSubMenuStyling}>
      <Editor path={url} theme="vs-dark" value={value} />
    </StyledMonacoEditor>
  );
};

export default MonacoEditor;
