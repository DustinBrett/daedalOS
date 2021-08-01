import FileInput from "components/system/Files/FileManager/FileInput";
import type { FileSystemContextState } from "contexts/fileSystem/useFileSystemContextState";
import useFileSystemContextState from "contexts/fileSystem/useFileSystemContextState";
import contextFactory from "utils/contextFactory";

const { Consumer, Provider, useContext } =
  contextFactory<FileSystemContextState>(useFileSystemContextState, () => (
    <FileInput />
  ));

export {
  Consumer as FileSystemConsumer,
  Provider as FileSystemProvider,
  useContext as useFileSystem,
};
