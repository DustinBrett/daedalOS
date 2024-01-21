import { Fragment, memo, useEffect, useState } from "react";
import { type MediaType } from "mediainfo.js";
import Buttons from "components/system/Dialogs/Properties/Buttons";
import StyledDetailsTab from "components/system/Dialogs/Properties/StyledDetailsTab";
import { useFileSystem } from "contexts/fileSystem";
import { analyzeFileToObject } from "utils/mediainfo";

type TabProps = {
  fileDataRef: React.MutableRefObject<MediaType | undefined>;
  id: string;
  url?: string;
};

const FILTER_KEYS = new Set([
  "@type",
  "@typeorder",
  "DataSize",
  "extra",
  "FileSize",
  "ID",
  "StreamOrder",
  "UniqueID",
  "VideoCount",
]);

const withLeadingZero = (value: number): string =>
  value.toString().padStart(2, "0");

const maybeConvertValue = (key: string, value: number): string | number => {
  if (key === "Duration") {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value - hours * 3600) / 60);
    const seconds = Math.floor(value - hours * 3600 - minutes * 60);

    return `${withLeadingZero(hours)}:${withLeadingZero(minutes)}:${withLeadingZero(seconds)}`;
  }

  if (key === "OverallBitRate" || key === "BitRate") {
    return `${Math.floor(value / 1000)}kbps`;
  }

  if (key === "FrameRate") {
    return `${value} frames/second`;
  }

  return value;
};

const DetailsTab: FC<TabProps> = ({ fileDataRef, id, url }) => {
  const { readFile } = useFileSystem();
  const [fileData, setFileData] = useState<MediaType | undefined>(
    fileDataRef.current
  );
  const [loading, setLoading] = useState(!fileData);

  useEffect(() => {
    if (url && !fileData) {
      const done = (): void => setLoading(false);

      readFile(url)
        .then((buffer) =>
          analyzeFileToObject(buffer)
            .then((data) => {
              if (data) {
                // eslint-disable-next-line no-param-reassign
                fileDataRef.current = data;
                setFileData(data);
              }

              done();
            })
            .catch(done)
        )
        .catch(done);
    }
  }, [fileData, fileDataRef, readFile, url]);

  return (
    <>
      <StyledDetailsTab>
        <table>
          <thead>
            <tr>
              <th className="property">Property</th>
              <th className="value">Value</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="header">
                <td>Loading...</td>
              </tr>
            )}
            {fileData?.track?.map((track, trackIndex) => (
              <Fragment key={track.ID || trackIndex}>
                <tr className="header">
                  <th>{track["@type"]}</th>
                  <th className="line" />
                </tr>
                {(
                  [
                    ...Object.entries(track),
                    ...Object.entries(track.extra || {}),
                  ] as [string, string | number][]
                )
                  .filter(([key]) => !FILTER_KEYS.has(key))
                  .map(([key, value]) => (
                    <tr key={`${key}-${value}`}>
                      <th title={key}>{key}</th>
                      <td>{maybeConvertValue(key, value as number)}</td>
                    </tr>
                  ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </StyledDetailsTab>
      <Buttons id={id} />
    </>
  );
};

export default memo(DetailsTab);
