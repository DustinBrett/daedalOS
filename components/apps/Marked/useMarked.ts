import { basename } from "path";
import { useEffect } from "react";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess } from "contexts/process";
import { useLinkHandler } from "hooks/useLinkHandler";
import { loadFiles } from "utils/functions";

type MarkedOptions = {
  breaks?: boolean;
  headerIds?: boolean;
  mangle?: boolean;
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
  const { readFile } = useFileSystemActions();
  const { prependFileToTitle } = useTitle(id);
  const { libs = [] } = useProcess(id);
  const openLink = useLinkHandler();
  const getContainer = (): HTMLElement | null =>
    containerRef.current?.querySelector("article") as HTMLElement;
  const loadFile = async (): Promise<void> => {
    const markdownFile = await readFile(url);
    const container = getContainer();

    if (container instanceof HTMLElement) {
      container.classList.remove("drop");
      container.innerHTML = window.DOMPurify.sanitize(
        window.marked.parse(markdownFile.toString(), {
          headerIds: false,
          mangle: false,
        })
      );
      container
        .querySelectorAll("a")
        .forEach((link) =>
          link.addEventListener("click", (event) =>
            openLink(
              event,
              link.href || "",
              link.pathname,
              link.textContent || ""
            )
          )
        );
      container.scrollTop = 0;
    }

    prependFileToTitle(basename(url));
  };

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
    if (!loading) {
      if (url) loadFile();
      else getContainer()?.classList.add("drop");
    }
  }, [getContainer, loadFile, loading, url]);
};

export default useMarked;
