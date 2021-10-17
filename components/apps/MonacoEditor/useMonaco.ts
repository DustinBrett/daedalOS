import { loader } from "@monaco-editor/react";
import { config, globals, theme } from "components/apps/MonacoEditor/config";
import { detectLanguage } from "components/apps/MonacoEditor/functions";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { basename, extname } from "path";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";
import { cleanUpGlobals, lockGlobal, unlockGlobal } from "utils/globals";

const useMonaco = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { fs } = useFileSystem();
  const { appendFileToTitle } = useTitle(id);
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>();
  const [monaco, setMonaco] = useState<typeof Monaco>();

  useEffect(() => {
    if (!monaco) {
      unlockGlobal("define");
      loader.config(config);
      loader.init().then((monacoInstance) => {
        lockGlobal("define");
        setMonaco(monacoInstance);
      });
    }
  }, [monaco]);

  useEffect(() => {
    if (monaco && !editor && containerRef.current) {
      setEditor(
        monaco.editor.create(containerRef.current, {
          automaticLayout: true,
          theme,
        })
      );
      setLoading(false);
    }

    return () => {
      if (editor && monaco) {
        monaco.editor.getModels().forEach((model) => model.dispose());
        editor.dispose();
        cleanUpGlobals(globals);
      }
    };
  }, [containerRef, editor, monaco, setLoading]);

  useEffect(() => {
    if (monaco && editor && url) {
      unlockGlobal("define");
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
        setTimeout(() => lockGlobal("define"), 3000);
      });
    }
  }, [appendFileToTitle, editor, fs, monaco, url]);
};

export default useMonaco;
