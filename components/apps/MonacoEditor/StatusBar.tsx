import StyledStatusBar from "components/apps/MonacoEditor/StyledStatusBar";
import type { Model } from "components/apps/MonacoEditor/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import { useEffect, useState } from "react";

const StatusBar = ({ id }: ComponentProcessProps): JSX.Element => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { editor } = process || {};
  const [language, setLanguage] = useState("");
  const [position, setPosition] = useState("");
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    const updatePosition = (): void => {
      const selection = editor?.getSelection();
      const { positionColumn, positionLineNumber } = selection || {};
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
      const { language: modelLanguage } = model?.getLanguageIdentifier() || {};

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
      <ol>{lineCount > 0 && <li>Lines {lineCount}</li>}</ol>
      <ol>
        {position && <li>{position}</li>}
        {language !== "" && <li>{language}</li>}
      </ol>
    </StyledStatusBar>
  );
};

export default StatusBar;
