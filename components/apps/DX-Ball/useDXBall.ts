import { basename, dirname } from "path";
import { useEffect, useRef } from "react";
import { DX_BALL_GLOBALS, SAVE_PATH } from "components/apps/DX-Ball/constants";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { loadFiles } from "utils/functions";
import { cleanUpGlobals } from "utils/globals";

declare global {
  interface Window {
    DXBall: {
      close: () => void;
      init: (
        loadedFunction: () => void,
        saveFunction: (name: string, score: string) => string
      ) => void;
    };
  }
}

const useDXBall = ({ id, setLoading }: ContainerHookProps): void => {
  const { readFile, writeFile, updateFolder } = useFileSystem();
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { closing, libs = [] } = process || {};
  const records = useRef("");
  const libLoadingRef = useRef(true);

  useEffect(() => {
    readFile(SAVE_PATH)
      .then((data) => {
        records.current = data.toString();
      })
      .catch(() => {
        records.current = "";
      });
  }, [readFile]);

  useEffect(() => {
    if (libLoadingRef.current) {
      libLoadingRef.current = false;

      loadFiles(libs, undefined, true).then(() => {
        window.DXBall?.init(
          () => setLoading(false),
          (name, score) => {
            records.current = `${
              records.current ? `${records.current}\r` : ""
            }#&${score}&${name}`
              .split("\r")
              .map((record) => record.split("&"))
              .sort(([, scoreA], [, scoreB]) => Number(scoreB) - Number(scoreA))
              .map(
                ([, recordScore, recordName], index) =>
                  `${index}&${recordScore}&${recordName}`
              )
              .join("\r");

            writeFile(SAVE_PATH, records.current, true);
            updateFolder(dirname(SAVE_PATH), basename(SAVE_PATH));

            return `${records.current}\r`;
          }
        );
      });
    }
  }, [libs, setLoading, updateFolder, writeFile]);

  useEffect(
    () => () => {
      if (!libLoadingRef.current && closing) {
        window.DXBall.close();
        setTimeout(
          () => cleanUpGlobals(DX_BALL_GLOBALS),
          TRANSITIONS_IN_MILLISECONDS.WINDOW
        );
      }
    },
    [closing]
  );
};

export default useDXBall;
