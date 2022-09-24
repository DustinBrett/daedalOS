import { loadImage, loadText, makePassFBO, makePass } from "./utils.js";

let start;
const numClicks = 5;
const clicks = Array(numClicks).fill([0, 0, -Infinity]).flat();
let aspectRatio = 1;

let index = 0;
window.onclick = (e) => {
	clicks[index * 3 + 0] = 0 + e.clientX / e.srcElement.clientWidth;
	clicks[index * 3 + 1] = 1 - e.clientY / e.srcElement.clientHeight;
	clicks[index * 3 + 2] = (Date.now() - start) / 1000;
	index = (index + 1) % numClicks;
};

export default ({ regl, config, cameraTex, cameraAspectRatio }, inputs) => {
	const output = makePassFBO(regl, config.useHalfFloat);
	const mirrorPassFrag = loadText("shaders/glsl/mirrorPass.frag.glsl");
	const render = regl({
		frag: regl.prop("frag"),
		uniforms: {
			time: regl.context("time"),
			tex: inputs.primary,
			bloomTex: inputs.bloom,
			cameraTex,
			clicks: () => clicks,
			aspectRatio: () => aspectRatio,
			cameraAspectRatio,
		},
		framebuffer: output,
	});

	start = Date.now();

	return makePass(
		{
			primary: output,
		},
		Promise.all([mirrorPassFrag.loaded]),
		(w, h) => {
			output.resize(w, h);
			aspectRatio = w / h;
		},
		() => render({ frag: mirrorPassFrag.text() })
	);
};
