import StyledStatusBar from "components/apps/MonacoEditor/StyledStatusBar";
import { getSaveFileInfo } from "components/apps/MonacoEditor/functions";
import {
  isPrettyLanguage,
  prettyPrint,
} from "components/apps/MonacoEditor/language";
import type { Model } from "components/apps/MonacoEditor/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, dirname } from "path";
import { memo, useEffect, useState } from "react";
import Button from "styles/common/Button";
import { haltEvent, label } from "utils/functions";

const SaveIcon = memo(() => (
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="m13.353 1.146 1.5 1.5L15 3v11.5l-.5.5h-13l-.5-.5v-13l.5-.5H13l.353.146zM2 2v12h12V3.208L12.793 2H11v4H4V2H2zm6 0v3h2V2H8z"
      fillRule="evenodd"
    />
  </svg>
));

const StatusBar: FC<ComponentProcessProps> = ({ id }) => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { editor, url } = process || {};
  const { updateFolder, writeFile } = useFileSystem();
  const { prependFileToTitle } = useTitle(id);
  const [language, setLanguage] = useState("");
  const [position, setPosition] = useState("Ln 1, Col 1");
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const updatePosition = (): void => {
      const selection = editor?.getSelection();
      const { positionColumn = 0, positionLineNumber = 0 } = selection || {};
      const selectedText = selection
        ? editor?.getModel()?.getValueInRange(selection)
        : "";

      setPosition(
        `Ln ${positionLineNumber}, Col ${positionColumn}${
          selectedText ? ` (${selectedText.length} selected)` : ""
        }`
      );
    };
    const updateLineCount = (): void =>
      setLineCount(editor?.getModel()?.getLineCount() || 0);
    const updateModel = (): void => {
      const model = editor?.getModel() as Model;
      const modelLanguage = model?.getLanguageId();

      if (modelLanguage) {
        setLanguage(
          window.monaco?.languages
            .getLanguages()
            .reduce(
              (alias, { id: languageId, aliases }) =>
                languageId === modelLanguage ? aliases?.[0] || alias : alias,
              modelLanguage
            )
        );
      }

      updateLineCount();
      updatePosition();
    };

    editor?.onDidChangeModelContent(updateLineCount);
    editor?.onDidChangeCursorPosition(updatePosition);
    editor?.onDidChangeModel(updateModel);
  }, [editor]);

  return (
    <StyledStatusBar onContextMenuCapture={haltEvent}>
      {editor && (
        <>
          <ol>
            <li>Lines {lineCount}</li>
          </ol>
          <ol>
            <li className="clickable save">
              <Button
                onClick={async () => {
                  const [saveUrl, saveData] = getSaveFileInfo(url, editor);

                  if (saveUrl && saveData) {
                    await writeFile(saveUrl, saveData, true);
                    updateFolder(dirname(saveUrl), basename(saveUrl));
                    prependFileToTitle(basename(saveUrl));
                  }
                }}
                {...label("Save")}
              >
                <SaveIcon />
              </Button>
            </li>
            {url && isPrettyLanguage(language) && (
              <li className="clickable">
                <Button
                  className="pretty"
                  onClick={async () =>
                    editor?.setValue(
                      await prettyPrint(language, editor.getValue())
                    )
                  }
                  {...label(`Pretty print ${basename(url)}`)}
                >
                  {"{ }"}
                </Button>
              </li>
            )}
            {position && (
              <li className="clickable">
                <Button
                  onClick={() => {
                    try {
                      editor?.focus();
                      editor?.getAction("editor.action.gotoLine")?.run();
                    } catch {
                      // Ignore focus issues
                    }
                  }}
                  {...label("Go to Line/Column")}
                >
                  {position}
                </Button>
              </li>
            )}
            {language !== "" && <li>{language}</li>}
          </ol>
        </>
      )}
    </StyledStatusBar>
  );
};

export default StatusBar;
