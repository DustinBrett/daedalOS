import Editor, { loader } from "@monaco-editor/react";
import StyledMonacoEditor from "components/apps/MonacoEditor/StyledMonacoEditor";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { basename } from "path";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";
import { cleanUpGlobals } from "utils/functions";

type IStandaloneCodeEditor = Monaco.editor.IStandaloneCodeEditor;

const MonacoEditor = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    processes: { [id]: { url = "" } = {} },
  } = useProcesses();
  const { fs } = useFileSystem();
  const { appendFileToTitle } = useTitle(id);
  const [value, setValue] = useState("");
  const [editor, setEditor] = useState<IStandaloneCodeEditor>();

  useEffect(() => {
    fs?.readFile(url, (error, contents = EMPTY_BUFFER) => {
      if (!error) {
        setValue(contents.toString());
        appendFileToTitle(basename(url));
      }
    });

    return () => {
      if (editor) {
        editor.getModel()?.dispose();
        editor.dispose();
        cleanUpGlobals(["monaco"]);
      }
    };
  }, [appendFileToTitle, editor, fs, url]);

  loader.config({ paths: { vs: "/libs/monaco/vs" } });

  return (
    <StyledMonacoEditor>
      <Editor
        onMount={(mountedEditor) => setEditor(mountedEditor)}
        path={url}
        theme="vs-dark"
        value={value}
      />
    </StyledMonacoEditor>
  );
};

export default MonacoEditor;
