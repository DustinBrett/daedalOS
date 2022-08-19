const TrackyMouse = {
	dependenciesRoot: "./tracky-mouse",
};

TrackyMouse.loadDependencies = function () {
	TrackyMouse.dependenciesRoot = TrackyMouse.dependenciesRoot.replace(/\/+$/, "");
	const loadScript = src => {
		return new Promise((resolve, reject) => {
			// This wouldn't wait for them to load
			// for (const script of document.scripts) {
			// 	if (script.src.includes(src)) {
			// 		resolve();
			// 		return;
			// 	}
			// }
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.onload = resolve;
			script.onerror = reject;
			script.src = src;
			document.head.append(script);
		})
	};
	const scriptFiles = [
		`${TrackyMouse.dependenciesRoot}/lib/clmtrackr.js`,
		`${TrackyMouse.dependenciesRoot}/lib/facemesh/facemesh.js`,
		`${TrackyMouse.dependenciesRoot}/lib/stats.js`,
		`${TrackyMouse.dependenciesRoot}/lib/tf.js`,
	];
	return Promise.all(scriptFiles.map(loadScript));
};

TrackyMouse.init = function (div) {

	var uiContainer = div || document.createElement("div");
	uiContainer.classList.add("tracky-mouse-ui");
	uiContainer.innerHTML = `
		<div class="tracky-mouse-controls">
			<button id="use-camera">Use my camera</button>
			<button id="use-demo">Use demo footage</button>
			<br>
			<br>
			<label><span class="label-text">Horizontal Sensitivity</span> <input type="range" min="0" max="100" value="25" id="sensitivity-x"></label>
			<label><span class="label-text">Vertical Sensitivity</span> <input type="range" min="0" max="100" value="50" id="sensitivity-y"></label>
			<!-- <label><span class="label-text">Smoothing</span> <input type="range" min="0" max="100" value="50" id="smoothing"></label> -->
			<label><span class="label-text">Acceleration</span> <input type="range" min="0" max="100" value="50" id="acceleration"></label>
			<!-- <label><span class="label-text">Easy Stop (min distance to move)</span> <input type="range" min="0" max="100" value="50" id="min-distance"></label> -->
			<br>
			<label><span class="label-text"><input type="checkbox" checked id="mirror"> Mirror</label>
			<br>
		</div>
		<canvas class="tracky-mouse-canvas" id="tracky-mouse-canvas"></canvas>
	`;
	if (!div) {
		document.body.appendChild(uiContainer);
	}
	var mirrorCheckbox = uiContainer.querySelector("#mirror");
	var sensitivityXSlider = uiContainer.querySelector("#sensitivity-x");
	var sensitivityYSlider = uiContainer.querySelector("#sensitivity-y");
	var accelerationSlider = uiContainer.querySelector("#acceleration");
	var useCameraButton = uiContainer.querySelector("#use-camera");
	var useDemoFootageButton = uiContainer.querySelector("#use-demo");

	var canvas = uiContainer.querySelector("#tracky-mouse-canvas");
	var ctx = canvas.getContext('2d');

	var pointerEl = document.createElement('div');
	pointerEl.className = "tracky-mouse-pointer";
	document.body.appendChild(pointerEl);

	var cameraVideo = document.createElement('video');
	// required to work in iOS 11 & up:
	cameraVideo.setAttribute('playsinline', '');

	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.right = '0px';
	stats.domElement.style.left = '';
	document.body.appendChild(stats.domElement);

	var defaultWidth = 640;
	var defaultHeight = 480;
	var maxPoints = 1000;
	var mouseX = 0;
	var mouseY = 0;
	var prevMovementX = 0;
	var prevMovementY = 0;
	var enableTimeTravel = false;
	// var movementXSinceFacemeshUpdate = 0;
	// var movementYSinceFacemeshUpdate = 0;
	var cameraFramesSinceFacemeshUpdate = [];
	var sensitivityX;
	var sensitivityY;
	var acceleration;
	var face;
	var faceScore = 0;
	var faceScoreThreshold = 0.5;
	var faceConvergence = 0;
	var faceConvergenceThreshold = 50;
	var pointsBasedOnFaceScore = 0;
	var paused = false;
	var mouseNeedsInitPos = true;
	const SLOWMO = false;
	var debugTimeTravel = false;
	var debugAcceleration = false;
	var showDebugText = false;
	var mirror;

	var useClmTracking = true;
	var showClmTracking = useClmTracking;
	var useFacemesh = true;
	var facemeshOptions = {
		maxContinuousChecks: 5,
		detectionConfidence: 0.9,
		maxFaces: 1,
		iouThreshold: 0.3,
		scoreThreshold: 0.75
	};
	var fallbackTimeoutID;

	var facemeshLoaded = false;
	var facemeshFirstEstimation = true;
	var facemeshEstimating = false;
	var facemeshRejectNext = 0;
	var facemeshPrediction;
	var facemeshEstimateFaces;
	var faceInViewConfidenceThreshold = 0.7;
	var pointsBasedOnFaceInViewConfidence = 0;

	// scale of size of frames that are passed to worker and then computed several at once when backtracking for latency compensation
	// reducing this makes it much more likely to drop points and thus not work
	// THIS IS DISABLED and using a performance optimization of currentCameraImageData instead of getCameraImageData;
	// (the currentCameraImageData is also scaled differently, to the fixed canvas size instead of using the native camera image size)
	// const frameScaleForWorker = 1;

	var mainOops;
	var workerSyncedOops;

	// const frameCanvas = document.createElement("canvas");
	// const frameCtx = frameCanvas.getContext("2d");
	// const getCameraImageData = () => {
	// 	if (cameraVideo.videoWidth * frameScaleForWorker * cameraVideo.videoHeight * frameScaleForWorker < 1) {
	// 		return;
	// 	}
	// 	frameCanvas.width = cameraVideo.videoWidth * frameScaleForWorker;
	// 	frameCanvas.height = cameraVideo.videoHeight * frameScaleForWorker;
	// 	frameCtx.drawImage(cameraVideo, 0, 0, frameCanvas.width, frameCanvas.height);
	// 	return frameCtx.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
	// };

	let currentCameraImageData;
	let facemeshWorker;
	const initFacemeshWorker = () => {
		if (facemeshWorker) {
			facemeshWorker.terminate();
		}
		facemeshEstimating = false;
		facemeshFirstEstimation = true;
		facemeshLoaded = false;
		facemeshWorker = new Worker(`${TrackyMouse.dependenciesRoot}/facemesh.worker.js`);
		facemeshWorker.addEventListener("message", (e) => {
			// console.log('Message received from worker', e.data);
			if (e.data.type === "LOADED") {
				facemeshLoaded = true;
				facemeshEstimateFaces = () => {
					const imageData = currentCameraImageData;//getCameraImageData();
					if (!imageData) {
						return;
					}
					facemeshWorker.postMessage({ type: "ESTIMATE_FACES", imageData });
					return new Promise((resolve, reject) => {
						facemeshWorker.addEventListener("message", (e) => {
							if (e.data.type === "ESTIMATED_FACES") {
								resolve(e.data.predictions);
							}
						}, { once: true });
					});
				};
			}
		}, { once: true });
		facemeshWorker.postMessage({ type: "LOAD", options: facemeshOptions });
	};

	if (useFacemesh) {
		initFacemeshWorker();
	};

	sensitivityXSlider.onchange = () => {
		sensitivityX = sensitivityXSlider.value / 1000;
	};
	sensitivityYSlider.onchange = () => {
		sensitivityY = sensitivityYSlider.value / 1000;
	};
	accelerationSlider.onchange = () => {
		acceleration = accelerationSlider.value / 100;
	};
	mirrorCheckbox.onchange = () => {
		mirror = mirrorCheckbox.checked;
	};
	mirrorCheckbox.onchange();
	sensitivityXSlider.onchange();
	sensitivityYSlider.onchange();
	accelerationSlider.onchange();

	// Don't use WebGL because clmTracker is our fallback! It's also not much slower than with WebGL.
	var clmTracker = new clm.tracker({ useWebGL: false });
	clmTracker.init();
	var clmTrackingStarted = false;

	const reset = () => {
		clmTrackingStarted = false;
		cameraFramesSinceFacemeshUpdate.length = 0;
		if (facemeshPrediction) {
			// facemesh has a setting maxContinuousChecks that determines "How many frames to go without running
			// the bounding box detector. Only relevant if maxFaces > 1. Defaults to 5."
			facemeshRejectNext = facemeshOptions.maxContinuousChecks;
		}
		facemeshPrediction = null;
		useClmTracking = true;
		showClmTracking = true;
		pointsBasedOnFaceScore = 0;
		faceScore = 0;
		faceConvergence = 0;
	};

	useCameraButton.onclick = TrackyMouse.useCamera = () => {
		navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				width: defaultWidth,
				height: defaultHeight,
				facingMode: "user",
			}
		}).then((stream) => {
			reset();
			try {
				if ('srcObject' in cameraVideo) {
					cameraVideo.srcObject = stream;
				} else {
					cameraVideo.src = window.URL.createObjectURL(stream);
				}
			} catch (err) {
				cameraVideo.src = stream;
			}
		}, (error) => {
			console.log(error);
		});
	};
	useDemoFootageButton.onclick = TrackyMouse.useDemoFootage = () => {
		reset();
		cameraVideo.srcObject = null;
		cameraVideo.src = `${TrackyMouse.dependenciesRoot}/private/demo-input-footage.webm`;
		cameraVideo.loop = true;
	};

	if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
		console.log('getUserMedia not supported in this browser');
	}


	cameraVideo.addEventListener('loadedmetadata', () => {
		cameraVideo.play();
		cameraVideo.width = cameraVideo.videoWidth;
		cameraVideo.height = cameraVideo.videoHeight;
		canvas.width = cameraVideo.videoWidth;
		canvas.height = cameraVideo.videoHeight;
		debugFramesCanvas.width = cameraVideo.videoWidth;
		debugFramesCanvas.height = cameraVideo.videoHeight;
		debugPointsCanvas.width = cameraVideo.videoWidth;
		debugPointsCanvas.height = cameraVideo.videoHeight;

		mainOops = new OOPS();
		if (useFacemesh) {
			workerSyncedOops = new OOPS();
		}
	});
	cameraVideo.addEventListener('play', () => {
		clmTracker.reset();
		clmTracker.initFaceDetector(cameraVideo);
		clmTrackingStarted = true;
	});

	canvas.width = defaultWidth;
	canvas.height = defaultHeight;
	cameraVideo.width = defaultWidth;
	cameraVideo.height = defaultHeight;

	const debugFramesCanvas = document.createElement("canvas");
	debugFramesCanvas.width = canvas.width;
	debugFramesCanvas.height = canvas.height;
	const debugFramesCtx = debugFramesCanvas.getContext("2d");

	const debugPointsCanvas = document.createElement("canvas");
	debugPointsCanvas.width = canvas.width;
	debugPointsCanvas.height = canvas.height;
	const debugPointsCtx = debugPointsCanvas.getContext("2d");

	// function getPyramidData(pyramid) {
	// 	const array = new Float32Array(pyramid.data.reduce((sum, matrix)=> sum + matrix.buffer.f32.length, 0));
	// 	let offset = 0;
	// 	for (const matrix of pyramid.data) {
	// 		copy matrix.buffer.f32 into array starting at offset;
	// 		offset += matrix.buffer.f32.length;
	// 	}
	// 	return array;
	// }
	// function setPyramidData(pyramid, array) {
	// 	let offset = 0;
	// 	for (const matrix of pyramid.data) {
	// 		copy portion of array starting at offset into matrix.buffer.f32
	// 		offset += matrix.buffer.f32.length;
	// 	}
	// }

	// maybe should be based on size of head in view?
	const pruningGridSize = 5;
	const minDistanceToAddPoint = pruningGridSize * 1.5;

	// Object Oriented Programming Sucks
	// or Optical flOw Points System
	class OOPS {
		constructor() {
			this.curPyramid = new jsfeat.pyramid_t(3);
			this.prevPyramid = new jsfeat.pyramid_t(3);
			this.curPyramid.allocate(cameraVideo.videoWidth, cameraVideo.videoHeight, jsfeat.U8C1_t);
			this.prevPyramid.allocate(cameraVideo.videoWidth, cameraVideo.videoHeight, jsfeat.U8C1_t);

			this.pointCount = 0;
			this.pointStatus = new Uint8Array(maxPoints);
			this.prevXY = new Float32Array(maxPoints * 2);
			this.curXY = new Float32Array(maxPoints * 2);
		}
		addPoint(x, y) {
			if (this.pointCount < maxPoints) {
				var pointIndex = this.pointCount * 2;
				this.curXY[pointIndex] = x;
				this.curXY[pointIndex + 1] = y;
				this.prevXY[pointIndex] = x;
				this.prevXY[pointIndex + 1] = y;
				this.pointCount++;
			}
		}
		filterPoints(condition) {
			var outputPointIndex = 0;
			for (var inputPointIndex = 0; inputPointIndex < this.pointCount; inputPointIndex++) {
				if (condition(inputPointIndex)) {
					if (outputPointIndex < inputPointIndex) {
						var inputOffset = inputPointIndex * 2;
						var outputOffset = outputPointIndex * 2;
						this.curXY[outputOffset] = this.curXY[inputOffset];
						this.curXY[outputOffset + 1] = this.curXY[inputOffset + 1];
						this.prevXY[outputOffset] = this.prevXY[inputOffset];
						this.prevXY[outputOffset + 1] = this.prevXY[inputOffset + 1];
					}
					outputPointIndex++;
				} else {
					debugPointsCtx.fillStyle = "red";
					var inputOffset = inputPointIndex * 2;
					circle(debugPointsCtx, this.curXY[inputOffset], this.curXY[inputOffset + 1], 5);
					debugPointsCtx.fillText(condition.toString(), 5 + this.curXY[inputOffset], this.curXY[inputOffset + 1]);
					// console.log(this.curXY[inputOffset], this.curXY[inputOffset + 1]);
					ctx.strokeStyle = ctx.fillStyle;
					ctx.beginPath();
					ctx.moveTo(this.prevXY[inputOffset], this.prevXY[inputOffset + 1]);
					ctx.lineTo(this.curXY[inputOffset], this.curXY[inputOffset + 1]);
					ctx.stroke();
				}
			}
			this.pointCount = outputPointIndex;
		}
		prunePoints() {
			// pointStatus is only valid (indices line up) before filtering occurs, so must come first (could be combined though)
			this.filterPoints((pointIndex) => this.pointStatus[pointIndex] == 1);

			// De-duplicate points that are too close together
			// - Points that have collapsed together are completely useless.
			// - Points that are too close together are not necessarily helpful,
			//   and may adversely affect the tracking due to uneven weighting across your face.
			// - Reducing the number of points improves FPS.
			const grid = {};
			for (let pointIndex = 0; pointIndex < this.pointCount; pointIndex++) {
				const pointOffset = pointIndex * 2;
				grid[`${~~(this.curXY[pointOffset] / pruningGridSize)},${~~(this.curXY[pointOffset + 1] / pruningGridSize)}`] = pointIndex;
			}
			const indexesToKeep = Object.values(grid);
			this.filterPoints((pointIndex) => indexesToKeep.includes(pointIndex));
		}
		update(imageData) {
			[this.prevXY, this.curXY] = [this.curXY, this.prevXY];
			[this.prevPyramid, this.curPyramid] = [this.curPyramid, this.prevPyramid];

			// these are options worth breaking out and exploring
			var winSize = 20;
			var maxIterations = 30;
			var epsilon = 0.01;
			var minEigen = 0.001;

			jsfeat.imgproc.grayscale(imageData.data, imageData.width, imageData.height, this.curPyramid.data[0]);
			this.curPyramid.build(this.curPyramid.data[0], true);
			jsfeat.optical_flow_lk.track(
				this.prevPyramid, this.curPyramid,
				this.prevXY, this.curXY,
				this.pointCount,
				winSize, maxIterations,
				this.pointStatus,
				epsilon, minEigen);
			this.prunePoints();
		}
		draw(ctx) {
			for (var i = 0; i < this.pointCount; i++) {
				var pointOffset = i * 2;
				// var distMoved = Math.hypot(
				// 	this.prevXY[pointOffset] - this.curXY[pointOffset],
				// 	this.prevXY[pointOffset + 1] - this.curXY[pointOffset + 1]
				// );
				// if (distMoved >= 1) {
				// 	ctx.fillStyle = "lime";
				// } else {
				// 	ctx.fillStyle = "gray";
				// }
				circle(ctx, this.curXY[pointOffset], this.curXY[pointOffset + 1], 3);
				ctx.strokeStyle = ctx.fillStyle;
				ctx.beginPath();
				ctx.moveTo(this.prevXY[pointOffset], this.prevXY[pointOffset + 1]);
				ctx.lineTo(this.curXY[pointOffset], this.curXY[pointOffset + 1]);
				ctx.stroke();
			}
		}
		getMovement() {
			var movementX = 0;
			var movementY = 0;
			var numMovements = 0;
			for (var i = 0; i < this.pointCount; i++) {
				var pointOffset = i * 2;
				movementX += this.curXY[pointOffset] - this.prevXY[pointOffset];
				movementY += this.curXY[pointOffset + 1] - this.prevXY[pointOffset + 1];
				numMovements += 1;
			}
			if (numMovements > 0) {
				movementX /= numMovements;
				movementY /= numMovements;
			}
			return [movementX, movementY];
		}
	}

	canvas.addEventListener('click', (event) => {
		if (!mainOops) {
			return;
		}
		const rect = canvas.getBoundingClientRect();
		if (mirror) {
			mainOops.addPoint(
				(rect.right - event.clientX) / rect.width * canvas.width,
				(event.clientY - rect.top) / rect.height * canvas.height,
			);
		} else {
			mainOops.addPoint(
				(event.clientX - rect.left) / rect.width * canvas.width,
				(event.clientY - rect.top) / rect.height * canvas.height,
			);
		}
	});

	function maybeAddPoint(oops, x, y) {
		// In order to prefer points that already exist, since they're already tracking,
		// in order to keep a smooth overall tracking calculation,
		// don't add points if they're close to an existing point.
		// Otherwise, it would not just be redundant, but often remove the older points, in the pruning.
		for (var pointIndex = 0; pointIndex < oops.pointCount; pointIndex++) {
			var pointOffset = pointIndex * 2;
			// var distance = Math.hypot(
			// 	x - oops.curXY[pointOffset],
			// 	y - oops.curXY[pointOffset + 1]
			// );
			// if (distance < 8) {
			// 	return;
			// }
			// It might be good to base this on the size of the face...
			// Also, since we're pruning points based on a grid,
			// there's not much point in using Euclidean distance here,
			// we can just look at x and y distances.
			if (
				Math.abs(x - oops.curXY[pointOffset]) <= minDistanceToAddPoint ||
				Math.abs(y - oops.curXY[pointOffset + 1]) <= minDistanceToAddPoint
			) {
				return;
			}
		}
		oops.addPoint(x, y);
	}

	function animate() {
		requestAnimationFrame(animate);
		draw(!SLOWMO && (!paused || document.visibilityState === "visible"));
	}

	function draw(update = true) {
		ctx.resetTransform(); // in case there is an error, don't flip constantly back and forth due to mirroring
		ctx.clearRect(0, 0, canvas.width, canvas.height); // in case there's no footage
		ctx.save();
		ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		currentCameraImageData = imageData;

		if (mirror) {
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
		}

		if (!mainOops) {
			return;
		}

		if (update) {
			if (clmTrackingStarted) {
				if (useClmTracking || showClmTracking) {
					try {
						clmTracker.track(cameraVideo);
					} catch (error) {
						console.warn("Error in clmTracker.track()", error);
						if (clmTracker.getCurrentParameters().includes(NaN)) {
							console.warn("NaNs creeped in.");
						}
					}
					face = clmTracker.getCurrentPosition();
					faceScore = clmTracker.getScore();
					faceConvergence = Math.pow(clmTracker.getConvergence(), 0.5);
				}
				if (facemeshLoaded && !facemeshEstimating) {
					facemeshEstimating = true;
					// movementXSinceFacemeshUpdate = 0;
					// movementYSinceFacemeshUpdate = 0;
					cameraFramesSinceFacemeshUpdate = [];
					// If I switch virtual console desktop sessions in Ubuntu with Ctrl+Alt+F1 (and back with Ctrl+Alt+F2),
					// WebGL context is lost, which breaks facemesh (and clmTracker if useWebGL is not false)
					// Error: Size(8192) must match the product of shape 0, 0, 0
					//     at inferFromImplicitShape (tf.js:14142)
					//     at Object.reshape$3 [as kernelFunc] (tf.js:110368)
					//     at kernelFunc (tf.js:17241)
					//     at tf.js:17334
					//     at Engine.scopedRun (tf.js:17094)
					//     at Engine.runKernelFunc (tf.js:17328)
					//     at Engine.runKernel (tf.js:17171)
					//     at reshape_ (tf.js:25875)
					//     at reshape__op (tf.js:18348)
					//     at executeOp (tf.js:85396)
					// WebGL: CONTEXT_LOST_WEBGL: loseContext: context lost

					// Note that the first estimation from facemesh often takes a while,
					// and we don't want to continuously terminate the worker as it's working on those first results.
					// And also, for the first estimate it hasn't actually disabled clmtracker yet, so it's fine if it's a long timeout.
					clearTimeout(fallbackTimeoutID);
					fallbackTimeoutID = setTimeout(() => {
						if (!useClmTracking) {
							reset();
							clmTracker.init();
							clmTracker.reset();
							clmTracker.initFaceDetector(cameraVideo);
							clmTrackingStarted = true;
							console.warn("Falling back to clmtracker");
						}
						// If you've switched desktop sessions, it will presuably fail to get a new webgl context until you've switched back
						// Is this setInterval useful, vs just starting the worker?
						// It probably has a faster cycle, with the code as it is now, but maybe not inherently.
						// TODO: do the extra getContext() calls add to a GPU process crash limit
						// that makes it only able to recover a couple times (outside the electron app)?
						// For electron, I set chromium flag --disable-gpu-process-crash-limit so it can recover unlimited times.
						// TODO: there's still the case of WebGL backend failing to initialize NOT due to the process crash limit,
						// where it'd be good to have it try again (maybe with exponential falloff?)
						// (I think I can move my fallbackTimeout code into/around `initFacemeshWorker` and `facemeshEstimateFaces`)

						// Note: clearTimeout/clearInterval work interchangably
						fallbackTimeoutID = setInterval(() => {
							try {
								// Once we can create a webgl2 canvas...
								document.createElement("canvas").getContext("webgl2");
								clearInterval(fallbackTimeoutID);
								// It's worth trying to re-initialize...
								setTimeout(() => {
									console.warn("Re-initializing facemesh worker");
									initFacemeshWorker();
									facemeshRejectNext = 1; // or more?
								}, 1000);
							} catch (e) { }
						}, 500);
					}, facemeshFirstEstimation ? 20000 : 2000);
					facemeshEstimateFaces().then((predictions) => {
						facemeshEstimating = false;
						facemeshFirstEstimation = false;

						facemeshRejectNext -= 1;
						if (facemeshRejectNext > 0) {
							return;
						}

						facemeshPrediction = predictions[0]; // undefined if no faces found

						useClmTracking = false;
						showClmTracking = false;
						clearTimeout(fallbackTimeoutID);

						if (!facemeshPrediction) {
							return;
						}
						// this applies to facemeshPrediction.annotations as well, which references the same points
						// facemeshPrediction.scaledMesh.forEach((point) => {
						// 	point[0] /= frameScaleForWorker;
						// 	point[1] /= frameScaleForWorker;
						// });

						// time travel latency compensation
						// keep a history of camera frames since the prediciton was requested,
						// and analyze optical flow of new points over that history

						// mainOops.filterPoints(() => false); // for DEBUG, empty points (could probably also just set pointCount = 0;

						workerSyncedOops.filterPoints(() => false); // empty points (could probably also just set pointCount = 0;

						const { annotations } = facemeshPrediction;
						// nostrils
						workerSyncedOops.addPoint(annotations.noseLeftCorner[0][0], annotations.noseLeftCorner[0][1]);
						workerSyncedOops.addPoint(annotations.noseRightCorner[0][0], annotations.noseRightCorner[0][1]);
						// midway between eyes
						workerSyncedOops.addPoint(annotations.midwayBetweenEyes[0][0], annotations.midwayBetweenEyes[0][1]);
						// inner eye corners
						// workerSyncedOops.addPoint(annotations.leftEyeLower0[8][0], annotations.leftEyeLower0[8][1]);
						// workerSyncedOops.addPoint(annotations.rightEyeLower0[8][0], annotations.rightEyeLower0[8][1]);

						// console.log(workerSyncedOops.pointCount, cameraFramesSinceFacemeshUpdate.length, workerSyncedOops.curXY);
						if (enableTimeTravel) {
							debugFramesCtx.clearRect(0, 0, debugFramesCanvas.width, debugFramesCanvas.height);
							setTimeout(() => {
								debugPointsCtx.clearRect(0, 0, debugPointsCanvas.width, debugPointsCanvas.height);
							}, 900)
							cameraFramesSinceFacemeshUpdate.forEach((imageData, index) => {
								if (debugTimeTravel) {
									debugFramesCtx.save();
									debugFramesCtx.globalAlpha = 0.1;
									// debugFramesCtx.globalCompositeOperation = index % 2 === 0 ? "xor" : "xor";
									frameCtx.putImageData(imageData, 0, 0);
									// debugFramesCtx.putImageData(imageData, 0, 0);
									debugFramesCtx.drawImage(frameCanvas, 0, 0, canvas.width, canvas.height);
									debugFramesCtx.restore();
									debugPointsCtx.fillStyle = "aqua";
									workerSyncedOops.draw(debugPointsCtx);
								}
								workerSyncedOops.update(imageData);
							});
						}

						// Bring points from workerSyncedOops to realtime mainOops
						for (var pointIndex = 0; pointIndex < workerSyncedOops.pointCount; pointIndex++) {
							const pointOffset = pointIndex * 2;
							maybeAddPoint(mainOops, workerSyncedOops.curXY[pointOffset], workerSyncedOops.curXY[pointOffset + 1]);
						}
						// Don't do this! It's not how this is supposed to work.
						// mainOops.pointCount = workerSyncedOops.pointCount;
						// for (var pointIndex = 0; pointIndex < workerSyncedOops.pointCount; pointIndex++) {
						// 	const pointOffset = pointIndex * 2;
						// 	mainOops.curXY[pointOffset] = workerSyncedOops.curXY[pointOffset];
						// 	mainOops.curXY[pointOffset+1] = workerSyncedOops.curXY[pointOffset+1];
						// 	mainOops.prevXY[pointOffset] = workerSyncedOops.prevXY[pointOffset];
						// 	mainOops.prevXY[pointOffset+1] = workerSyncedOops.prevXY[pointOffset+1];
						// }

						// naive latency compensation
						// Note: this applies to facemeshPrediction.annotations as well which references the same point objects
						// Note: This latency compensation only really works if it's already tracking well
						// if (prevFaceInViewConfidence > 0.99) {
						// 	facemeshPrediction.scaledMesh.forEach((point) => {
						// 		point[0] += movementXSinceFacemeshUpdate;
						// 		point[1] += movementYSinceFacemeshUpdate;
						// 	});
						// }

						pointsBasedOnFaceInViewConfidence = facemeshPrediction.faceInViewConfidence;

						// TODO: separate confidence threshold for removing vs adding points?

						// cull points to those within useful facial region
						// TODO: use time travel for this too, probably! with a history of the points
						// a complexity would be that points can be removed over time and we need to keep them identified
						mainOops.filterPoints((pointIndex) => {
							var pointOffset = pointIndex * 2;
							// distance from tip of nose (stretched so make an ellipse taller than wide)
							var distance = Math.hypot(
								(annotations.noseTip[0][0] - mainOops.curXY[pointOffset]) * 1.4,
								annotations.noseTip[0][1] - mainOops.curXY[pointOffset + 1]
							);
							var headSize = Math.hypot(
								annotations.leftCheek[0][0] - annotations.rightCheek[0][0],
								annotations.leftCheek[0][1] - annotations.rightCheek[0][1]
							);
							if (distance > headSize) {
								return false;
							}
							// Avoid blinking eyes affecting pointer position.
							// distance to outer corners of eyes
							distance = Math.min(
								Math.hypot(
									annotations.leftEyeLower0[0][0] - mainOops.curXY[pointOffset],
									annotations.leftEyeLower0[0][1] - mainOops.curXY[pointOffset + 1]
								),
								Math.hypot(
									annotations.rightEyeLower0[0][0] - mainOops.curXY[pointOffset],
									annotations.rightEyeLower0[0][1] - mainOops.curXY[pointOffset + 1]
								),
							);
							if (distance < headSize * 0.42) {
								return false;
							}
							return true;
						});
					}, () => {
						facemeshEstimating = false;
						facemeshFirstEstimation = false;
					});
				}
			}
			mainOops.update(imageData);
		}

		if (facemeshPrediction) {
			ctx.fillStyle = "red";

			const bad = facemeshPrediction.faceInViewConfidence < faceInViewConfidenceThreshold;
			ctx.fillStyle = bad ? 'rgb(255,255,0)' : 'rgb(130,255,50)';
			if (!bad || mainOops.pointCount < 3 || facemeshPrediction.faceInViewConfidence > pointsBasedOnFaceInViewConfidence + 0.05) {
				if (bad) {
					ctx.fillStyle = 'rgba(255,0,255)';
				}
				if (update && useFacemesh) {
					// this should just be visual, since we only add/remove points based on the facemesh data when receiving it
					facemeshPrediction.scaledMesh.forEach((point) => {
						point[0] += prevMovementX;
						point[1] += prevMovementY;
					});
				}
				facemeshPrediction.scaledMesh.forEach(([x, y, z]) => {
					ctx.fillRect(x, y, 1, 1);
				});
			} else {
				if (update && useFacemesh) {
					pointsBasedOnFaceInViewConfidence -= 0.001;
				}
			}
		}

		if (face) {
			const bad = faceScore < faceScoreThreshold;
			ctx.strokeStyle = bad ? 'rgb(255,255,0)' : 'rgb(130,255,50)';
			if (!bad || mainOops.pointCount < 2 || faceScore > pointsBasedOnFaceScore + 0.05) {
				if (bad) {
					ctx.strokeStyle = 'rgba(255,0,255)';
				}
				if (update && useClmTracking) {
					pointsBasedOnFaceScore = faceScore;

					// nostrils
					maybeAddPoint(mainOops, face[42][0], face[42][1]);
					maybeAddPoint(mainOops, face[43][0], face[43][1]);
					// inner eye corners
					// maybeAddPoint(mainOops, face[25][0], face[25][1]);
					// maybeAddPoint(mainOops, face[30][0], face[30][1]);

					// TODO: separate confidence threshold for removing vs adding points?

					// cull points to those within useful facial region
					mainOops.filterPoints((pointIndex) => {
						var pointOffset = pointIndex * 2;
						// distance from tip of nose (stretched so make an ellipse taller than wide)
						var distance = Math.hypot(
							(face[62][0] - mainOops.curXY[pointOffset]) * 1.4,
							face[62][1] - mainOops.curXY[pointOffset + 1]
						);
						// distance based on outer eye corners
						var headSize = Math.hypot(
							face[23][0] - face[28][0],
							face[23][1] - face[28][1]
						);
						if (distance > headSize) {
							return false;
						}
						return true;
					});
				}
			} else {
				if (update && useClmTracking) {
					pointsBasedOnFaceScore -= 0.001;
				}
			}
			if (showClmTracking) {
				clmTracker.draw(canvas, undefined, undefined, true);
			}
		}
		if (debugTimeTravel) {
			ctx.save();
			ctx.globalAlpha = 0.8;
			ctx.drawImage(debugFramesCanvas, 0, 0);
			ctx.restore();
			ctx.drawImage(debugPointsCanvas, 0, 0);
		}
		ctx.fillStyle = "lime";
		mainOops.draw(ctx);
		debugPointsCtx.fillStyle = "green";
		mainOops.draw(debugPointsCtx);

		if (update) {
			var [movementX, movementY] = mainOops.getMovement();

			// Acceleration curves add a lot of stability,
			// letting you focus on a specific point without jitter, but still move quickly.

			// var accelerate = (delta, distance) => (delta / 10) * (distance ** 0.8);
			// var accelerate = (delta, distance) => (delta / 1) * (Math.abs(delta) ** 0.8);
			var accelerate = (delta, distance) => (delta / 1) * (Math.abs(delta * 5) ** acceleration);

			var distance = Math.hypot(movementX, movementY);
			var deltaX = accelerate(movementX * sensitivityX, distance);
			var deltaY = accelerate(movementY * sensitivityY, distance);

			if (debugAcceleration) {
				const graphWidth = 200;
				const graphHeight = 150;
				const graphMaxInput = 0.2;
				const graphMaxOutput = 0.4;
				const hilightInputRange = 0.01;
				ctx.save();
				ctx.fillStyle = "black";
				ctx.fillRect(0, 0, graphWidth, graphHeight);
				const hilightInput = movementX * sensitivityX;
				for (let x = 0; x < graphWidth; x++) {
					const input = x / graphWidth * graphMaxInput;
					const output = accelerate(input, input);
					const y = output / graphMaxOutput * graphHeight;
					// ctx.fillStyle = Math.abs(y - deltaX) < 1 ? "yellow" : "lime";
					const hilight = Math.abs(Math.abs(input) - Math.abs(hilightInput)) < hilightInputRange;
					if (hilight) {
						ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
						ctx.fillRect(x, 0, 1, graphHeight);
					}
					ctx.fillStyle = hilight ? "yellow" : "lime";
					ctx.fillRect(x, graphHeight - y, 1, y);
				}
				ctx.restore();
			}

			// This should never happen
			if (!isFinite(deltaX) || !isFinite(deltaY)) {
				return;
			}

			if (!paused) {
				const screenWidth = window.moveMouse ? screen.width : innerWidth;
				const screenHeight = window.moveMouse ? screen.height : innerHeight;

				mouseX -= deltaX * screenWidth;
				mouseY += deltaY * screenHeight;

				mouseX = Math.min(Math.max(0, mouseX), screenWidth);
				mouseY = Math.min(Math.max(0, mouseY), screenHeight);

				if (mouseNeedsInitPos) {
					// TODO: option to get preexisting mouse position instead of set it to center of screen
					mouseX = screenWidth / 2;
					mouseY = screenHeight / 2;
					mouseNeedsInitPos = false;
				}
				if (window.moveMouse) {
					window.moveMouse(~~mouseX, ~~mouseY);
					pointerEl.style.display = "none";
				} else {
					pointerEl.style.display = "";
					pointerEl.style.left = `${mouseX}px`;
					pointerEl.style.top = `${mouseY}px`;
				}
				if (TrackyMouse.onPointerMove) {
					TrackyMouse.onPointerMove(mouseX, mouseY);
				}
			}
			prevMovementX = movementX;
			prevMovementY = movementY;
			// movementXSinceFacemeshUpdate += movementX;
			// movementYSinceFacemeshUpdate += movementY;
			if (enableTimeTravel) {
				if (facemeshEstimating) {
					const imageData = getCameraImageData();
					if (imageData) {
						cameraFramesSinceFacemeshUpdate.push(imageData);
					}
					// limit this buffer size in case something goes wrong
					if (cameraFramesSinceFacemeshUpdate.length > 500) {
						// maybe just clear it entirely, because a partial buffer might not be useful
						cameraFramesSinceFacemeshUpdate.length = 0;
					}
				}
			}
		}
		ctx.restore();

		if (showDebugText) {
			ctx.save();
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 3;
			ctx.font = "20px sans-serif";
			ctx.beginPath();
			const text3 = "Face convergence score: " + ((useFacemesh && facemeshPrediction) ? "N/A" : faceConvergence.toFixed(4));
			const text1 = "Face tracking score: " + ((useFacemesh && facemeshPrediction) ? facemeshPrediction.faceInViewConfidence : faceScore).toFixed(4);
			const text2 = "Points based on score: " + ((useFacemesh && facemeshPrediction) ? pointsBasedOnFaceInViewConfidence : pointsBasedOnFaceScore).toFixed(4);
			ctx.strokeText(text1, 50, 50);
			ctx.fillText(text1, 50, 50);
			ctx.strokeText(text2, 50, 70);
			ctx.fillText(text2, 50, 70);
			ctx.strokeText(text3, 50, 170);
			ctx.fillText(text3, 50, 170);
			ctx.fillStyle = "lime";
			ctx.fillRect(0, 150, faceConvergence, 5);
			ctx.fillRect(0, 0, faceScore * canvas.width, 5);
			ctx.restore();
		}
		stats.update();
	}

	function circle(ctx, x, y, r) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	}

	animate();
	if (SLOWMO) {
		setInterval(draw, 200);
	}

	let autoDemo = false;
	try {
		autoDemo = localStorage.trackyMouseAutoDemo === "true";
	} catch (error) {
	}
	if (autoDemo) {
		useDemoFootage();
	} else if (window.moveMouse) {
		useCamera();
	}

	const handleShortcut = (shortcutType) => {
		if (shortcutType === "toggle-tracking") {
			paused = !paused;
			mouseNeedsInitPos = true;
			if (paused) {
				pointerEl.style.display = "none";
			}
		}
	};
	if (typeof onShortcut !== "undefined") {
		onShortcut(handleShortcut);
	} else {
		addEventListener("keydown", (event) => {
			// Same shortcut as the global shortcut in the electron app (is that gonna be a problem?)
			if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && event.key === "F9") {
				handleShortcut("toggle-tracking");
			}
		});
	}

}