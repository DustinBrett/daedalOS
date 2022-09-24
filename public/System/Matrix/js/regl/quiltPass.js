import { loadImage, loadText, makePassFBO, makePass } from "./utils.js";

// Multiplies the rendered rain and bloom by a loaded in image

export default ({ regl, config, lkg }, inputs) => {
	if (!lkg.enabled) {
		return makePass({
			primary: inputs.primary,
		});
	}

	const output = makePassFBO(regl, config.useHalfFloat);
	const quiltPassFrag = loadText("shaders/glsl/quiltPass.frag.glsl");
	const render = regl({
		frag: regl.prop("frag"),
		uniforms: {
			quiltTexture: inputs.primary,
			...lkg,
		},
		framebuffer: output,
	});
	return makePass(
		{
			primary: output,
		},
		Promise.all([quiltPassFrag.loaded]),
		(w, h) => output.resize(w, h),
		() => render({ frag: quiltPassFrag.text() })
	);
};
