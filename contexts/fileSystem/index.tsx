import contextFactory from 'contexts/contextFactory';
import type { FileSystemContextState } from 'contexts/fileSystem/useFileSystemContextState';
import useFileSystemContextState from 'contexts/fileSystem/useFileSystemContextState';
import { initialFileSystemContextState } from 'contexts/initialContextStates';

const {
  Consumer,
  Provider,
  useContext
} = contextFactory<FileSystemContextState>(
  initialFileSystemContextState,
  useFileSystemContextState
);

export {
  Consumer as FileSystemConsumer,
  Provider as FileSystemProvider,
  useContext as useFileSystem
};
