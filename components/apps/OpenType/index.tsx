import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Font, type LocalizedName } from "opentype.js";
import StyledOpenType from "components/apps/OpenType/StyledOpenType";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useFileDrop from "components/system/Files/FileManager/useFileDrop";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { haltEvent } from "utils/functions";

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
  const canvas = <canvas ref={canvasRef} />;

  useEffect(() => {
    if (!font || !canvasRef.current) return;

    const viewSize = Math.ceil(fontSize * VISUAL_MODIFIER);
    const path = font.getPath(text || DEFAULT_MESSAGE, 0, viewSize, viewSize);
    const { x2, y2 } = path.getBoundingBox();

    canvasRef.current.setAttribute("height", `${Math.ceil(y2)}`);
    canvasRef.current.setAttribute("width", `${Math.ceil(x2)}`);

    path.draw(canvasRef.current.getContext("2d") as CanvasRenderingContext2D);
  }, [font, fontSize, text]);

  if (hideLabel) return canvas;

  return (
    <figure>
      <figcaption>{fontSize}</figcaption>
      {canvas}
    </figure>
  );
};

const MemoizedFontCanvas = memo(FontCanvas);

const OpenType: FC<ComponentProcessProps> = ({ id }) => {
  const {
    processes: { [id]: { url = "" } = {} } = {},
    title,
    url: setUrl,
  } = useProcesses();
  const { readFile } = useFileSystem();
  const [font, setFont] = useState<Font>();
  const loadFont = useCallback(
    async (fontUrl: string) => {
      const { default: openType } = await import("opentype.js");
      const { buffer } = await readFile(fontUrl);

      try {
        setFont(openType.parse(buffer));
      } catch {
        setUrl(id, "");
        setFont(undefined);
      }
    },
    [id, readFile, setUrl]
  );
  const { name, types, version } = useMemo(() => {
    const supportedTypes = [];

    if (font?.supported) supportedTypes.push("OpenType Layout");
    if (font?.outlinesFormat === "truetype") {
      supportedTypes.push("TrueType Outlines");
    }

    return {
      name: extractTextValue(font?.names.fullName),
      types: supportedTypes.join(", "),
      version: extractTextValue(font?.names.version),
    };
  }, [font]);

  useEffect(() => {
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
              <MemoizedFontCanvas
                font={font}
                fontSize={15}
                text={ALPHABETS}
                hideLabel
              />
            </li>
            <li>
              <MemoizedFontCanvas
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
                <MemoizedFontCanvas font={font} fontSize={size} />
              </li>
            ))}
          </ol>
        </>
      )}
    </StyledOpenType>
  );
};

export default memo(OpenType);
