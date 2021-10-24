import { loader } from "@monaco-editor/react";
import { config, globals, theme } from "components/apps/MonacoEditor/config";
import { detectLanguage } from "components/apps/MonacoEditor/functions";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { basename, extname } from "path";
import { useCallback, useEffect, useState } from "react";
import { MILLISECONDS_IN_SECOND } from "utils/constants";
import { cleanUpGlobals, lockGlobal, unlockGlobal } from "utils/globals";

const useMonaco = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { readFile } = useFileSystem();
  const { appendFileToTitle } = useTitle(id);
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>();
  const [monaco, setMonaco] = useState<typeof Monaco>();
  const loadFile = useCallback(async () => {
    if (monaco && editor) {
      unlockGlobal("define");
      editor.getModel()?.dispose();
      editor.setModel(
        monaco.editor.createModel(
          (await readFile(url)).toString(),
          detectLanguage(extname(url)),
          monaco.Uri.parse(url)
        )
      );
      appendFileToTitle(basename(url));
      setTimeout(() => lockGlobal("define"), 2.5 * MILLISECONDS_IN_SECOND);
    }
  }, [appendFileToTitle, editor, monaco, readFile, url]);

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
    if (monaco && editor && url) loadFile();
  }, [editor, loadFile, monaco, url]);
};

export default useMonaco;
