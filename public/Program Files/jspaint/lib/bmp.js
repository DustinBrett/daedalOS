/**
 * Based on: https://github.com/shaozilee/bmp-js/blob/db2c466ca1869ddc09e4b2143404eb03ecd490db/lib/encoder.js
 * @author shaozilee
 * @author 1j01
 * @license MIT
 *
 * BMP format encoder, encodes 24bit, 8bit, 4bit, and 1bit BMP files.
 * Doesn't support compression.
 *
 */

function encodeBMP(imgData, bitsPerPixel = 24) {
	if (![1, 4, 8, 24/*, 32*/].includes(bitsPerPixel)) {
		throw new Error(`not supported: ${bitsPerPixel} bits per pixel`)
	}
	const bytesPerPixel = bitsPerPixel / 8; // can be more or less than one
	// Rows are always a multiple of 4 bytes long.
	const pixelRowSize = Math.ceil(imgData.width * bytesPerPixel / 4) * 4;
	const pixelDataSize = imgData.height * pixelRowSize;
	const headerInfoSize = 40;
	const indexed = bitsPerPixel <= 8;
	const maxColorCount = 2 ** bitsPerPixel;

	let rgbTable;
	let indices;
	let colorCount = 0;
	if (indexed) {
		// rgbTable = [];
		// for (const color of palette.slice(0, maxColorCount)) {
		// 	const [r, g, b] = get_rgba_from_color(color);
		// 	rgbTable.push([r, g, b]);
		// }
		const res = UPNG.quantize(imgData.data, maxColorCount);
		indices = res.inds;
		rgbTable = res.plte.map((color_entry) => color_entry.est.q.map((component) => Math.round(component * 255)));
		colorCount = rgbTable.length;
	}

	const flag = "BM";
	const planes = 1;
	const compressionType = 0;// bitsPerPixel === 32 ? 3 : 0
	const hr = 0;
	const vr = 0;
	const importantColorCount = 0; // 0 means all colors are important

	const colorTableSize = colorCount * 4;
	const offsetToPixelData = 54 + colorTableSize;
	const fileSize = pixelDataSize + offsetToPixelData;

	const fileArrayBuffer = new ArrayBuffer(fileSize);
	const view = new DataView(fileArrayBuffer);
	let pos = 0;
	// BMP header
	view.setUint8(pos, flag.charCodeAt(0)); pos += 1;
	view.setUint8(pos, flag.charCodeAt(1)); pos += 1;
	view.setUint32(pos, fileSize, true); pos += 4;
	pos += 4; // reserved / application-specific
	view.setUint32(pos, offsetToPixelData, true); pos += 4;
	// DIB header
	view.setUint32(pos, headerInfoSize, true); pos += 4;
	view.setInt32(pos, imgData.width, true); pos += 4;
	view.setInt32(pos, -imgData.height, true); pos += 4; // negative indicates rows are stored top to bottom
	view.setUint16(pos, planes, true); pos += 2;
	view.setUint16(pos, bitsPerPixel, true); pos += 2;
	view.setUint32(pos, compressionType, true); pos += 4;
	view.setUint32(pos, pixelDataSize, true); pos += 4;
	view.setInt32(pos, hr, true); pos += 4;
	view.setInt32(pos, vr, true); pos += 4;
	view.setUint32(pos, colorCount, true); pos += 4;
	view.setUint32(pos, importantColorCount, true); pos += 4;

	if (rgbTable) {
		for (const [r, g, b] of rgbTable) {
			view.setUint8(pos, b); pos += 1;
			view.setUint8(pos, g); pos += 1;
			view.setUint8(pos, r); pos += 1;
			pos += 1;
		}
	}

	const getColorIndex = (imgDataIndex) => {
		return indices[imgDataIndex / 4];
	};

	let i = 0;
	for (let y = 0; y < imgData.height; y += 1) {
		for (let x = 0; x < imgData.width;) {
			const pixelGroupPos = pos + y * pixelRowSize + x * bytesPerPixel;
			if (bitsPerPixel === 1) {
				let byte = 0;
				for (let j = 0; j < 8 && x + j < imgData.width; j += 1) {
					byte |= getColorIndex(i) << (7 - j);
					i += 4;
				}
				view.setUint8(pixelGroupPos, byte);
				x += 8;
			} else if (bitsPerPixel === 4) {
				let byte = 0;
				for (let j = 0; j < 2 && x + j < imgData.width; j += 1) {
					byte |= getColorIndex(i) << (4 * (1 - j));
					i += 4;
				}
				view.setUint8(pixelGroupPos, byte);
				x += 2;
			} else if (bitsPerPixel === 8) {
				view.setUint8(pixelGroupPos, getColorIndex(i));
				i += 4;
				x += 1;
			} else {
				view.setUint8(pixelGroupPos + 2, imgData.data[i + 0]); // red
				view.setUint8(pixelGroupPos + 1, imgData.data[i + 1]); // green
				view.setUint8(pixelGroupPos + 0, imgData.data[i + 2]); // blue
				// if (bitsPerPixel === 32) {
				// 	view.setUint8(pixelGroupPos + 3, imgData.data[i + 3]); // alpha
				// }
				i += 4;
				x += 1;
			}
		}
	}

	return view.buffer;
}

