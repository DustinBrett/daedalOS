import type { RuntimeConfig } from "components/apps/NoodJs";
import Noodjs, { defaultRuntimeConfig } from "components/apps/NoodJs";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import { FC, useCallback, useEffect, useState } from "react";

import { useFileSystem } from "contexts/fileSystem";
import endoRuntime from "./runtime.js.raw";

import { getExtension } from "utils/functions";
import { unarchive, unzip } from "utils/zipFunctions";

const { runtime: defaultRuntime } = defaultRuntimeConfig;

const textDecoder = new TextDecoder();

const useFile = (path, shouldToString = false) => {
  const [fileContent, setFileContent] = useState(null)
  const { readFile } = useFileSystem();
  useEffect(() => {
    if (!path) return;
    (async () => {
      let fileContent = (await readFile(path));
      if (shouldToString) {
        fileContent = fileContent.toString();
      }
      setFileContent(fileContent)
    })();
  }, [path, readFile])
  return fileContent;
}

const useZip = (path) => {
  const zipContent = useFile(path);
  const [unzippedFiles, setUnzippedFiles] = useState(null);
  
  useEffect(() => {
    if (!zipContent) return;
    (async () => {
      const unzippedFiles = [".jsdos", ".wsz", ".zip"].includes(
        getExtension(path)
      )
        ? await unzip(zipContent)
        : await unarchive(path, zipContent);
      setUnzippedFiles(unzippedFiles);
    })();
  }, [path, zipContent]);

  return unzippedFiles;
}

const useZipPath = (zipPath, innerPath, shouldToString = false) => {
  const unzippedFiles = useZip(zipPath);
  if (!unzippedFiles) return null;
  let fileContent = unzippedFiles[innerPath];
  if (shouldToString) {
    return textDecoder.decode(fileContent);
  }
  return fileContent;
}



const Browser: FC<ComponentProcessProps> = (props) => {
  const libs = [
    "https://npmfs.com/download/ses/0.18.4/dist/ses.cjs",
  ]
  const runtime = `
    ${defaultRuntime}
    // lockdown()
    ${endoRuntime}
  `

  const { id } = props;
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { url = "" } = process || {};
  
  const unzippedFiles = useZip(url);
  // const compartmentMap = useZipPath(url, '/compartment-map.json', true)
  const compartmentMapRaw = unzippedFiles && unzippedFiles['/compartment-map.json'];
  const compartmentMap = compartmentMapRaw && textDecoder.decode(compartmentMapRaw);

  const onMessage = useCallback(async (event, returnMessage) => {
    if (unzippedFiles === null) return;
    if (typeof event !== 'object') return;
    if (typeof event.data !== 'object') return;
    if (typeof event.data.msg !== 'object') return;
    const message = event.data.msg;
    if (message.type === 'lookupModule') {
      const { location } = message.params
      console.log('outside lookupModule', location)
      const fileRaw = unzippedFiles[`/${location}`]
      const fileContent = fileRaw && textDecoder.decode(fileRaw)
      const module = JSON.parse(fileContent)
      console.log('outside lookupModule', location, module)
      returnMessage({ ...event.data, msg: { ...message, result: module }})
    }
  }, [unzippedFiles])
  
  const runtimeConfig: RuntimeConfig = {
    libs,
    runtime,
    transformInputSource: (source: string) => {
      return `
        let nextId = 0;
        const send = (msg) => {
          const id = nextId++;
          window.parent.postMessage({ id, msg }, '*')
          return new Promise((resolve) => {
            const listener = ({ data }) => {
              if (data.id === id) {
                if (msg === data.msg) console.log('send: msg === data.msg')
                globalThis.removeEventListener('message', listener);
                resolve(data.msg);
              }
            };
            globalThis.addEventListener('message', listener);
          })
        };

        const compartmentMap = ${compartmentMap};
        
        const lookupModule = async (location) => {
          console.log('inside lookupModule:', location)
          const { result } = await send({ type: 'lookupModule', params: { location } })
          console.log('inside lookupModule result:', result)
          return result
        }
        const archiveLocation = '(archive location)'

        console.log('loading...')
        const { execute } = Endo.loadApplication(
          compartmentMap,
          lookupModule,
          archiveLocation,
        )
        console.log('executing...')
        execute();
      `
    },
  }

  if (!url) return null;
  if (!compartmentMap) return null;
  // if (!files) return null;

  return (
    <Noodjs {...props} runtimeConfig={runtimeConfig} onMessage={onMessage} />
  )
};

export default Browser;
