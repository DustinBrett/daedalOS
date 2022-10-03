const makePassTexture = (regl, halfFloat, mipmap) =>
	regl.texture({
		width: 1,
		height: 1,
		type: halfFloat ? "half float" : "uint8",
		wrap: "clamp",
		minFilter: "mipmap",
		min: mipmap ? "mipmap" : "linear",
		mag: "linear",
	});

const makePassFBO = (regl, halfFloat) => regl.framebuffer({ color: makePassTexture(regl, halfFloat) });

const makeDoubleBuffer = (regl, props) => {
	const state = Array(2)
		.fill()
		.map(() =>
			regl.framebuffer({
				color: regl.texture(props),
				depthStencil: false,
			})
		);
	return {
		front: ({ tick }) => state[tick % 2],
		back: ({ tick }) => state[(tick + 1) % 2],
	};
};

const loadImage = (regl, url) => {
	let texture = regl.texture([[0]]);
	let loaded = false;
	return {
		texture: () => {
			if (!loaded && url != null) {
				console.warn(`texture still loading: ${url}`);
			}
			return texture;
		},
		width: () => (loaded ? texture.width : 1),
		height: () => (loaded ? texture.height : 1),
		loaded: (async () => {
			if (url != null) {
				const data = new Image();
				data.crossOrigin = "anonymous";
				data.src = url;
				await data.decode();
				loaded = true;
				texture = regl.texture({
					data,
					mag: "linear",
					min: "linear",
					flipY: true,
				});
			}
		})(),
	};
};

const BASE_PATH = "/System/Matrix/";

const loadText = (url) => {
	let text = "";
	let loaded = false;
	return {
		text: () => {
			if (!loaded) {
				console.warn(`text still loading: ${url}`);
			}
			return text;
		},
		loaded: (async () => {
			if (url != null) {
				text = await (await fetch(`${BASE_PATH}/${url}`)).text();
				loaded = true;
			}
		})(),
	};
};

const makeFullScreenQuad = (regl, uniforms = {}, context = {}) =>
	regl({
		vert: `
		precision mediump float;
		attribute vec2 aPosition;
		varying vec2 vUV;
		void main() {
			vUV = 0.5 * (aPosition + 1.0);
			gl_Position = vec4(aPosition, 0, 1);
		}
	`,

		frag: `
		precision mediump float;
		varying vec2 vUV;
		uniform sampler2D tex;
		void main() {
			gl_FragColor = texture2D(tex, vUV);
		}
	`,

		attributes: {
			aPosition: [-4, -4, 4, -4, 0, 4],
		},
		count: 3,

		uniforms: {
			...uniforms,
			time: regl.context("time"),
			tick: regl.context("tick"),
		},

		context,

		depth: { enable: false },
	});

const make1DTexture = (regl, rgbas) => {
	const data = rgbas.map((rgba) => rgba.map((f) => Math.floor(f * 0xff))).flat();
	return regl.texture({
		data,
		width: data.length / 4,
		height: 1,
		format: "rgba",
		mag: "linear",
		min: "linear",
	});
};

const makePass = (outputs, ready, setSize, execute) => ({
	outputs: outputs ?? {},
	ready: ready ?? Promise.resolve(),
	setSize: setSize ?? (() => {}),
	execute: execute ?? (() => {}),
});

const makePipeline = (context, steps) =>
	steps.filter((f) => f != null).reduce((pipeline, f, i) => [...pipeline, f(context, i == 0 ? null : pipeline[i - 1].outputs)], []);

export { makePassTexture, makePassFBO, makeDoubleBuffer, loadImage, loadText, makeFullScreenQuad, make1DTexture, makePass, makePipeline };

