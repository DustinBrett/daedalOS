import { loader } from "@monaco-editor/react";
import { config, globals, theme } from "components/apps/MonacoEditor/config";
import { detectLanguage } from "components/apps/MonacoEditor/functions";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { basename, extname } from "path";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";
import { cleanUpGlobals } from "utils/functions";

const useMonaco = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>
): void => {
  const { fs } = useFileSystem();
  const { appendFileToTitle } = useTitle(id);
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>();
  const [monaco, setMonaco] = useState<typeof Monaco>();

  useEffect(() => {
    if (!monaco) {
      loader.config(config);
      loader.init().then((monacoInstance) => setMonaco(monacoInstance));
    }
  }, [monaco]);

  useEffect(() => {
    if (monaco && !editor && containerRef.current) {
      setEditor(
        monaco.editor.create(containerRef.current, {
          theme,
          automaticLayout: true,
        })
      );
    }

    return () => {
      if (editor) {
        editor.getModel()?.dispose();
        editor.dispose();
        cleanUpGlobals(globals);
      }
    };
  }, [containerRef, editor, monaco]);

  useEffect(() => {
    if (monaco && editor && url) {
      fs?.readFile(url, (error, contents = EMPTY_BUFFER) => {
        if (!error) {
          editor.getModel()?.dispose();
          editor.setModel(
            monaco.editor.createModel(
              contents.toString(),
              detectLanguage(extname(url)),
              monaco.Uri.parse(url)
            )
          );
          appendFileToTitle(basename(url));
        }
      });
    }
  }, [appendFileToTitle, editor, fs, monaco, url]);
};

export default useMonaco;
