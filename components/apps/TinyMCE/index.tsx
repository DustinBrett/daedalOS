import { Editor } from "@tinymce/tinymce-react";
import config from "components/apps/TinyMCE/config";
import { setReadOnlyMode } from "components/apps/TinyMCE/functions";
import StyledTinyMceEditor from "components/apps/TinyMCE/StyledTinyMceEditor";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { basename, extname } from "path";
import { useEffect, useState } from "react";
import type { Editor as EditorInstance } from "tinymce";
import { EMPTY_BUFFER } from "utils/constants";

const TinyMCE = ({ id }: ComponentProcessProps): JSX.Element => {
  const [editor, setEditor] = useState<EditorInstance>();
  const { appendFileToTitle } = useTitle(id);
  const { setForegroundId } = useSession();
  const { fs } = useFileSystem();
  const {
    processes: { [id]: { url = "" } = {} },
  } = useProcesses();
  const maybeMaintainFocus: React.FocusEventHandler = ({ relatedTarget }) => {
    if (
      relatedTarget instanceof HTMLElement &&
      document.body.querySelector(".tox-tinymce-aux")?.contains(relatedTarget)
    ) {
      setForegroundId(id);
    }
  };

  useEffect(() => {
    if (url && editor) {
      fs?.readFile(url, (error, contents = EMPTY_BUFFER) => {
        if (!error) {
          setReadOnlyMode(editor);
          editor.setContent(contents.toString());
          appendFileToTitle(basename(url, extname(url)));
        }
      });
    }

    return () => editor?.destroy();
  }, [appendFileToTitle, editor, fs, url]);

  return (
    <StyledTinyMceEditor onBlur={maybeMaintainFocus}>
      <Editor
        onInit={(_event, activeEditor) => setEditor(activeEditor)}
        {...config}
      />
    </StyledTinyMceEditor>
  );
};

export default TinyMCE;
