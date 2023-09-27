import type { ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useCallback, useEffect } from "react";
import { haltEvent, isYouTubeUrl, loadFiles } from "utils/functions";

type MarkedOptions = {
  headerIds?: boolean;
};

declare global {
  interface Window {
    DOMPurify: {
      sanitize: (text: string) => string;
    };
    marked: {
      parse: (markdownString: string, options: MarkedOptions) => string;
    };
  }
}

const useMarked = ({
  containerRef,
  id,
  loading,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { readFile } = useFileSystem();
  const { prependFileToTitle } = useTitle(id);
  const { open, processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();
  const loadFile = useCallback(async () => {
    const markdownFile = await readFile(url);
    const container = containerRef.current?.querySelector(
      "article"
    ) as HTMLElement;

    if (container instanceof HTMLElement) {
      container.innerHTML = window.DOMPurify.sanitize(
        window.marked.parse(markdownFile.toString(), {
          headerIds: false,
        })
      );
      container.querySelectorAll("a").forEach((link) =>
        link.addEventListener("click", (event) => {
          haltEvent(event);

          if (isYouTubeUrl(link.href)) {
            open("VideoPlayer", { url: link.href });
          } else {
            window.open(link.href, "_blank", "noopener, noreferrer");
          }
        })
      );
      container.scrollTop = 0;
    }

    prependFileToTitle(basename(url));
  }, [containerRef, open, prependFileToTitle, readFile, url]);

  useEffect(() => {
    if (loading) {
      loadFiles(libs).then(() => {
        if (window.marked) {
          setLoading(false);
        }
      });
    }
  }, [libs, loading, setLoading]);

  useEffect(() => {
    if (!loading && url) loadFile();
  }, [loadFile, loading, url]);
};

export default useMarked;
