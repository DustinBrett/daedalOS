import type * as OpenTypeJs from "opentype.js";
import { type Font, type LocalizedName } from "opentype.js";
import { useEffect, useRef, useState } from "react";
import StyledOpenType from "components/apps/OpenType/StyledOpenType";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess, useProcessesActions } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { haltEvent } from "utils/functions";

const loadOpenType = (): Promise<{ default: typeof OpenTypeJs }> =>
  import("opentype.js");

type FontCanvasProps = {
  font?: Font;
  fontSize: number;
  hideLabel?: boolean;
  text?: string;
};

const DEFAULT_MESSAGE =
  "The quick brown fox jumps over the lazy dog. 1234567890";
const ALPHABETS = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS_SYMBOLS = "1234567890.:,; ' \" (!?) +-*/=";

const FONT_SIZES = [12, 18, 24, 36, 48, 60, 72];
const VISUAL_MODIFIER = 4 / 3;

const extractTextValue = (name?: LocalizedName): string =>
  name ? name.en || Object.values(name)[0] : "";

const FontCanvas: FC<FontCanvasProps> = ({
  font,
  fontSize,
  hideLabel,
  text,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const value = text || DEFAULT_MESSAGE;
  const canvas = <canvas ref={canvasRef} aria-label={value} role="img" />;

  useEffect(() => {
    if (!font || !canvasRef.current) return;

    const viewSize = Math.ceil(fontSize * VISUAL_MODIFIER);
    const path = font.getPath(value, 0, viewSize, viewSize);
    const { x2, y2 } = path.getBoundingBox();

    canvasRef.current.setAttribute("height", `${Math.ceil(y2)}`);
    canvasRef.current.setAttribute("width", `${Math.ceil(x2)}`);

    path.draw(canvasRef.current.getContext("2d") as CanvasRenderingContext2D);
  }, [font, fontSize, value]);

  if (hideLabel) return canvas;

  return (
    <figure>
      <figcaption>{fontSize}</figcaption>
      {canvas}
    </figure>
  );
};

const OpenType: FC<ComponentProcessProps> = ({ id }) => {
  const { title, url: setUrl } = useProcessesActions();
  const { url = "" } = useProcess(id);
  const { readFile } = useFileSystemActions();
  const [font, setFont] = useState<Font>();
  const loadFont = async (fontUrl: string): Promise<void> => {
    const [{ default: openType }, { buffer }] = await Promise.all([
      loadOpenType(),
      readFile(fontUrl),
    ]);

    try {
      setFont(openType.parse(buffer));
    } catch {
      setUrl(id, "");
      setFont(undefined);
    }
  };
  const name = extractTextValue(font?.names.fullName);
  const version = extractTextValue(font?.names.version);
  const supportedTypes = [];

  if (font?.supported) supportedTypes.push("OpenType Layout");
  if (font?.outlinesFormat === "truetype") {
    supportedTypes.push("TrueType Outlines");
  }

  const types = supportedTypes.join(", ");

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- False positive: state is only set after an await
    if (url) loadFont(url);
  }, [loadFont, url]);

  useEffect(
    () =>
      title(
        id,
        name
          ? `${name} (${processDirectory.OpenType.title})`
          : processDirectory.OpenType.title
      ),
    [id, name, title]
  );

  return (
    <StyledOpenType
      className={url ? "" : "drop"}
      {...useFileDrop({ id })}
      onContextMenuCapture={haltEvent}
    >
      {font && (
        <>
          <ol>
            <li>Font name: {name}</li>
            <li>Version: {version}</li>
            <li>{types}</li>
          </ol>
          <ol>
            <li>
              <FontCanvas
                font={font}
                fontSize={15}
                text={ALPHABETS}
                hideLabel
              />
            </li>
            <li>
              <FontCanvas
                font={font}
                fontSize={15}
                text={NUMBERS_SYMBOLS}
                hideLabel
              />
            </li>
          </ol>
          <ol>
            {FONT_SIZES.map((size) => (
              <li key={size}>
                <FontCanvas font={font} fontSize={size} />
              </li>
            ))}
          </ol>
        </>
      )}
    </StyledOpenType>
  );
};

export default OpenType;
