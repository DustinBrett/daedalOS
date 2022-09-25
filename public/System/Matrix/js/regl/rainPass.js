import { loadImage, loadText, makePassFBO, makeDoubleBuffer, makePass } from "./utils.js";

const extractEntries = (src, keys) => Object.fromEntries(Array.from(Object.entries(src)).filter(([key]) => keys.includes(key)));

const rippleTypes = {
	box: 0,
	circle: 1,
};

// These compute buffers are used to compute the properties of cells in the grid.
// They take turns being the source and destination of a "compute" shader.
// The half float data type is crucial! It lets us store almost any real number,
// whereas the default type limits us to integers between 0 and 255.

// These double buffers are smaller than the screen, because their pixels correspond
// with cells in the grid, and the cells' glyphs are much larger than a pixel.
const makeComputeDoubleBuffer = (regl, height, width) =>
	makeDoubleBuffer(regl, {
		width,
		height,
		wrapT: "clamp",
		type: "half float",
	});

const numVerticesPerQuad = 2 * 3;
const tlVert = [0, 0];
const trVert = [0, 1];
const blVert = [1, 0];
const brVert = [1, 1];
const quadVertices = [tlVert, trVert, brVert, tlVert, brVert, blVert];

export default ({ regl, config, lkg }) => {
	// The volumetric mode multiplies the number of columns
	// to reach the desired density, and then overlaps them
	const volumetric = config.volumetric;
	const density = volumetric && config.effect !== "none" ? config.density : 1;
	const [numRows, numColumns] = [config.numColumns, Math.floor(config.numColumns * density)];

	// The volumetric mode requires us to create a grid of quads,
	// rather than a single quad for our geometry
	const [numQuadRows, numQuadColumns] = volumetric ? [numRows, numColumns] : [1, 1];
	const numQuads = numQuadRows * numQuadColumns;
	const quadSize = [1 / numQuadColumns, 1 / numQuadRows];

	// Various effect-related values
	const rippleType = config.rippleTypeName in rippleTypes ? rippleTypes[config.rippleTypeName] : -1;
	const slantVec = [Math.cos(config.slant), Math.sin(config.slant)];
	const slantScale = 1 / (Math.abs(Math.sin(2 * config.slant)) * (Math.sqrt(2) - 1) + 1);
	const showDebugView = config.effect === "none";

	const commonUniforms = {
		...extractEntries(config, ["animationSpeed", "glyphHeightToWidth", "glyphSequenceLength", "glyphTextureGridSize"]),
		numColumns,
		numRows,
		showDebugView,
	};

	const raindropDoubleBuffer = makeComputeDoubleBuffer(regl, numRows, numColumns);
	const rainPassShine = loadText("shaders/glsl/rainPass.raindrop.frag.glsl");
	const raindropUniforms = {
		...commonUniforms,
		...extractEntries(config, ["brightnessDecay", "fallSpeed", "raindropLength", "loops"]),
	};
	const raindrop = regl({
		frag: regl.prop("frag"),
		uniforms: {
			...raindropUniforms,
			previousShineState: raindropDoubleBuffer.back,
		},

		framebuffer: raindropDoubleBuffer.front,
	});

	const symbolDoubleBuffer = makeComputeDoubleBuffer(regl, numRows, numColumns);
	const rainPassSymbol = loadText("shaders/glsl/rainPass.symbol.frag.glsl");
	const symbolUniforms = {
		...commonUniforms,
		...extractEntries(config, ["cycleSpeed", "cycleFrameSkip", "loops"]),
	};
	const symbol = regl({
		frag: regl.prop("frag"),
		uniforms: {
			...symbolUniforms,
			raindropState: raindropDoubleBuffer.front,
			previousSymbolState: symbolDoubleBuffer.back,
		},

		framebuffer: symbolDoubleBuffer.front,
	});

	const effectDoubleBuffer = makeComputeDoubleBuffer(regl, numRows, numColumns);
	const rainPassEffect = loadText("shaders/glsl/rainPass.effect.frag.glsl");
	const effectUniforms = {
		...commonUniforms,
		...extractEntries(config, ["hasThunder", "rippleScale", "rippleSpeed", "rippleThickness", "loops"]),
		rippleType,
	};
	const effect = regl({
		frag: regl.prop("frag"),
		uniforms: {
			...effectUniforms,
			raindropState: raindropDoubleBuffer.front,
			previousEffectState: effectDoubleBuffer.back,
		},

		framebuffer: effectDoubleBuffer.front,
	});

	const quadPositions = Array(numQuadRows)
		.fill()
		.map((_, y) =>
			Array(numQuadColumns)
				.fill()
				.map((_, x) => Array(numVerticesPerQuad).fill([x, y]))
		);

	// We render the code into an FBO using MSDFs: https://github.com/Chlumsky/msdfgen
	const glyphMSDF = loadImage(regl, config.glyphMSDFURL);
	const glintMSDF = loadImage(regl, config.glintMSDFURL);
	const baseTexture = loadImage(regl, config.baseTextureURL);
	const glintTexture = loadImage(regl, config.glintTextureURL);
	const rainPassVert = loadText("shaders/glsl/rainPass.vert.glsl");
	const rainPassFrag = loadText("shaders/glsl/rainPass.frag.glsl");
	const output = makePassFBO(regl, config.useHalfFloat);
	const renderUniforms = {
		...commonUniforms,
		...extractEntries(config, [
			// vertex
			"forwardSpeed",
			"glyphVerticalSpacing",
			// fragment
			"baseBrightness",
			"baseContrast",
			"glintBrightness",
			"glintContrast",
			"hasBaseTexture",
			"hasGlintTexture",
			"brightnessThreshold",
			"brightnessOverride",
			"isolateCursor",
			"isolateGlint",
			"glyphEdgeCrop",
			"isPolar",
		]),
		density,
		numQuadColumns,
		numQuadRows,
		quadSize,
		slantScale,
		slantVec,
		volumetric,
	};
	const render = regl({
		blend: {
			enable: true,
			func: {
				src: "one",
				dst: "one",
			},
		},
		vert: regl.prop("vert"),
		frag: regl.prop("frag"),

		uniforms: {
			...renderUniforms,

			raindropState: raindropDoubleBuffer.front,
			symbolState: symbolDoubleBuffer.front,
			effectState: effectDoubleBuffer.front,
			glyphMSDF: glyphMSDF.texture,
			glintMSDF: glintMSDF.texture,
			baseTexture: baseTexture.texture,
			glintTexture: glintTexture.texture,

			camera: regl.prop("camera"),
			transform: regl.prop("transform"),
			screenSize: regl.prop("screenSize"),
		},

		viewport: regl.prop("viewport"),

		attributes: {
			aPosition: quadPositions,
			aCorner: Array(numQuads).fill(quadVertices),
		},
		count: numQuads * numVerticesPerQuad,

		framebuffer: output,
	});

	// Camera and transform math for the volumetric mode
	const screenSize = [1, 1];
	const { mat4, vec3 } = glMatrix;
	const transform = mat4.create();
	if (volumetric && config.isometric) {
		mat4.rotateX(transform, transform, (Math.PI * 1) / 8);
		mat4.rotateY(transform, transform, (Math.PI * 1) / 4);
		mat4.translate(transform, transform, vec3.fromValues(0, 0, -1));
		mat4.scale(transform, transform, vec3.fromValues(1, 1, 2));
	} else if (lkg.enabled) {
		mat4.translate(transform, transform, vec3.fromValues(0, 0, -1.1));
		mat4.scale(transform, transform, vec3.fromValues(1, 1, 1));
		mat4.scale(transform, transform, vec3.fromValues(0.15, 0.15, 0.15));
	} else {
		mat4.translate(transform, transform, vec3.fromValues(0, 0, -1));
	}
	const camera = mat4.create();

	const vantagePoints = [];

	return makePass(
		{
			primary: output,
		},
		Promise.all([
			glyphMSDF.loaded,
			glintMSDF.loaded,
			baseTexture.loaded,
			glintTexture.loaded,
			rainPassShine.loaded,
			rainPassSymbol.loaded,
			rainPassVert.loaded,
			rainPassFrag.loaded,
		]),
		(w, h) => {
			output.resize(w, h);
			const aspectRatio = w / h;

			const [numTileColumns, numTileRows] = [lkg.tileX, lkg.tileY];
			const numVantagePoints = numTileRows * numTileColumns;
			const tileWidth = Math.floor(w / numTileColumns);
			const tileHeight = Math.floor(h / numTileRows);
			vantagePoints.length = 0;
			for (let row = 0; row < numTileRows; row++) {
				for (let column = 0; column < numTileColumns; column++) {
					const index = column + row * numTileColumns;
					const camera = mat4.create();

					if (volumetric && config.isometric) {
						if (aspectRatio > 1) {
							mat4.ortho(camera, -1.5 * aspectRatio, 1.5 * aspectRatio, -1.5, 1.5, -1000, 1000);
						} else {
							mat4.ortho(camera, -1.5, 1.5, -1.5 / aspectRatio, 1.5 / aspectRatio, -1000, 1000);
						}
					} else if (lkg.enabled) {
						mat4.perspective(camera, (Math.PI / 180) * lkg.fov, lkg.quiltAspect, 0.0001, 1000);

						const distanceToTarget = -1; // TODO: Get from somewhere else
						let vantagePointAngle = (Math.PI / 180) * lkg.viewCone * (index / (numVantagePoints - 1) - 0.5);
						if (isNaN(vantagePointAngle)) {
							vantagePointAngle = 0;
						}
						const xOffset = distanceToTarget * Math.tan(vantagePointAngle);

						mat4.translate(camera, camera, vec3.fromValues(xOffset, 0, 0));

						camera[8] = -xOffset / (distanceToTarget * Math.tan((Math.PI / 180) * 0.5 * lkg.fov) * lkg.quiltAspect); // Is this right??
					} else {
						mat4.perspective(camera, (Math.PI / 180) * 90, aspectRatio, 0.0001, 1000);
					}

					const viewport = {
						x: column * tileWidth,
						y: row * tileHeight,
						width: tileWidth,
						height: tileHeight,
					};
					vantagePoints.push({ camera, viewport });
				}
			}
			[screenSize[0], screenSize[1]] = aspectRatio > 1 ? [1, aspectRatio] : [1 / aspectRatio, 1];
		},
		() => {
			raindrop({ frag: rainPassShine.text() });
			symbol({ frag: rainPassSymbol.text() });
			effect({ frag: rainPassEffect.text() });
			regl.clear({
				depth: 1,
				color: [0, 0, 0, 1],
				framebuffer: output,
			});

			for (const vantagePoint of vantagePoints) {
				render({ ...vantagePoint, transform, screenSize, vert: rainPassVert.text(), frag: rainPassFrag.text() });
			}
		}
	);
};
