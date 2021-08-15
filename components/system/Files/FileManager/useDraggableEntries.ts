import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import { join } from "path";
import type { DragEventHandler } from "react";
import { useState } from "react";

type DraggableEntryProps = {
  draggable: boolean;
  dragging: boolean;
  onDragStart: React.DragEventHandler;
  onDragEnd: React.DragEventHandler;
};

type DraggableEntry = (url: string, file: string) => DraggableEntryProps;

const useDraggableEntries = (url: string): DraggableEntry => {
  const { updateFolder } = useFileSystem();
  const { blurEntry, focusEntry } = useSession();
  const [dragging, setDragging] = useState(false);
  const onDragStart =
    (entryUrl: string, file: string): DragEventHandler =>
    (event) => {
      setDragging(true);
      blurEntry();
      focusEntry(file);
      event.dataTransfer.setData("text/plain", join(entryUrl, file));
      Object.assign(event.dataTransfer, { effectAllowed: "move" });
    };
  const onDragEnd = (): void => {
    setDragging(false);
    updateFolder(url);
  };

  return (entryUrl: string, file: string) => ({
    draggable: true,
    dragging,
    onDragStart: onDragStart(entryUrl, file),
    onDragEnd,
  });
};

export default useDraggableEntries;