/**
 * Based on https://github.com/ericandrewlewis/bitmap-js/blob/c33a6137829b18e3420a763ef20bffae874610b3/index.js
 * @author ericandrewlewis
 * @license MIT
 */
/*
function decodeBMP(arrayBuffer) {
	function readBitmapFileHeader(view) {
		if (view.getUint8(0) !== "B".charCodeAt(0) || view.getUint8(1) !== "M".charCodeAt(0)) {
			throw new Error("not a BMP file"); // Note: exact error message is checked for to detect this case
		}
		return {
			filesize: view.getUint32(2, true),
			imageDataOffset: view.getUint32(10, true)
		};
	}

	const dibHeaderLengthToVersionMap = {
		12: "BITMAPCOREHEADER",
		16: "OS22XBITMAPHEADER",
		40: "BITMAPINFOHEADER",
		52: "BITMAPV2INFOHEADER",
		56: "BITMAPV3INFOHEADER",
		64: "OS22XBITMAPHEADER",
		108: "BITMAPV4HEADER",
		124: "BITMAPV5HEADER"
	};

	function readDibHeader(view) {
		const dibHeaderLength = view.getUint32(14, true);
		const header = {};
		header.headerLength = dibHeaderLength;
		header.headerType = dibHeaderLengthToVersionMap[dibHeaderLength];
		header.width = view.getInt32(18, true);
		header.height = view.getInt32(22, true); // Note: negative is used to mean rows go top to bottom instead of bottom to top
		if (header.headerType == "BITMAPCOREHEADER") {
			return header;
		}
		header.bitsPerPixel = view.getUint16(28, true);
		header.compressionType = view.getUint32(30, true);
		if (header.headerType == "OS22XBITMAPHEADER") {
			return header;
		}
		header.bitmapDataSize = view.getUint32(34, true);
		header.numberOfColorsInPalette = view.getUint32(46, true);
		header.numberOfImportantColors = view.getUint32(50, true);
		if (header.headerType == "BITMAPINFOHEADER") {
			return header;
		}
		// There are more data fields in later versions of the dib header.
		// I hear that BITMAPINFOHEADER is the most widely supported
		// header type, so I'm not going to implement them yet.
		return header;
	}

	function readColorTable(view) {
		const dibHeader = readDibHeader(view);
		const colorTable = [];
		const sourceStart = 14 + dibHeader.headerLength;
		const numberOfColorsInPalette = dibHeader.numberOfColorsInPalette || (dibHeader.bitsPerPixel <= 8 ? 2 ** dibHeader.bitsPerPixel : 0);
		for (let i = 0; i < numberOfColorsInPalette; i += 1) {
			colorTable.push({
				r: view.getUint8(sourceStart + i * 4 + 2),
				g: view.getUint8(sourceStart + i * 4 + 1),
				b: view.getUint8(sourceStart + i * 4 + 0),
			});
		}
		return colorTable;
	}

	const view = new DataView(arrayBuffer);
	const fileHeader = readBitmapFileHeader(view);
	const dibHeader = readDibHeader(view);
	// const imageDataLength = dibHeader.bitmapDataSize;
	// const imageDataOffset = fileHeader.imageDataOffset;
	const colorTable = readColorTable(view);
	// view.copy(imageData, 0, imageDataOffset);
	const width = Math.abs(fileHeader.width);
	const height = Math.abs(fileHeader.height); // negative is used to mean rows go top to bottom instead of bottom to top
	// const imageData = new ImageData(width, height);
	// const pixelRowSize = Math.ceil(width * dibHeader.bitsPerPixel / 8 / 4) * 4;
	// for (let y = 0; y < height; y += 1) {
	// 	for (let x = 0; x < width; x += 1) {
	// 		const byte = view.readUint8(y * pixelRowSize + x * dibHeader.bitsPerPixel / 8);
	// 		imageData.data[y * height * 4 + 0,1,2,3] = ...;
	// 	}
	// }
	return {
		// width,
		// height,
		// fileHeader,
		// dibHeader,
		// imageData,
		colorTable,
		bitsPerPixel: dibHeader.bitsPerPixel,
	};
}
*/

