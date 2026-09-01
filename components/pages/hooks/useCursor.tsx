import { useState, useCallback, useEffect } from "react";
import { useFileSystemActions } from "contexts/fileSystem";
import { useCursorUrl } from "contexts/session";

export const useCursor = (): React.JSX.Element | undefined => {
  const { readFile } = useFileSystemActions();
  const [customCursor, setCustomCursor] = useState("");
  const cursor = useCursorUrl();
  const getCursor = useCallback(
    async (path: string) => {
      const [imageBuffer, { cursorToCss }] = await Promise.all([
        readFile(path),
        import("utils/imageDecoder"),
      ]);

      if (!imageBuffer?.length) return "";

      return cursorToCss(imageBuffer, path);
    },
    [readFile]
  );

  useEffect(() => {
    if (cursor) getCursor(cursor).then(setCustomCursor);
  }, [cursor, getCursor]);

  return customCursor ? <style>{customCursor}</style> : undefined;
};
