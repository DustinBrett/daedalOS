import { loader } from "@monaco-editor/react";
import {
  config,
  theme,
  URL_DELIMITER,
} from "components/apps/MonacoEditor/config";
import { detectLanguage } from "components/apps/MonacoEditor/functions";
import type { Model } from "components/apps/MonacoEditor/types";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { basename, extname } from "path";
import { useCallback, useEffect, useState } from "react";
import { MILLISECONDS_IN_SECOND } from "utils/constants";
import { lockGlobal, unlockGlobal } from "utils/globals";

const useMonaco = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { readFile, writeFile } = useFileSystem();
  const { argument: setArgument } = useProcesses();
  const { prependFileToTitle } = useTitle(id);
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>();
  const [monaco, setMonaco] = useState<typeof Monaco>();
  const createModelUri = useCallback(
    (modelUrl: string, instance = 0): Monaco.Uri | undefined => {
      const uriName = `${modelUrl}${URL_DELIMITER}${instance}`;
      const models = monaco?.editor.getModels();

      return models?.some(
        (model) => (model as Model)._associatedResource.path === uriName
      )
        ? createModelUri(modelUrl, instance + 1)
        : monaco?.Uri.parse(uriName);
    },
    [monaco?.Uri, monaco?.editor]
  );
  const createModel = useCallback(async () => {
    const newModel = monaco?.editor.createModel(
      (await readFile(url)).toString(),
      detectLanguage(extname(url)),
      createModelUri(url)
    );

    newModel?.onDidChangeContent(() => prependFileToTitle(basename(url), true));
    editor?.onKeyDown(async (event) => {
      const { ctrlKey, code } = event;

      if (ctrlKey && code === "KeyS") {
        const [baseUrl] =
          editor.getModel()?.uri.path.split(URL_DELIMITER) || [];

        if (url === baseUrl) {
          event.preventDefault();
          await writeFile(url, editor?.getValue(), true);
          prependFileToTitle(basename(url));
        }
      }
    });

    return newModel as Monaco.editor.ITextModel;
  }, [
    createModelUri,
    editor,
    monaco?.editor,
    prependFileToTitle,
    readFile,
    url,
    writeFile,
  ]);
  const loadFile = useCallback(async () => {
    if (monaco && editor) {
      unlockGlobal("define");
      editor.getModel()?.dispose();
      editor.setModel(await createModel());
      prependFileToTitle(basename(url));
      window.setTimeout(
        () => lockGlobal("define"),
        2.5 * MILLISECONDS_IN_SECOND
      );
    }
  }, [createModel, editor, monaco, prependFileToTitle, url]);

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
      const currentEditor = monaco.editor.create(containerRef.current, {
        automaticLayout: true,
        theme,
      });

      setEditor(currentEditor);
      setArgument(id, "editor", currentEditor);
      setLoading(false);
    }

    return () => {
      if (editor && monaco) {
        editor.getModel()?.dispose();
        editor.dispose();
      }
    };
  }, [containerRef, editor, id, monaco, setArgument, setLoading]);

  useEffect(() => {
    if (monaco && editor && url) loadFile();
  }, [editor, loadFile, monaco, url]);
};

export default useMonaco;
