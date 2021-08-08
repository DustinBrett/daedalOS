import { useSession } from "contexts/session";
import { useState } from "react";

type DraggableEntryProps = {
  draggable: boolean;
  dragging: boolean;
  onDragStart: React.DragEventHandler;
  onDragEnd: React.DragEventHandler;
};

type DraggableEntry = (file: string) => DraggableEntryProps;

const useDraggableEntries = (): DraggableEntry => {
  const { focusedEntries, blurEntry, focusEntry } = useSession();
  const [dragging, setDragging] = useState(false);
  const onDragStart = (file: string) => () => {
    setDragging(true);
    focusedEntries.forEach((focusedEntry) => blurEntry(focusedEntry));
    focusEntry(file);
  };
  const onDragEnd = () => setDragging(false);

  return (file: string) => ({
    draggable: true,
    dragging,
    onDragStart: onDragStart(file),
    onDragEnd,
  });
};

export default useDraggableEntries;
