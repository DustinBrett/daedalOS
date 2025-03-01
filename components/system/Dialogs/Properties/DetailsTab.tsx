import { Fragment, memo, useEffect, useMemo, useState } from "react";
import useExif from "components/system/Dialogs/Properties/useExif";
import useMediaType from "components/system/Dialogs/Properties/useMediaType";
import { type PropertiesMetaData } from "components/system/Dialogs/Properties";
import Buttons from "components/system/Dialogs/Properties/Buttons";
import StyledDetailsTab from "components/system/Dialogs/Properties/StyledDetailsTab";
import { useFileSystem } from "contexts/fileSystem";

type TabProps = {
  hasExif: boolean;
  id: string;
  metaData: PropertiesMetaData;
  setMetaData: React.Dispatch<React.SetStateAction<PropertiesMetaData>>;
  url?: string;
};

const DetailsTab: FC<TabProps> = ({
  hasExif,
  id,
  metaData,
  setMetaData,
  url,
}) => {
  const loading = useMemo(
    () => !(metaData.exif || metaData.mediaType),
    [metaData]
  );
  const { readFile } = useFileSystem();
  const [fileData, setFileData] = useState<Buffer | undefined>();

  useExif(hasExif ? fileData : undefined, metaData.exif, setMetaData);
  useMediaType(fileData, metaData.mediaType, setMetaData);

  useEffect(() => {
    if (loading && url && !fileData) readFile(url).then(setFileData);
  }, [fileData, loading, readFile, url]);

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
            {!loading &&
              Object.entries({ ...metaData.exif, ...metaData.mediaType }).map(
                ([key, data], index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Fragment key={`${key}${index}`}>
                    <tr className="header">
                      <th>{key}</th>
                      <th className="line" />
                    </tr>
                    {Object.entries(data)
                      .filter(
                        ([, value]) =>
                          typeof value === "string" || typeof value === "number"
                      )
                      .map(([dataKey, value]) => (
                        <tr key={`${dataKey}-${value}`}>
                          <th title={dataKey}>{dataKey}</th>
                          <td>
                            {typeof value === "string" &&
                            value.startsWith("blob:") ? (
                              <img
                                alt="Thumbnail"
                                decoding="async"
                                loading="lazy"
                                src={value}
                              />
                            ) : (
                              value
                            )}
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                )
              )}
          </tbody>
        </table>
      </StyledDetailsTab>
      <Buttons id={id} />
    </>
  );
};

export default memo(DetailsTab);
