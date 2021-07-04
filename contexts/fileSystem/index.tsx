import contextFactory from "contexts/contextFactory";
import type { FileSystemContextState } from "contexts/fileSystem/useFileSystemContextState";
import useFileSystemContextState from "contexts/fileSystem/useFileSystemContextState";

const { Consumer, Provider, useContext } =
  contextFactory<FileSystemContextState>(useFileSystemContextState);

export {
  Consumer as FileSystemConsumer,
  Provider as FileSystemProvider,
  useContext as useFileSystem,
};
