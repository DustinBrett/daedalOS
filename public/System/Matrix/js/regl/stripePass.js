import colorToRGB from "../colorToRGB.js";
import { loadText, make1DTexture, makePass, makePassFBO } from "./utils.js";

// Multiplies the rendered rain and bloom by a 1D gradient texture
// generated from the passed-in color sequence

// This shader introduces noise into the renders, to avoid banding

export default ({ regl, config }, inputs) => {
	const output = makePassFBO(regl, config.useHalfFloat);

	const { backgroundColor, cursorColor, glintColor, ditherMagnitude, bloomStrength } = config;

	const stripeTex = make1DTexture(
		regl,
		config.stripeColors.map((color) => [...colorToRGB(color), 1])
	);

	const stripePassFrag = loadText("shaders/glsl/stripePass.frag.glsl");

	const render = regl({
		frag: regl.prop("frag"),

		uniforms: {
			backgroundColor: colorToRGB(backgroundColor),
			cursorColor: colorToRGB(cursorColor),
			glintColor: colorToRGB(glintColor),
			ditherMagnitude,
			bloomStrength,
			tex: inputs.primary,
			bloomTex: inputs.bloom,
			stripeTex,
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
