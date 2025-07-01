import { basename, dirname } from "path";
import { memo, useEffect, useState } from "react";
import {
  ErrorIcon,
  InfoIcon,
  SaveIcon,
  WarningIcon,
} from "components/apps/MonacoEditor/Icons";
import StyledNotifications from "components/apps/MonacoEditor/StyledNotifications";
import StyledStatusBar from "components/apps/MonacoEditor/StyledStatusBar";
import { getSaveFileInfo } from "components/apps/MonacoEditor/functions";
import {
  type PrettierError,
  isPrettyLanguage,
  prettyPrint,
} from "components/apps/MonacoEditor/language";
import { type Model } from "components/apps/MonacoEditor/types";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import Button from "styles/common/Button";
import { haltEvent, label } from "utils/functions";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

type NotificationType = "error" | "warning" | "info";

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
  const [notifications, setNotifications] = useState<
    {
      message: string;
      type: NotificationType;
    }[]
  >([]);
  const addNotification = (message: string, type: NotificationType): void =>
    setNotifications((currentNotifications) => [
      ...currentNotifications,
      { message, type },
    ]);

  useEffect(() => {
    if (notifications.length > 0) {
      setTimeout(() => {
        setNotifications((currentNotifications) =>
          currentNotifications.slice(1)
        );
      }, MILLISECONDS_IN_SECOND * 10);
    }
  }, [notifications]);

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
          <ol className="status">
            <li>Lines {lineCount}</li>
          </ol>
          <ol className="status">
            <li className="clickable save">
              <Button
                onClick={async () => {
                  const [saveUrl, saveData] = getSaveFileInfo(url, editor);

                  if (saveUrl && saveData) {
                    await writeFile(saveUrl, saveData, true);
                    updateFolder(dirname(saveUrl), basename(saveUrl));
                    prependFileToTitle(basename(saveUrl));
                    addNotification("File saved", "info");
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
                  onClick={async () => {
                    try {
                      editor?.setValue(
                        await prettyPrint(language, editor.getValue())
                      );

                      addNotification("Formatted successfully", "info");
                    } catch (error) {
                      const { cause, loc, message } = error as PrettierError;

                      addNotification(
                        cause
                          ? `${cause.msg || message}${loc?.start ? ` (${loc.start.line}:${loc.start.column})` : ""}`
                          : message,
                        "error"
                      );
                    }
                  }}
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
          <StyledNotifications>
            {notifications.map(({ message, type }) => (
              <li key={`${type} ${message}`} className="notification">
                <figure>
                  {type === "error" && <ErrorIcon />}
                  {type === "warning" && <WarningIcon />}
                  {type === "info" && <InfoIcon />}
                  <figcaption>{message}</figcaption>
                </figure>
              </li>
            ))}
          </StyledNotifications>
        </>
      )}
    </StyledStatusBar>
  );
};

export default memo(StatusBar);
