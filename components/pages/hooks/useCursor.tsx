import { useEffect, useState } from "react";
import { useFileSystemActions } from "contexts/fileSystem";
import { useCursorUrl } from "contexts/session";
import { loadImageDecoder } from "utils/loaders";

export const useCursor = (): React.JSX.Element | undefined => {
  const { readFile } = useFileSystemActions();
  const [customCursor, setCustomCursor] = useState("");
  const cursor = useCursorUrl();
  const getCursor = async (path: string): Promise<string> => {
    const [imageBuffer, { cursorToCss }] = await Promise.all([
      readFile(path),
      loadImageDecoder(),
    ]);

    if (!imageBuffer?.length) return "";

    return cursorToCss(imageBuffer, path);
  };

  useEffect(() => {
    if (cursor) getCursor(cursor).then(setCustomCursor);
  }, [cursor, getCursor]);

  return customCursor ? <style>{customCursor}</style> : undefined;
};
