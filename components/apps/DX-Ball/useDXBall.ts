import { useFileSystem } from "contexts/fileSystem";
import { basename, dirname } from "path";
import { useEffect, useRef } from "react";
import { loadFiles } from "utils/functions";

declare global {
  interface Window {
    DXBall: {
      init: (saveFunction: (name: string, score: string) => string) => void;
    };
  }
}

const libs = ["/Program Files/DX-Ball/game.js"];

const SAVE_PATH = "/Program Files/DX-Ball/dx-ball.sav";

const useDXBall = (
  _id: string,
  _url: string,
  _containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { readFile, writeFile, updateFolder } = useFileSystem();
  const records = useRef<string>();

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
    if (window.DXBall) return;

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
  }, [setLoading, updateFolder, writeFile]);
};

export default useDXBall;
