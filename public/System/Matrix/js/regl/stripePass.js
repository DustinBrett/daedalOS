import { loadText, make1DTexture, makePassFBO, makePass } from "./utils.js";

// Multiplies the rendered rain and bloom by a 1D gradient texture
// generated from the passed-in color sequence

// This shader introduces noise into the renders, to avoid banding

const transPrideStripeColors = [
	[0.3, 1.0, 1.0],
	[0.3, 1.0, 1.0],
	[1.0, 0.5, 0.8],
	[1.0, 0.5, 0.8],
	[1.0, 1.0, 1.0],
	[1.0, 1.0, 1.0],
	[1.0, 1.0, 1.0],
	[1.0, 0.5, 0.8],
	[1.0, 0.5, 0.8],
	[0.3, 1.0, 1.0],
	[0.3, 1.0, 1.0],
].flat();

const prideStripeColors = [
	[1, 0, 0],
	[1, 0.5, 0],
	[1, 1, 0],
	[0, 1, 0],
	[0, 0, 1],
	[0.8, 0, 1],
].flat();

export default ({ regl, config }, inputs) => {
	const output = makePassFBO(regl, config.useHalfFloat);

	const { backgroundColor, cursorColor, glintColor, ditherMagnitude, bloomStrength } = config;

	// Expand and convert stripe colors into 1D texture data
	const stripeColors =
		"stripeColors" in config ? config.stripeColors.split(",").map(parseFloat) : config.effect === "pride" ? prideStripeColors : transPrideStripeColors;
	const numStripeColors = Math.floor(stripeColors.length / 3);
	const stripes = make1DTexture(
		regl,
		stripeColors.slice(0, numStripeColors * 3).map((f) => Math.floor(f * 0xff))
	);

	const stripePassFrag = loadText("shaders/glsl/stripePass.frag.glsl");

	const render = regl({
		frag: regl.prop("frag"),

		uniforms: {
			backgroundColor,
			cursorColor,
			glintColor,
			ditherMagnitude,
			bloomStrength,
			tex: inputs.primary,
			bloomTex: inputs.bloom,
			stripes,
		},
		framebuffer: output,
	});

	return makePass(
		{
			primary: output,
		},
		stripePassFrag.loaded,
		(w, h) => output.resize(w, h),
		() => render({ frag: stripePassFrag.text() })
	);
};
