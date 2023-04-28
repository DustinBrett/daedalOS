/* eslint-disable */
// @ts-nocheck

function adler32(data) {
  let s1 = 0;
  let s2 = 0;
  for (const datum of data) {
    s1 = (s1 + datum) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  return [s2 >> 8, s2 & 0xff, s1 >> 8, s1 & 0xff];
}

function crc32(data) {
  const table = [];
  let crc = 0;
  for (let index = 0; index < 256; ++index) {
    crc = index;
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    table[index] = crc;
  }

  crc = -1;
  for (const datum of data) {
    crc = (crc >>> 8) ^ table[(crc ^ datum) & 0xff];
  }
  crc ^= -1;

  return [
    (crc >> 24) & 0xff,
    (crc >> 16) & 0xff,
    (crc >> 8) & 0xff,
    crc & 0xff,
  ];
}

function encode_png(canvas, width, channels) {
  const idat = [];
  const zlib = [0x78, 0x01];
  const len = 1 + width * channels;
  const nlen = len ^ 0xffff;
  for (let line_begin = 0; canvas.length != line_begin; line_begin += width) {
    const line_end = line_begin + width;
    zlib.push(
      line_end === canvas.length ? 0x01 : 0x00,
      len & 0xff,
      (len >> 8) & 0xff,
      nlen & 0xff,
      (nlen >> 8) & 0xff
    );

    idat.push(0x01);
    zlib.push(0x00);
    for (let position = line_begin; line_end !== position; ++position) {
      const pixel = canvas[position];
      idat.push((pixel >> 24) & 0xff);
      zlib.push((pixel >> 24) & 0xff);
      idat.push((pixel >> 16) & 0xff);
      zlib.push((pixel >> 16) & 0xff);
      idat.push((pixel >> 8) & 0xff);
      zlib.push((pixel >> 8) & 0xff);
      if (channels === 4) {
        idat.push(pixel & 0xff);
        zlib.push(pixel & 0xff);
      }
    }
  }

  const height = canvas.length / width;
  return [137, 80, 78, 71, 13, 10, 26, 10].concat(
    encode_png_chunk("IHDR", [
      (width >> 24) & 0xff,
      (width >> 16) & 0xff,
      (width >> 8) & 0xff,
      width & 0xff,
      (height >> 24) & 0xff,
      (height >> 16) & 0xff,
      (height >> 8) & 0xff,
      height & 0xff,
      8,
      channels === 3 ? 2 : 6,
      0,
      0,
      0,
    ]),
    encode_png_chunk("IDAT", zlib.concat(adler32(idat))),
    encode_png_chunk("IEND")
  );
}

function encode_png_chunk(tag, data = []) {
  const { length } = data;
  const content = [
    tag.charCodeAt(0),
    tag.charCodeAt(1),
    tag.charCodeAt(2),
    tag.charCodeAt(3),
  ].concat(data);
  return [
    (length >> 24) & 0xff,
    (length >> 16) & 0xff,
    (length >> 8) & 0xff,
    length & 0xff,
  ].concat(content, crc32(content));
}

function transcode_qoi_to_png(data) {
  if (
    data.length < 22 ||
    data[0] !== 0x71 ||
    data[1] !== 0x6f ||
    data[2] !== 0x69 ||
    data[3] !== 0x66
  ) {
    return;
  }
  const width = (data[4] << 24) | (data[5] << 16) | (data[6] << 8) | data[7];
  const channels = data[12];
  const colorspace = data[13];
  if (channels !== 3 && channels !== 4 && colorspace !== 1) {
    return;
  }

  const length = data.length - 8;
  const canvas = [];
  const map = Array.from({ length: 64 }).fill(0x00000000);
  let pixel = 0x000000ff;
  let position = 14;
  while (position < length) {
    const byte = data[position];
    const tag = byte >> 6;
    if (byte === 0xff) {
      // QOI_OP_RGBA
      const r = data[position + 1];
      const g = data[position + 2];
      const b = data[position + 3];
      const a = data[position + 4];
      position += 5;
      pixel = (r << 24) | (g << 16) | (b << 8) | a;
      map[(r * 3 + g * 5 + b * 7 + a * 11) % 64] = pixel;
      canvas.push(pixel);
    } else if (byte === 0xfe) {
      // QOI_OP_RGB
      const r = data[position + 1];
      const g = data[position + 2];
      const b = data[position + 3];
      const a = pixel & 0xff;
      position += 4;
      pixel = (r << 24) | (g << 16) | (b << 8) | a;
      map[(r * 3 + g * 5 + b * 7 + a * 11) % 64] = pixel;
      canvas.push(pixel);
    } else if (tag === 0x00) {
      // QOI_OP_INDEX
      if (
        data[position] === 0x00 &&
        data[position + 1] === 0x00 &&
        data[position + 2] === 0x00 &&
        data[position + 3] === 0x00 &&
        data[position + 4] === 0x00 &&
        data[position + 5] === 0x00 &&
        data[position + 6] === 0x00 &&
        data[position + 7] === 0x01
      ) {
        break;
      }
      position += 1;
      pixel = map[byte];
      canvas.push(pixel);
    } else if (tag === 0x01) {
      // QOI_OP_DIFF
      const dr = ((byte >> 4) & 0x03) - 2;
      const dg = ((byte >> 2) & 0x03) - 2;
      const db = (byte & 0x03) - 2;
      const r = (((pixel >> 24) & 0xff) + dr) & 0xff;
      const g = (((pixel >> 16) & 0xff) + dg) & 0xff;
      const b = (((pixel >> 8) & 0xff) + db) & 0xff;
      const a = pixel & 0xff;
      position += 1;
      pixel = (r << 24) | (g << 16) | (b << 8) | a;
      map[(r * 3 + g * 5 + b * 7 + a * 11) % 64] = pixel;
      canvas.push(pixel);
    } else if (tag === 0x02) {
      // QOI_OP_DIFF
      const byte_2 = data[position + 1];
      const dg = ((byte & 0x3f) - 32) & 0xff;
      const dr = (((byte_2 >> 4) & 0x0f) - 8 + dg) & 0xff;
      const db = ((byte_2 & 0x0f) - 8 + dg) & 0xff;
      const r = (((pixel >> 24) & 0xff) + dr) & 0xff;
      const g = (((pixel >> 16) & 0xff) + dg) & 0xff;
      const b = (((pixel >> 8) & 0xff) + db) & 0xff;
      const a = pixel & 0xff;
      position += 2;
      pixel = (r << 24) | (g << 16) | (b << 8) | a;
      map[(r * 3 + g * 5 + b * 7 + a * 11) % 64] = pixel;
      canvas.push(pixel);
    } else {
      // QOI_OP_RUN
      for (let count = (byte & 0x3f) + 1; count > 0; --count) {
        canvas.push(pixel);
      }
      position += 1;
    }
  }
  return encode_png(canvas, width, channels);
}

export const decodeQoi = (imgData) =>
  Buffer.from(new Uint8Array(transcode_qoi_to_png(new Uint8Array(imgData))));
