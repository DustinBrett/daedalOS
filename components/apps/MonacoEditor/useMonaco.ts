import { basename, dirname } from "path";
import loader from "@monaco-editor/loader";
import type * as Monaco from "monaco-editor";
import { useEffect, useState } from "react";
import {
  config,
  theme,
  URL_DELIMITER,
} from "components/apps/MonacoEditor/config";
import {
  detectLanguage,
  getSaveFileInfo,
  relocateShadowRoot,
} from "components/apps/MonacoEditor/functions";
import { type Model } from "components/apps/MonacoEditor/types";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcessesActions } from "contexts/process";
import {
  DEFAULT_TEXT_FILE_SAVE_PATH,
  MILLISECONDS_IN_SECOND,
} from "utils/constants";
import { getExtension } from "utils/functions";
import { shareGlobal } from "utils/globals";

const KeyS = 49 as Monaco.KeyCode;

const useMonaco = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { readFile, updateFolder, writeFile } = useFileSystemActions();
  const { argument: setArgument } = useProcessesActions();
  const { prependFileToTitle } = useTitle(id);
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>();
  const [monaco, setMonaco] = useState<typeof Monaco>();
  const createModelUri = (
    modelUrl: string,
    instance = 0
  ): Monaco.Uri | undefined => {
    const uriName = `${modelUrl}${URL_DELIMITER}${instance}`;
    const models = monaco?.editor.getModels();

    return models?.some(
      (model) => (model as Model)._associatedResource.path === uriName
    )
      ? createModelUri(modelUrl, instance + 1)
      : monaco?.Uri.parse(uriName);
  };
  const createModel = async (): Promise<Monaco.editor.ITextModel> => {
    const newModel = monaco?.editor.createModel(
      (await readFile(url)).toString(),
      detectLanguage(getExtension(url)),
      createModelUri(url)
    );

    newModel?.onDidChangeContent(() => prependFileToTitle(basename(url), true));

    return newModel as Monaco.editor.ITextModel;
  };
  const loadFile = async (): Promise<void> => {
    if (monaco && editor && url.startsWith("/")) {
      const hadFocus = editor.hasTextFocus();

      editor.getModel()?.dispose();
      editor.setModel(await createModel());
      // Disposing the focused model drops focus to the page, unless the user
      // went elsewhere while the file loaded
      if (hadFocus && document.activeElement === document.body) editor.focus();
    }

    prependFileToTitle(basename(url || DEFAULT_TEXT_FILE_SAVE_PATH));
  };

  useEffect(() => {
    if (!monaco) {
      shareGlobal("define", "MonacoEditor", 2.5 * MILLISECONDS_IN_SECOND);
      loader.config(config);
      loader
        .init()
        .then((monacoInstance) => setMonaco(monacoInstance as typeof Monaco));
    }
  }, [monaco]);

  useEffect(() => {
    editor?.onKeyDown(async (event) => {
      const { code, ctrlKey, keyCode } = event;

      if (ctrlKey && (code === "KeyS" || keyCode === KeyS)) {
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

    if (monaco && !editor && containerElement) {
      const currentEditor = monaco.editor.create(containerElement, {
        ariaLabel: "Editor content",
        automaticLayout: true,
        theme,
      });

      containerElement.addEventListener("blur", relocateShadowRoot, {
        capture: true,
        passive: true,
      });

      setEditor(currentEditor);
      setArgument(id, "editor", currentEditor);
      setLoading(false);
    }

    return () => {
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
    const sectionElement = containerRef.current?.closest("section");
    const onFocus = (): void => editor?.focus();

    // The window's focus goes to the editor, even focus it got before the
    // editor was created
    if (editor && document.activeElement === sectionElement) onFocus();
    sectionElement?.addEventListener("focus", onFocus, { passive: true });

    return () => sectionElement?.removeEventListener("focus", onFocus);
  }, [containerRef, editor]);

  useEffect(() => {
    if (monaco && editor && url) {
      editor.updateOptions({ ariaLabel: basename(url) });
      loadFile();
    }
  }, [editor, loadFile, monaco, url]);
};

export default useMonaco;
