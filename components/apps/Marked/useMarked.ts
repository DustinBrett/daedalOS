import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { basename } from "path";
import { useCallback, useEffect } from "react";
import { loadFiles } from "utils/functions";

type MarkedOptions = {
  headerIds?: boolean;
};

declare global {
  interface Window {
    marked: {
      parse: (markdownString: string, options: MarkedOptions) => string;
    };
  }
}

const libs = ["/Program Files/Marked/marked.min.js"];

const useMarked = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const { readFile } = useFileSystem();
  const { prependFileToTitle } = useTitle(id);
  const loadFile = useCallback(async () => {
    const markdownFile = await readFile(url);
    const container = containerRef.current?.querySelector(
      "article"
    ) as HTMLElement;

    if (container instanceof HTMLElement) {
      container.innerHTML = window.marked.parse(markdownFile.toString(), {
        headerIds: false,
      });
    }

    prependFileToTitle(basename(url));
  }, [containerRef, prependFileToTitle, readFile, url]);

  useEffect(() => {
    if (loading) {
      loadFiles(libs).then(() => {
        if (window.marked) {
          setLoading(false);
        }
      });
    }
  }, [loading, setLoading]);

  useEffect(() => {
    if (!loading && url) loadFile();
  }, [loadFile, loading, url]);
};

export default useMarked;
