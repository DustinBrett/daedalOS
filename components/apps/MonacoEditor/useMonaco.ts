import { basename, dirname } from "path";
import { useCallback, useEffect, useState } from "react";
import loader from "@monaco-editor/loader";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  URL_DELIMITER,
  config,
  theme,
} from "components/apps/MonacoEditor/config";
import {
  detectLanguage,
  getSaveFileInfo,
  relocateShadowRoot,
} from "components/apps/MonacoEditor/functions";
import { type Model } from "components/apps/MonacoEditor/types";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import {
  DEFAULT_TEXT_FILE_SAVE_PATH,
  MILLISECONDS_IN_SECOND,
} from "utils/constants";
import { getExtension } from "utils/functions";
import { shareGlobal } from "utils/globals";

const useMonaco = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { readFile, updateFolder, writeFile } = useFileSystem();
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
      detectLanguage(getExtension(url)),
      createModelUri(url)
    );

    newModel?.onDidChangeContent(() => prependFileToTitle(basename(url), true));

    return newModel as Monaco.editor.ITextModel;
  }, [createModelUri, monaco?.editor, prependFileToTitle, readFile, url]);
  const loadFile = useCallback(async () => {
    if (monaco && editor && url.startsWith("/")) {
      editor.getModel()?.dispose();
      editor.setModel(await createModel());
    }

    prependFileToTitle(basename(url || DEFAULT_TEXT_FILE_SAVE_PATH));
  }, [createModel, editor, monaco, prependFileToTitle, url]);

  useEffect(() => {
    if (!monaco) {
      shareGlobal("define", "MonacoEditor", 2.5 * MILLISECONDS_IN_SECOND);
      loader.config(config);
      loader.init().then((monacoInstance) => setMonaco(monacoInstance));
    }
  }, [monaco]);

  useEffect(() => {
    editor?.onKeyDown(async (event) => {
      const { ctrlKey, code, keyCode } = event;

      if (ctrlKey && (code === "KeyS" || (keyCode as number) === 49)) {
        event.preventDefault();

        const [saveUrl, saveData] = getSaveFileInfo(url, editor);

        if (saveUrl && typeof saveData === "string") {
          await writeFile(saveUrl, saveData, true);
          updateFolder(dirname(saveUrl), basename(saveUrl));
          prependFileToTitle(basename(saveUrl));
        }
      }
    });
  }, [editor, prependFileToTitle, updateFolder, url, writeFile]);

  useEffect(() => {
    const containerElement = containerRef.current;
    const sectionElement = containerElement?.closest("section");
    let onFocus: (() => void) | undefined;

    if (monaco && !editor && containerElement) {
      const currentEditor = monaco.editor.create(containerElement, {
        ariaLabel: "Editor content",
        automaticLayout: true,
        theme,
      });

      onFocus = () => currentEditor.focus();

      sectionElement?.addEventListener("focus", onFocus, { passive: true });
      containerElement.addEventListener("blur", relocateShadowRoot, {
        capture: true,
        passive: true,
      });

      setEditor(currentEditor);
      setArgument(id, "editor", currentEditor);
      setLoading(false);
    }

    return () => {
      if (onFocus) sectionElement?.removeEventListener("focus", onFocus);
      containerElement?.removeEventListener("blur", relocateShadowRoot, {
        capture: true,
      });
      if (editor && monaco) {
        editor.getModel()?.dispose();
        editor.dispose();
      }
    };
  }, [containerRef, editor, id, monaco, setArgument, setLoading]);

  useEffect(() => {
    if (monaco && editor && url) {
      editor.updateOptions({ ariaLabel: basename(url) });
      loadFile();
    }
  }, [editor, loadFile, monaco, url]);
};

export default useMonaco;