function decodeBMP(arrayBuffer) {
	const decoder = new BmpDecoder(arrayBuffer, {toRGBA: true});
	return {
		bitsPerPixel: decoder.bitsPerPixel,
		colorTable: decoder.palette ? decoder.palette.map(({red, green, blue})=> ({r: red, g: green, b: blue})) : [],
		imageData: new ImageData(decoder.data, decoder.width, decoder.height),
	};
}

/**
 * Based on: https://github.com/hipstersmoothie/bmp-ts
 * @license MIT
 */

const HeaderTypes = {};
HeaderTypes[HeaderTypes["BITMAP_INFO_HEADER"] = 40] = "BITMAP_INFO_HEADER";
HeaderTypes[HeaderTypes["BITMAP_V2_INFO_HEADER"] = 52] = "BITMAP_V2_INFO_HEADER";
HeaderTypes[HeaderTypes["BITMAP_V3_INFO_HEADER"] = 56] = "BITMAP_V3_INFO_HEADER";
HeaderTypes[HeaderTypes["BITMAP_V4_HEADER"] = 108] = "BITMAP_V4_HEADER";
HeaderTypes[HeaderTypes["BITMAP_V5_HEADER"] = 124] = "BITMAP_V5_HEADER";
Object.freeze(HeaderTypes);

