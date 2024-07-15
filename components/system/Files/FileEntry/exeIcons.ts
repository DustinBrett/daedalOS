import {
  type IconGroupEntry,
  type IconGroupItem,
  type ResourceEntry,
} from "resedit/dist/resource";

const RESERVED = 0;
const ICON_TYPE = {
  ICO: 1,
};

const createIconHeader = (iconCount: number): Uint8Array =>
  Uint8Array.from([
    RESERVED,
    RESERVED,
    ...new Uint8Array(Uint16Array.from([ICON_TYPE.ICO]).buffer),
    ...new Uint8Array(Uint16Array.from([iconCount]).buffer),
  ]);

const createIconDirEntry = (
  { bitCount, colors, dataSize, height, planes, width }: IconGroupItem,
  offset: number
): Uint8Array =>
  Uint8Array.from([
    width,
    height === width * 2 ? width : height,
    colors,
    RESERVED,
    ...new Uint8Array(Uint16Array.from([planes]).buffer),
    ...new Uint8Array(Uint16Array.from([bitCount]).buffer),
    ...new Uint8Array(Uint32Array.from([dataSize]).buffer),
    ...new Uint8Array(Uint32Array.from([offset]).buffer),
  ]);

const ICONDIR_LENGTH = 6;
const ICONDIRENTRY_LENGTH = 16;
const RC_ICON = 3;

let lockIconExtraction = false;

export const extractExeIcon = async (
  exeData: Buffer
): Promise<Buffer | undefined> => {
  if (lockIconExtraction) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => extractExeIcon(exeData).then(resolve));
    });
  }

  lockIconExtraction = true;

  const ResEdit = await import("resedit");
  let iconGroupEntry: IconGroupEntry;
  let entries: ResourceEntry[];

  try {
    ({ entries } = ResEdit.NtExecutableResource.from(
      ResEdit.NtExecutable.from(exeData, {
        ignoreCert: true,
      }),
      true
    ));
    [iconGroupEntry] = ResEdit.Resource.IconGroupEntry.fromEntries(entries);
  } catch (error) {
    if (
      (error as Error).message.includes(
        "Binary with symbols is not supported now"
      )
    ) {
      const { unarchive } = await import("utils/zipFunctions");

      try {
        const { "/.rsrc/ICON/1.ico": icon } =
          (await unarchive("data.exe", exeData)) || {};
        const iconBuffer = Buffer.from(icon);

        lockIconExtraction = false;

        return iconBuffer;
      } catch {
        // Ignore error extracting EXE
      }
    }

    return undefined;
  }

  if (!iconGroupEntry?.icons) {
    lockIconExtraction = false;

    return undefined;
  }

  const iconDataOffset =
    ICONDIR_LENGTH + ICONDIRENTRY_LENGTH * iconGroupEntry.icons.length;
  let currentIconOffset = iconDataOffset;
  const iconData = iconGroupEntry.icons.map(({ iconID }) =>
    entries.find(({ id, type }) => type === RC_ICON && id === iconID)
  );
  const iconHeader = iconGroupEntry.icons.reduce(
    (accHeader, iconBitmapInfo, index) => {
      currentIconOffset += index
        ? (iconData[index - 1]?.bin.byteLength ?? 0)
        : 0;

      return Buffer.concat([
        accHeader,
        createIconDirEntry(iconBitmapInfo, currentIconOffset),
      ]);
    },
    createIconHeader(iconGroupEntry.icons.length)
  );

  const combinedIconBuffer = Buffer.from(
    iconData.reduce(
      (accIcon, iconItem) =>
        Buffer.concat([accIcon, Buffer.from((iconItem as ResourceEntry).bin)]),
      iconHeader
    )
  );

  lockIconExtraction = false;

  return combinedIconBuffer;
};
