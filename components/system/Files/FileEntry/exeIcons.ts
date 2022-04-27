import type {
  IconGroupEntry,
  IconGroupItem,
  ResourceEntry,
} from "resedit/dist/resource";

const RESERVED = 0;
const ICON_TYPE = {
  CUR: 2,
  ICO: 1,
};

const createIconHeader = (iconCount: number): Uint8Array =>
  Uint8Array.from([
    RESERVED,
    RESERVED,
    ICON_TYPE.ICO,
    RESERVED,
    iconCount,
    RESERVED,
  ]);

const createIconDirEntry = (
  { bitCount, colors, dataSize, height, planes, width }: IconGroupItem,
  offset: number
): Uint8Array =>
  Uint8Array.from([
    width,
    height,
    colors,
    RESERVED,
    planes,
    RESERVED,
    bitCount,
    RESERVED,
    ...new Uint8Array(Uint32Array.from([dataSize]).buffer),
    ...new Uint8Array(Uint32Array.from([offset]).buffer),
  ]);

const ICONDIR_LENGTH = 6;
const ICONDIRENTRY_LENGTH = 16;

export const createIcon = (
  iconGroupEntry: IconGroupEntry,
  resourceEntries: ResourceEntry[]
): Uint8Array => {
  const iconDataOffset =
    ICONDIR_LENGTH + ICONDIRENTRY_LENGTH * iconGroupEntry.icons.length;
  let currentIconOffset = iconDataOffset;
  const iconData = iconGroupEntry.icons.map((iconItem) =>
    resourceEntries.find(
      (entry) => entry.type === 3 && entry.id === iconItem.iconID
    )
  );
  const iconHeader = iconGroupEntry.icons.reduce(
    (accHeader, iconBitmapInfo, index) => {
      currentIconOffset += index ? iconData[index - 1]?.bin.byteLength ?? 0 : 0;

      return Buffer.concat([
        accHeader,
        createIconDirEntry(iconBitmapInfo, currentIconOffset),
      ]);
    },
    createIconHeader(iconGroupEntry.icons.length)
  );

  return iconData.reduce(
    (accIcon, iconItem) =>
      Buffer.concat([accIcon, Buffer.from((iconItem as ResourceEntry).bin)]),
    iconHeader
  );
};
