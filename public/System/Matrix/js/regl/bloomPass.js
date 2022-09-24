import { loadText, makePassFBO, makePass } from "./utils.js";

// The bloom pass is basically an added high-pass blur.
// The blur approximation is the sum of a pyramid of downscaled, blurred textures.

const pyramidHeight = 5;
const levelStrengths = Array(pyramidHeight)
	.fill()
	.map((_, index) => Math.pow(index / (pyramidHeight * 2) + 0.5, 1 / 3).toPrecision(5))
	.reverse();

// A pyramid is just an array of FBOs, where each FBO is half the width
// and half the height of the FBO below it.
const makePyramid = (regl, height, halfFloat) =>
	Array(height)
		.fill()
		.map((_) => makePassFBO(regl, halfFloat));

const resizePyramid = (pyramid, vw, vh, scale) =>
	pyramid.forEach((fbo, index) => fbo.resize(Math.floor((vw * scale) / 2 ** index), Math.floor((vh * scale) / 2 ** index)));

export default ({ regl, config }, inputs) => {
	const { bloomStrength, bloomSize, highPassThreshold } = config;
	const enabled = bloomSize > 0 && bloomStrength > 0;

	// If there's no bloom to apply, return a no-op pass with an empty bloom texture
	if (!enabled) {
		return makePass({
			primary: inputs.primary,
			bloom: makePassFBO(regl),
		});
	}

	// Build three pyramids of FBOs, one for each step in the process
	const highPassPyramid = makePyramid(regl, pyramidHeight, config.useHalfFloat);
	const hBlurPyramid = makePyramid(regl, pyramidHeight, config.useHalfFloat);
	const vBlurPyramid = makePyramid(regl, pyramidHeight, config.useHalfFloat);
	const output = makePassFBO(regl, config.useHalfFloat);

	// The high pass restricts the blur to bright things in our input texture.
	const highPassFrag = loadText("shaders/glsl/highPass.frag.glsl");
	const highPass = regl({
		frag: regl.prop("frag"),
		uniforms: {
			highPassThreshold,
			tex: regl.prop("tex"),
		},
		framebuffer: regl.prop("fbo"),
	});

	// A 2D gaussian blur is just a 1D blur done horizontally, then done vertically.
	// The FBO pyramid's levels represent separate levels of detail;
	// by blurring them all, this basic blur approximates a more complex gaussian:
	// https://web.archive.org/web/20191124072602/https://software.intel.com/en-us/articles/compute-shader-hdr-and-bloom

	const blurFrag = loadText("shaders/glsl/blur.frag.glsl");
	const blur = regl({
		frag: regl.prop("frag"),
		uniforms: {
			tex: regl.prop("tex"),
			direction: regl.prop("direction"),
			height: regl.context("viewportWidth"),
			width: regl.context("viewportHeight"),
		},
		framebuffer: regl.prop("fbo"),
	});

	// The pyramid of textures gets flattened (summed) into a final blurry "bloom" texture
	const sumPyramid = regl({
		frag: `
			precision mediump float;
			varying vec2 vUV;
			${vBlurPyramid.map((_, index) => `uniform sampler2D pyr_${index};`).join("\n")}
			uniform float bloomStrength;
			void main() {
				vec4 total = vec4(0.);
				${vBlurPyramid.map((_, index) => `total += texture2D(pyr_${index}, vUV) * ${levelStrengths[index]};`).join("\n")}
				gl_FragColor = total * bloomStrength;
			}
		`,
		uniforms: {
			bloomStrength,
			...Object.fromEntries(vBlurPyramid.map((fbo, index) => [`pyr_${index}`, fbo])),
		},
		framebuffer: output,
	});

	return makePass(
		{
			primary: inputs.primary,
			bloom: output,
		},
		Promise.all([highPassFrag.loaded, blurFrag.loaded]),
		(w, h) => {
			// The blur pyramids can be lower resolution than the screen.
			resizePyramid(highPassPyramid, w, h, bloomSize);
			resizePyramid(hBlurPyramid, w, h, bloomSize);
			resizePyramid(vBlurPyramid, w, h, bloomSize);
			output.resize(w, h);
		},
		() => {
			for (let i = 0; i < pyramidHeight; i++) {
				const highPassFBO = highPassPyramid[i];
				const hBlurFBO = hBlurPyramid[i];
				const vBlurFBO = vBlurPyramid[i];
				highPass({ fbo: highPassFBO, frag: highPassFrag.text(), tex: i === 0 ? inputs.primary : highPassPyramid[i - 1] });
				blur({ fbo: hBlurFBO, frag: blurFrag.text(), tex: highPassFBO, direction: [1, 0] });
				blur({ fbo: vBlurFBO, frag: blurFrag.text(), tex: hBlurFBO, direction: [0, 1] });
			}

			sumPyramid();
		}
	);
};
