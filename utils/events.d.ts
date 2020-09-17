export type FileDropEvents = {
  onDragLeave: (event: React.DragEvent) => void;
  onDragEnter: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
};
