import {
  isPrettyLanguage,
  prettyPrint,
} from "components/apps/MonacoEditor/language";
import StyledStatusBar from "components/apps/MonacoEditor/StyledStatusBar";
import type { Model } from "components/apps/MonacoEditor/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useEffect, useState } from "react";
import Button from "styles/common/Button";

const StatusBar = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { editor, url } = process || {};
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
    <StyledStatusBar>
      {editor && (
        <>
          <ol>
            <li>Lines {lineCount}</li>
          </ol>
          <ol>
            {url && isPrettyLanguage(language) && (
              <li title={`Pretty print ${basename(url)}`}>
                <Button
                  className="pretty"
                  onClick={async () =>
                    editor?.setValue(
                      await prettyPrint(language, editor.getValue())
                    )
                  }
                >
                  {"{ }"}
                </Button>
              </li>
            )}
            {position && (
              <li title="Go to Line/Column">
                <Button
                  onClick={() => {
                    editor?.focus();
                    editor?.getAction("editor.action.gotoLine").run();
                  }}
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