// We have these:
//
// const sample = 0101 0101 0101 0101
// const mask   = 0111 1100 0000 0000
// 256        === 0000 0001 0000 0000
//
// We want to take the sample and turn it into an 8-bit value.
//
// 1. We extract the last bit of the mask:
//
// 0000 0100 0000 0000
//       ^
//
// Like so:
//
// const a = ~mask =    1000 0011 1111 1111
// const b = a + 1 =    1000 0100 0000 0000
// const c = b & mask = 0000 0100 0000 0000
//
// 2. We shift it to the right and extract the bit before the first:
//
// 0000 0000 0010 0000
//             ^
//
// Like so:
//
// const d = mask / c = 0000 0000 0001 1111
// const e = mask + 1 = 0000 0000 0010 0000
//
// 3. We apply the mask and the two values above to a sample:
//
// const f = sample & mask = 0101 0100 0000 0000
// const g = f / c =         0000 0000 0001 0101
// const h = 256 / e =       0000 0000 0000 0100
// const i = g * h =         0000 0000 1010 1000
//                                     ^^^^ ^
//
// Voila, we have extracted a sample and "stretched" it to 8 bits. For samples
// which are already 8-bit, h === 1 and g === i.
function maskColor(maskRed, maskGreen, maskBlue, maskAlpha) {
    const maskRedR = (~maskRed + 1) & maskRed;
    const maskGreenR = (~maskGreen + 1) & maskGreen;
    const maskBlueR = (~maskBlue + 1) & maskBlue;
    const maskAlphaR = (~maskAlpha + 1) & maskAlpha;
    const shiftedMaskRedL = maskRed / maskRedR + 1;
    const shiftedMaskGreenL = maskGreen / maskGreenR + 1;
    const shiftedMaskBlueL = maskBlue / maskBlueR + 1;
    const shiftedMaskAlphaL = maskAlpha / maskAlphaR + 1;
    return {
        shiftRed: (x) => (((x & maskRed) / maskRedR) * 0x100) / shiftedMaskRedL,
        shiftGreen: (x) => (((x & maskGreen) / maskGreenR) * 0x100) / shiftedMaskGreenL,
        shiftBlue: (x) => (((x & maskBlue) / maskBlueR) * 0x100) / shiftedMaskBlueL,
        shiftAlpha: maskAlpha !== 0
            ? (x) => (((x & maskAlpha) / maskAlphaR) * 0x100) / shiftedMaskAlphaL
            : () => 255
    };
}
class BmpDecoder {
	constructor(arrayBuffer, { toRGBA } = { toRGBA: false }) {
		this.view = new DataView(arrayBuffer);
		this.toRGBA = !!toRGBA;
		this.pos = 0;
		this.bottomUp = true;
		this.flag = String.fromCharCode(this.view.getUint8(0)) + String.fromCharCode(this.view.getUint8(1));
		this.pos += 2;
		if (this.flag !== 'BM') {
			throw new Error('Invalid BMP File');
		}
		this.locRed = this.toRGBA ? 0 : 3;
		this.locGreen = this.toRGBA ? 1 : 2;
		this.locBlue = this.toRGBA ? 2 : 1;
		this.locAlpha = this.toRGBA ? 3 : 0;
		this.parseHeader();
		this.parseRGBA();
	}
	parseHeader() {
		this.fileSize = this.view.getUint32(this.pos, true); this.pos += 4;
		this.reserved1 = this.view.getUint16(this.pos, true); this.pos += 2;
		this.reserved2 = this.view.getUint16(this.pos, true); this.pos += 2;
		this.offset = this.view.getUint32(this.pos, true); this.pos += 4;
		// End of BITMAP_FILE_HEADER
		this.headerSize = this.view.getUint32(this.pos, true); this.pos += 4;
		if (!(this.headerSize in HeaderTypes)) {
			throw new Error(`Unsupported BMP header size ${this.headerSize}`);
		}
		this.width = this.view.getInt32(this.pos, true); this.pos += 4;
		this.height = this.view.getInt32(this.pos, true); this.pos += 4;
		if (this.height < 0) {
			this.height *= -1;
			this.bottomUp = false;
		}
		this.planes = this.view.getUint16(this.pos, true); this.pos += 2;
		this.bitsPerPixel = this.view.getUint16(this.pos, true); this.pos += 2;
		this.compression = this.view.getUint32(this.pos, true); this.pos += 4;
		this.rawSize = this.view.getUint32(this.pos, true); this.pos += 4;
		this.hr = this.view.getInt32(this.pos, true); this.pos += 4;
		this.vr = this.view.getInt32(this.pos, true); this.pos += 4;
		this.colors = this.view.getUint32(this.pos, true); this.pos += 4;
		this.importantColors = this.view.getUint32(this.pos, true); this.pos += 4;
		// De facto defaults
		if (this.bitsPerPixel === 32) {
			this.maskAlpha = 0;
			this.maskRed = 0x00ff0000;
			this.maskGreen = 0x0000ff00;
			this.maskBlue = 0x000000ff;
		}
		else if (this.bitsPerPixel === 16) {
			this.maskAlpha = 0;
			this.maskRed = 0x7c00;
			this.maskGreen = 0x03e0;
			this.maskBlue = 0x001f;
		}
		// End of BITMAP_INFO_HEADER
		if (this.headerSize > HeaderTypes.BITMAP_INFO_HEADER ||
			this.compression === 3 /* BI_BIT_FIELDS */ ||
			this.compression === 6 /* BI_ALPHA_BIT_FIELDS */) {
			this.maskRed = this.view.getUint32(this.pos, true); this.pos += 4;
			this.maskGreen = this.view.getUint32(this.pos, true); this.pos += 4;
			this.maskBlue = this.view.getUint32(this.pos, true); this.pos += 4;
		}
		// End of BITMAP_V2_INFO_HEADER
		if (this.headerSize > HeaderTypes.BITMAP_V2_INFO_HEADER ||
			this.compression === 6 /* BI_ALPHA_BIT_FIELDS */) {
			this.maskAlpha = this.view.getUint32(this.pos, true); this.pos += 4;
		}
		// End of BITMAP_V3_INFO_HEADER
		if (this.headerSize > HeaderTypes.BITMAP_V3_INFO_HEADER) {
			this.pos +=
				HeaderTypes.BITMAP_V4_HEADER - HeaderTypes.BITMAP_V3_INFO_HEADER;
		}
		// End of BITMAP_V4_HEADER
		if (this.headerSize > HeaderTypes.BITMAP_V4_HEADER) {
			this.pos += HeaderTypes.BITMAP_V5_HEADER - HeaderTypes.BITMAP_V4_HEADER;
		}
		// End of BITMAP_V5_HEADER
		if (this.bitsPerPixel <= 8 || this.colors > 0) {
			const len = this.colors === 0 ? 1 << this.bitsPerPixel : this.colors;
			this.palette = new Array(len);
			for (let i = 0; i < len; i++) {
				const blue = this.view.getUint8(this.pos); this.pos += 1;
				const green = this.view.getUint8(this.pos); this.pos += 1;
				const red = this.view.getUint8(this.pos); this.pos += 1;
				const quad = this.view.getUint8(this.pos); this.pos += 1;
				this.palette[i] = {
					red,
					green,
					blue,
					quad
				};
			}
		}
		// End of color table
		const coloShift = maskColor(this.maskRed, this.maskGreen, this.maskBlue, this.maskAlpha);
		this.shiftRed = coloShift.shiftRed;
		this.shiftGreen = coloShift.shiftGreen;
		this.shiftBlue = coloShift.shiftBlue;
		this.shiftAlpha = coloShift.shiftAlpha;
	}
	parseRGBA() {
		this.data = new Uint8ClampedArray(this.width * this.height * 4);
		switch (this.bitsPerPixel) {
			case 1:
				this.parse1bpp();
				break;
			case 4:
				this.parse4bpp();
				break;
			case 8:
				this.parse8bpp();
				break;
			case 16:
				this.parse16bpp();
				break;
			case 24:
				this.parse24bpp();
				break;
			default:
				this.parse32bpp();
		}
	}
	parse1bpp() {
		const xLen = Math.ceil(this.width / 8);
		const mode = xLen % 4;
		const padding = mode !== 0 ? 4 - mode : 0;
		let lastLine;
		this.scanImage(padding, xLen, (x, line) => {
			if (line !== lastLine) {
				lastLine = line;
			}
			const b = this.view.getUint8(this.pos); this.pos += 1;
			const location = line * this.width * 4 + x * 8 * 4;
			for (let i = 0; i < 8; i++) {
				if (x * 8 + i < this.width) {
					// @TODO: use setPixelData?
					const rgb = this.palette[(b >> (7 - i)) & 0x1];
					this.data[location + i * 4 + this.locAlpha] = 255;
					this.data[location + i * 4 + this.locBlue] = rgb.blue;
					this.data[location + i * 4 + this.locGreen] = rgb.green;
					this.data[location + i * 4 + this.locRed] = rgb.red;
				}
				else {
					break;
				}
			}
		});
	}
	parse4bpp() {
		if (this.compression === 2 /* BI_RLE4 */) {
			let lowNibble = false; //for all count of pixel
			let lines = this.bottomUp ? this.height - 1 : 0;
			let location = 0;
			while (location < this.data.length) {
				const a = this.view.getUint8(this.pos); this.pos += 1;
				const b = this.view.getUint8(this.pos); this.pos += 1;
				//absolute mode
				if (a === 0) {
					if (b === 0) {
						//line end
						lines += this.bottomUp ? -1 : 1;
						location = lines * this.width * 4;
						lowNibble = false;
						continue;
					}
					if (b === 1) {
						// image end
						break;
					}
					if (b === 2) {
						// offset x, y
						const x = this.view.getUint8(this.pos); this.pos += 1;
						const y = this.view.getUint8(this.pos); this.pos += 1;
						lines += this.bottomUp ? -y : y;
						location += y * this.width * 4 + x * 4;
					}
					else {
						let c = this.view.getUint8(this.pos); this.pos += 1;
						for (let i = 0; i < b; i++) {
							location = this.setPixelData(location, lowNibble ? c & 0x0f : (c & 0xf0) >> 4);
							if (i & 1 && i + 1 < b) {
								c = this.view.getUint8(this.pos); this.pos += 1;
							}
							lowNibble = !lowNibble;
						}
						if ((((b + 1) >> 1) & 1) === 1) {
							this.pos += 1;
						}
					}
				}
				else {
					//encoded mode
					for (let i = 0; i < a; i++) {
						location = this.setPixelData(location, lowNibble ? b & 0x0f : (b & 0xf0) >> 4);
						lowNibble = !lowNibble;
					}
				}
			}
		}
		else {
			const xLen = Math.ceil(this.width / 2);
			const mode = xLen % 4;
			const padding = mode !== 0 ? 4 - mode : 0;
			this.scanImage(padding, xLen, (x, line) => {
				const b = this.view.getUint8(this.pos); this.pos += 1;
				const location = line * this.width * 4 + x * 2 * 4;
				const first4 = b >> 4;
				// @TODO: use setPixelData?
				let rgb = this.palette[first4];
				this.data[location + this.locAlpha] = 255;
				this.data[location + this.locBlue] = rgb.blue;
				this.data[location + this.locGreen] = rgb.green;
				this.data[location + this.locRed] = rgb.red;
				if (x * 2 + 1 >= this.width) {
					// throw new Error('Something');
					return false;
				}
				const last4 = b & 0x0f;
				// @TODO: use setPixelData?
				rgb = this.palette[last4];
				this.data[location + 4 + this.locAlpha] = 255;
				this.data[location + 4 + this.locBlue] = rgb.blue;
				this.data[location + 4 + this.locGreen] = rgb.green;
				this.data[location + 4 + this.locRed] = rgb.red;
			});
		}
	}
	parse8bpp() {
		if (this.compression === 1 /* BI_RLE8 */) {
			let lines = this.bottomUp ? this.height - 1 : 0;
			let location = 0;
			while (location < this.data.length) {
				const a = this.view.getUint8(this.pos); this.pos += 1;
				const b = this.view.getUint8(this.pos); this.pos += 1;
				//absolute mode
				if (a === 0) {
					if (b === 0) {
						//line end
						lines += this.bottomUp ? -1 : 1;
						location = lines * this.width * 4;
						continue;
					}
					if (b === 1) {
						//image end
						break;
					}
					if (b === 2) {
						//offset x,y
						const x = this.view.getUint8(this.pos); this.pos += 1;
						const y = this.view.getUint8(this.pos); this.pos += 1;
						lines += this.bottomUp ? -y : y;
						location += y * this.width * 4 + x * 4;
					}
					else {
						for (let i = 0; i < b; i++) {
							const c = this.view.getUint8(this.pos); this.pos += 1;
							location = this.setPixelData(location, c);
						}
						// why 1 === 1???
						// eslint-disable-next-line no-self-compare
						const shouldIncrement = b & (1 === 1);
						if (shouldIncrement) {
							this.pos += 1;
						}
					}
				}
				else {
					//encoded mode
					for (let i = 0; i < a; i++) {
						location = this.setPixelData(location, b);
					}
				}
			}
		}
		else {
			const mode = this.width % 4;
			const padding = mode !== 0 ? 4 - mode : 0;
			this.scanImage(padding, this.width, (x, line) => {
				const b = this.view.getUint8(this.pos); this.pos += 1;
				const location = line * this.width * 4 + x * 4;
				// @TODO: use setPixelData?
				if (b < this.palette.length) {
					const rgb = this.palette[b];
					this.data[location + this.locRed] = rgb.red;
					this.data[location + this.locGreen] = rgb.green;
					this.data[location + this.locBlue] = rgb.blue;
					this.data[location + this.locAlpha] = 0xff;
				}
				else {
					this.data[location] = 0xff;
					this.data[location + 1] = 0xff;
					this.data[location + 2] = 0xff;
					this.data[location + 3] = 0xff;
				}
			});
		}
	}
	parse16bpp() {
		const padding = (this.width % 2) * 2;
		this.scanImage(padding, this.width, (x, line) => {
			const loc = line * this.width * 4 + x * 4;
			const px = this.view.getUint16(this.pos, true); this.pos += 2;
			this.data[loc + this.locRed] = this.shiftRed(px);
			this.data[loc + this.locGreen] = this.shiftGreen(px);
			this.data[loc + this.locBlue] = this.shiftBlue(px);
			this.data[loc + this.locAlpha] = 255; //this.shiftAlpha(px); // @TODO??
		});
	}
	parse24bpp() {
		const padding = this.width % 4;
		this.scanImage(padding, this.width, (x, line) => {
			const loc = line * this.width * 4 + x * 4;
			const blue = this.view.getUint8(this.pos); this.pos += 1;
			const green = this.view.getUint8(this.pos); this.pos += 1;
			const red = this.view.getUint8(this.pos); this.pos += 1;
			this.data[loc + this.locRed] = red;
			this.data[loc + this.locGreen] = green;
			this.data[loc + this.locBlue] = blue;
			this.data[loc + this.locAlpha] = 255;
		});
	}
	parse32bpp() {
		this.scanImage(0, this.width, (x, line) => {
			const loc = line * this.width * 4 + x * 4;
			const px = this.view.getUint32(this.pos, true); this.pos += 4;
			this.data[loc + this.locRed] = this.shiftRed(px);
			this.data[loc + this.locGreen] = this.shiftGreen(px);
			this.data[loc + this.locBlue] = this.shiftBlue(px);
			this.data[loc + this.locAlpha] = this.shiftAlpha(px);
		});
	}
	scanImage(padding = 0, width = this.width, processPixel) {
		for (let y = this.height - 1; y >= 0; y--) {
			const line = this.bottomUp ? y : this.height - 1 - y;
			for (let x = 0; x < width; x++) {
				const result = processPixel.call(this, x, line);
				if (result === false) {
					return;
				}
			}
			this.pos += padding;
		}
	}
	setPixelData(location, rgbIndex) {
		const { blue, green, red } = this.palette[rgbIndex];
		this.data[location + this.locAlpha] = 255;
		this.data[location + this.locBlue] = blue;
		this.data[location + this.locGreen] = green;
		this.data[location + this.locRed] = red;
		return location + 4;
	}
}
