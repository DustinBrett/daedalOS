import contextFactory from "contexts/contextFactory";
import type { FileSystemContextState } from "contexts/fileSystem/useFileSystemContextState";
import useFileSystemContextState from "contexts/fileSystem/useFileSystemContextState";

const { Provider, useContext } = contextFactory<FileSystemContextState>(
  useFileSystemContextState
);

export { Provider as FileSystemProvider, useContext as useFileSystem };
