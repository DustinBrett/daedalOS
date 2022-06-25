import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, dirname } from "path";
import { useEffect, useRef } from "react";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    DXBall: {
      close: () => void;
      init: (saveFunction: (name: string, score: string) => string) => void;
    };
  }
}

const libs = ["/Program Files/DX-Ball/game.js"];

const SAVE_PATH = "/Program Files/DX-Ball/dx-ball.sav";

const useDXBall = (
  id: string,
  _url: string,
  _containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { readFile, writeFile, updateFolder } = useFileSystem();
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { closing } = process;
  const records = useRef<string>();
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

      loadFiles(libs).then(() => {
        window.DXBall?.init((name, score) => {
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
        });

        setLoading(false);
      });
    }

    return () => {
      if (!libLoadingRef.current && closing) window.DXBall.close();
    };
  }, [closing, setLoading, updateFolder, writeFile]);
};

export default useDXBall;
