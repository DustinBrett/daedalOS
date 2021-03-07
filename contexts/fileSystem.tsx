import useFileSystemContextState from 'hooks/useFileSystemContextState';
import type { FileSystemContextState } from 'types/contexts/fileSystem';
import contextFactory from 'utils/contextFactory';
import { initialFileSystemContextState } from 'utils/initialContextStates';

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
