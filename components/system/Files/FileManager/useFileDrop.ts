import {
  haltEvent,
  handleFileInputEvent,
} from "components/system/Files/FileManager/functions";

type FileDrop = {
  onDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
};

const useFileDrop = (
  newPath: (path: string, buffer?: Buffer) => void
): FileDrop => ({
  onDragOver: haltEvent,
  onDrop: (event) => handleFileInputEvent(event, newPath),
});

export default useFileDrop;
