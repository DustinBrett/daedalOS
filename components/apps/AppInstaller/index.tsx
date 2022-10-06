import StyledWindow from "components/apps/AppInstaller/StyledWindow";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import type { Extension } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import directory from "contexts/process/directory";
import { useEffect, useState } from "react";

const AppInstaller: FC<ComponentProcessProps> = ({ id }) => {
  const { closeWithTransition, processes: { [id]: { url = "" } = {} } = {} } =
    useProcesses();
  const { createPath, exists, readFile, updateFolder, writeFile } =
    useFileSystem();
  const [loaded, setLoaded] = useState(false);
  const [appDescriptor, setAppDescriptor] = useState(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (url) {
      readFile(url).then((buffer) => {
        setLoaded(true);
        const appDescriptor = JSON.parse(buffer.toString());
        setAppDescriptor(appDescriptor);
      });
    }
  }, [readFile, setLoaded, setAppDescriptor, url]);

  useEffect(() => {
    if (!appDescriptor) return;
    if (!approved) return;
    installApplication(appDescriptor);
    // install complete
    setAppDescriptor(null);
    closeWithTransition(id);
  }, [approved, appDescriptor, closeWithTransition, id]);

  if (!loaded || !appDescriptor) {
    return (
      <StyledWindow>
        <StyledLoading className="loading" />;
      </StyledWindow>
    );
  }

  return (
    <StyledWindow className="app-installer-window">
      Do you want to install "{appDescriptor.directoryEntry.title}"...
      <pre>{appDescriptor.source}</pre>
      <button onClick={() => setApproved(true)}>Install</button>
    </StyledWindow>
  );
};

export default AppInstaller;

// consider creating a fsImport that imports from local fs
//   const code = 'export const foo = 123'
//   const imported = await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`)
//   console.log(imported.foo) // Should print 123
export function installApplication(appDescriptor: Record<string, any>) {
  const {
    directoryEntry,
    extensions: supportedExtensions,
    source,
  } = appDescriptor;

  const { title: appTitle } = directoryEntry;
  if (appTitle in directory) {
    throw new Error(`Application "${appTitle}" already installed`);
  }
  const component = eval(source);
  directory[appTitle] = {
    ...directoryEntry,
    Component: component,
  };
  supportedExtensions.forEach((ext: string) => {
    // add to existing extension
    if (ext in extensions) {
      extensions[ext].process.push(appTitle);
      return;
    }
    // add new extension
    const newExtension: Extension = {
      icon: "executable",
      process: [appTitle],
      type: "unknown",
    };
    extensions[ext] = newExtension;
  });
}
