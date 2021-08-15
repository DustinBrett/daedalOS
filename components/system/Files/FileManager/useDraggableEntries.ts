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

const useDraggableEntries = (
  updateFiles: (appendFile?: string | undefined) => void
): DraggableEntry => {
  const { blurEntry, focusEntry } = useSession();
  const [dragging, setDragging] = useState(false);
  const onDragStart =
    (url: string, file: string): DragEventHandler =>
    (event) => {
      setDragging(true);
      blurEntry();
      focusEntry(file);
      event.dataTransfer.setData("text/plain", join(url, file));
      Object.assign(event.dataTransfer, { effectAllowed: "move" });
    };
  const onDragEnd = (): void => {
    setDragging(false);
    updateFiles();
  };

  return (url: string, file: string) => ({
    draggable: true,
    dragging,
    onDragStart: onDragStart(url, file),
    onDragEnd,
  });
};

export default useDraggableEntries;
