import type { RuntimeConfig } from "components/apps/NoodJs";
import Noodjs, { defaultRuntimeConfig } from "components/apps/NoodJs";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";
import { useZip } from "hooks/useFile";
import type { MessageEventHandler } from "hooks/usePostMessage";
import type { FC } from "react";
import { useCallback } from "react";
import endoRuntime from "./runtime.js.raw";

const { runtime: defaultRuntime } = defaultRuntimeConfig;

type RpcMessage = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  params: Record<string, any>;
  type: string;
};

type ModuleLookupMessage = RpcMessage & {
  params: {
    location: string;
  };
  type: "lookupModule";
};

const textDecoder = new TextDecoder();

const Browser: FC<ComponentProcessProps> = (props) => {
  const libs = ["https://npmfs.com/download/ses/0.18.4/dist/ses.cjs"];
  const runtime = `
    ${defaultRuntime}
    // lockdown()
    ${endoRuntime as string}
  `;

  const { id } = props;
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { url = "" } = process || {};

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
  const [unzippedFiles, zipError] = useZip(url);
  if (zipError) {
    throw zipError;
  }
  const compartmentMapRaw =
    unzippedFiles && unzippedFiles["/compartment-map.json"];
  const compartmentMap =
    compartmentMapRaw && textDecoder.decode(compartmentMapRaw);

  const onMessage = useCallback<MessageEventHandler>(
    (event, returnMessage) => {
      if (unzippedFiles === undefined) return;
      if (typeof event.data !== "object") return;
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
      if (typeof event.data.msg !== "object") return;
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
      const message = event.data.msg as RpcMessage;
      if (message.type === "lookupModule") {
        const { location } = (message as ModuleLookupMessage).params;
        const fileRaw = unzippedFiles[`/${location}`];
        const fileContent = fileRaw && textDecoder.decode(fileRaw);
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
        const result = JSON.parse(fileContent);
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
        returnMessage({ ...event.data, msg: { ...message, result } });
      }
    },
    [unzippedFiles]
  );

  /* eslint-disable-next-line unicorn/no-useless-undefined */
  if (!url) return undefined;
  /* eslint-disable-next-line unicorn/no-useless-undefined */
  if (!compartmentMap) return undefined;

  const runtimeConfig: RuntimeConfig = {
    libs,
    runtime,
    transformInputSource: (_source: string) => {
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
      `;
    },
  };

  return (
    <Noodjs {...props} onMessage={onMessage} runtimeConfig={runtimeConfig} />
  );
};

export default Browser;
