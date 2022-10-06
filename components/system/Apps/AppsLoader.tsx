import { installApplication } from "components/apps/AppInstaller";
import { useFileSystem } from "contexts/fileSystem";
import { ProcessConsumer } from "contexts/process";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const RenderComponent = dynamic(
  () => import("components/system/Apps/RenderComponent")
);

const AppsLoader: FC = () => {
  const appsInitialized = useRef(false);
  const {
    fs,
    readdir,
    readFile,
    stat,
  } = useFileSystem();

  useEffect(() => {
    if (!fs) return;
    console.log(fs);
    // run once
    if (appsInitialized.current) return;
    appsInitialized.current = true;
    // initialize apps
    console.log("files");
    (async function () {
      // find application directories
      const files = await readdir("/Applications");
      const applicationDirs = [];
      await Promise.all(
        files.map(async (file) => {
          const path = `/Applications/${file}`;
          const details = await stat(path);
          if (details.isDirectory()) {
            applicationDirs.push(path);
          }
          console.log(details);
        })
      );
      // install each application
      await Promise.all(
        applicationDirs.map(async (dir) => {
          const appManifestBuffer = await readFile(`${dir}/manifest.json`);
          const appManifest = JSON.parse(appManifestBuffer.toString());
          // TODO: installing here, the "open with" context menu doesn't populate
          try {
            installApplication(appManifest);
          } catch (e) {
            console.error(e);
          }
        })
      );
    })();
  }, [fs, readdir, readFile, stat]);

  return (
    <ProcessConsumer>
      {({ processes = {} }) => (
        <AnimatePresence initial={false} presenceAffectsLayout={false}>
          {Object.entries(processes).map(
            ([id, { closing, Component, hasWindow }]) =>
              id &&
              Component &&
              !closing && (
                <RenderComponent
                  key={id}
                  Component={Component}
                  hasWindow={hasWindow}
                  id={id}
                />
              )
          )}
        </AnimatePresence>
      )}
    </ProcessConsumer>
  );
};

export default AppsLoader;
