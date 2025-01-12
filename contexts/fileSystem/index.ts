import contextFactory from "contexts/contextFactory";
import useFileSystemContextState from "contexts/fileSystem/useFileSystemContextState";

const { Provider, useContext } = contextFactory(useFileSystemContextState);

export { Provider as FileSystemProvider, useContext as useFileSystem };
