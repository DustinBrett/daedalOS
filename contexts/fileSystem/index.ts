import contextActionSelectorFactory from "contexts/contextActionSelectorFactory";
import useFileSystemContextState, {
  type FileSystemContextState,
} from "contexts/fileSystem/useFileSystemContextState";

const { Provider, useContextActions, useStateSelector } =
  contextActionSelectorFactory(useFileSystemContextState);

export const useFs = (): FileSystemContextState["fs"] =>
  useStateSelector((state) => state.fs);

export const usePasteList = (): FileSystemContextState["pasteList"] =>
  useStateSelector((state) => state.pasteList);

export const useRootFs = (): FileSystemContextState["rootFs"] =>
  useStateSelector((state) => state.rootFs);

export {
  Provider as FileSystemProvider,
  useContextActions as useFileSystemActions,
};
