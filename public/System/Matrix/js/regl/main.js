import { makeFullScreenQuad, makePipeline } from "./utils.js";

import { cameraAspectRatio, cameraCanvas, setupCamera } from "../camera.js";
import makeBloomPass from "./bloomPass.js";
import makeImagePass from "./imagePass.js";
import getLKG from "./lkgHelper.js";
import makeMirrorPass from "./mirrorPass.js";
import makePalettePass from "./palettePass.js";
import makeQuiltPass from "./quiltPass.js";
import makeRain from "./rainPass.js";
import makeStripePass from "./stripePass.js";

const effects = {
	none: null,
	plain: makePalettePass,
	customStripes: makeStripePass,
	stripes: makeStripePass,
	pride: makeStripePass,
	transPride: makeStripePass,
	trans: makeStripePass,
	image: makeImagePass,
	mirror: makeMirrorPass,
};

const dimensions = { width: 1, height: 1 };

const loadJS = (src) =>
	new Promise((resolve, reject) => {
		const tag = document.createElement("script");
		tag.onload = resolve;
		tag.onerror = reject;
		tag.src = src;
		document.body.appendChild(tag);
	});

delete window.Matrix;

let previouslyLoaded = false;

window.Matrix = async (canvas, config) => {

	await Promise.all([loadJS("/System/Matrix/lib/regl.min.js"), loadJS("/System/Matrix/lib/gl-matrix.js")]);

	const resize = (resOverride) => {
		canvas.width = Math.ceil(canvas.clientWidth * (resOverride ?? config.resolution));
		canvas.height = Math.ceil(canvas.clientHeight * (resOverride ?? config.resolution));
	};
	window.onresize = resize;

  if (previouslyLoaded) {
    resize(0);
    setTimeout(resize, 100);
  }

	if (config.useCamera) {
		await setupCamera();
	}

	const regl = createREGL({
		canvas,
		extensions: ["OES_texture_half_float", "OES_texture_half_float_linear"],
		// These extensions are also needed, but Safari misreports that they are missing
		optionalExtensions: ["EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "OES_standard_derivatives"],
	});

	const cameraTex = regl.texture(cameraCanvas);
	const lkg = await getLKG(config.useHoloplay, true);

	// All this takes place in a full screen quad.
	const fullScreenQuad = makeFullScreenQuad(regl);
	const effectName = config.effect in effects ? config.effect : "plain";
	const context = { regl, config, lkg, cameraTex, cameraAspectRatio };
	const pipeline = makePipeline(context, [makeRain, makeBloomPass, effects[effectName], makeQuiltPass]);
	const screenUniforms = { tex: pipeline[pipeline.length - 1].outputs.primary };
	const drawToScreen = regl({ uniforms: screenUniforms });
	await Promise.all(pipeline.map((step) => step.ready));
	const tick = regl.frame(({ viewportWidth, viewportHeight }) => {
		if (config.once) {
			tick.cancel();
		}
		if (config.useCamera) {
			cameraTex(cameraCanvas);
		}
		if (dimensions.width !== viewportWidth || dimensions.height !== viewportHeight) {
			dimensions.width = viewportWidth;
			dimensions.height = viewportHeight;
			for (const step of pipeline) {
				step.setSize(viewportWidth, viewportHeight);
			}
		}
		fullScreenQuad(() => {
			for (const step of pipeline) {
				step.execute();
			}
			drawToScreen();
		});
	});

  window.WallpaperDestroy = () => {
    previouslyLoaded = true;

    try {
      drawToScreen.destroy();
    } catch {
      // Failed to destroy
    }

    try {
      fullScreenQuad.destroy();
    } catch {
      // Failed to destroy
    }

    try {
      cameraTex.destroy();
    } catch {
      // Failed to destroy
    }

    try {
      screenUniforms.tex.destroy();
    } catch {
      // Failed to destroy
    }

    try {
      regl.destroy();
    } catch {
      // Failed to destroy
    }

    try {
      tick.cancel();
    } catch {
      // Failed to cancel tick
    }
  }
};
