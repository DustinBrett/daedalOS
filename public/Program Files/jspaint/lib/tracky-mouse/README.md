# ![](./images/tracky-mouse-logo-32.png) Tracky Mouse

> Control your computer by moving your head.

Tracky Mouse is intended to be a complete UI for head tracking, similar to [eViacam](https://github.com/cmauri/eviacam), but embeddable in web applications (such as [JS Paint, with its Eye Gaze Mode](https://jspaint.app/#eye-gaze-mode), which I might rename Hands-Free Mode or Facial Mouse Mode), as well as downloadable as an application to use to control your entire computer.

I'm also thinking about making a browser extension, which would 1. bridge between the desktop application and web applications, making it so you don't need to disable dwell clicking in the desktop app to use a web app that provides dwell clicking, 2. provide the equivalent of the desktop application for Chrome OS, and 3. automatically enhance webpages to be friendlier toward facial mouse input, by preventing menus from closing based on hover, enlarging elements etc., probably using site-specific enhancements.

So this would be a three-in-one project: desktop app, JavaScript library, and browser extension.
Sharing code between these different facets of the project means a lot of improvements can be made to three different products at once, and the library means that applications can have a fully functional facial mouse UI, and get people interested in head tracking because they can try it out right away.

Options could be exported/imported or even synced between the products.

## Why did I make this?

- eViacam isn't working on my computer
- There's not that much facial mouse software out there, especially cross-platform, and I think it's good to have options.
- I want people to be able to try JS Paint's Eye Gaze Mode out easily, and an embeddable facial mouse GUI would be great for that. (Backstory: Someone emailed me asking how they might build an eye gaze mode into jspaint, and so I built it for them. I want to build it into something a lot of people can use.)
- Sometimes my joints hurt a lot and I'd like to relieve strain by switching to an alternative input method, such as head movement. Although I also have serious neck problems, so I don't know what I was thinking. Working on this project I have to use it very sparingly, using a demo video instead of camera input whenever possible for testing.

## Libraries Used

- [jsfeat](https://github.com/inspirit/jsfeat) for point tracking
	- [MIT License](https://github.com/inspirit/jsfeat/blob/master/LICENSE)
- [clmtrackr.js](https://github.com/auduno/clmtrackr) for fast and lightweight but inaccurate face tracking
	- [MIT License](https://github.com/auduno/clmtrackr/blob/dev/LICENSE.txt)
- [facemesh](https://github.com/tensorflow/tfjs-models/tree/master/facemesh#mediapipe-facemesh) and [TensorFlow.js](https://www.tensorflow.org/) for accurate face tracking (once this loads, it stops using clmtrackr.js)
	- [Apache License 2.0](https://github.com/tensorflow/tfjs-models/blob/master/LICENSE)
	- [Apache License 2.0](https://github.com/tensorflow/tensorflow/blob/master/LICENSE)

## License

MIT-licensed, see [LICENSE.txt](./LICENSE.txt)

## Development Setup

- [Clone the repo.](https://help.github.com/articles/cloning-a-repository/)
- Install [Node.js](https://nodejs.org/) if you don't have it
- Open up a command prompt / terminal in the project directory.
- Run `npm install`
- For the electron app:
	- First install [RobotJS build dependencies](https://robotjs.io/docs/building) (on Ubuntu, `sudo apt-get install libxtst-dev libpng++-dev build-essential python2.7`)
	- Then `cd tracky-mouse-electron && npm install`

## Install Desktop App

The app is not yet distributed as precompiled binaries.
If you want to try out the desktop app in the meantime:

- See Development Setup
- In folder `tracky-mouse-electron`, run `npm start`

## Add to your project

Tracky Mouse is available on npm:
`npm i tracky-mouse`

```html
<script src="node_modules/tracky-mouse/tracky-mouse.js"></script>
<script>
	TrackyMouse.dependenciesRoot = "node_modules/tracky-mouse";
	TrackyMouse.loadDependencies().then(function() {
		TrackyMouse.init();

		// This sort of logic will be built into tracky-mouse in the future.
		const getEventOptions = ({x, y})=> {
			return {
				view: window, // needed for offsetX/Y calculation
				clientX: x,
				clientY: y,
				pointerId: 1234567890,
				pointerType: "mouse",
				isPrimary: true,
			};
		};
		TrackyMouse.onPointerMove = (x, y) => {
			const target = document.elementFromPoint(x, y) || document.body;
			if (target !== last_el_over) {
				if (last_el_over) {
					const event = new PointerEvent("pointerleave", Object.assign(getEventOptions({ x, y }), {
						button: 0,
						buttons: 1,
						bubbles: false,
						cancelable: false,
					}));
					last_el_over.dispatchEvent(event);
				}
				const event = new PointerEvent("pointerenter", Object.assign(getEventOptions({ x, y }), {
					button: 0,
					buttons: 1,
					bubbles: false,
					cancelable: false,
				}));
				target.dispatchEvent(event);
				last_el_over = target;
			}
			const event = new PointerEvent("pointermove", Object.assign(getEventOptions({ x, y }), {
				button: 0,
				buttons: 1,
				bubbles: true,
				cancelable: true,
			}));
			target.dispatchEvent(event);
		};
	});
</script>
```

## TODO

- Improve acceleration option (can reference eviacam source code, and play around with different equations)
	- Should be able to make smooth circular movements, right now it comes out kinda squarish
- Minimum distance to start moving pointer (option)
- Might want a margin outside of the bounds of the screen, in order to reliably point to the edges of the screen
The mouse would always be clamped to the screen, but the internal notion of the mouse's position would have some legroom.
It shouldn't be too much, because going to the edge of the screen is also useful for simple on-the-fly "calibration"
- Robust error handling, for camera access etc.
- Test differing video aspect ratios
- Coach user on:
	- Granting camera access
	- Troubleshooting camera access
		- Another application may be using it
		- Try unplugging and plugging it back in
		- Make sure you can use your camera with another application (but close this application before trying to get it to work in here again)
		- Installing (and maybe running?) `guvcview` can magically fix a webcam not showing up (worked for my Logitech C920 when it wouldn't show up in applications even after restart, but was listed in `lsusb`) ([source](https://forums.linuxmint.com/viewtopic.php?t=131011))
		- Correct camera
			- [`enumerateDevices`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices)
	- Disabling camera autofocus maybe
	- Positioning the camera and yourself
		- Above or below the screen is fine but you should be centered so the pointer doesn't move left/right too much when you want it to go up or down
			- In particular, you should be in line with the camera, such that your face appears head-on when looking comfortably at the center of the screen
				- A guide could show your head rotation
				- Callibration for an off-center camera should be possible (or explicitly using your head rotation instead of a projected position)
		- If the camera is above, leaning forward generally moves the pointer down
		- If the camera is below, leaning forward generally moves the pointer up
	- Tilting your head or moving your head both move the pointer
	- Lighting
		- Detect bad lighting conditions and report to the user
	- "Callibration" via simply moving your head to the edges of the screen (it's not like a gesture, it's just implicit in the fact that there are boundaries)
	- Choosing settings (sensitivity etc.)
		- If you move yourself or your camera, you may want to adjust the sensitivity.
		- If you're further away from the camera, you'll want a higher sensitivity.
			- Would it make sense to scale this to your head size in the camera? Maybe not with the innacurate face tracker, but with the face tracker... but you probably wouldn't want it to switch setting scaling schemes suddenly
			- It could detect if your head size significantly changes (and is stable for a period of time) from what it has been (stably for a period of time), and alert you, suggesting changing the setting, maybe even suggesting a value
- Integrate with dwell clicking functionality in jspaint...
- Dwell click time / area, beep on click options, etc.
- Sparkly effect of some kind instead of just green dots on your face?
- Pose invariance (smiling etc.)
	- Simplest might be to just use the bridge of your nose
		- Points can disappear due to pruning, but we could use other points as a fallback, but just use a nose point as long as it exists?
- Handle occluders explicitly by looking for differing optical flow? (most often a hand, e.g. brushing hair out of eyes)
- Latency compensation for Worker results: I made a "time travel" system, recording camera frames since the frame sent to the worker for processing, and playing them back when receiving the results from the worker to bring them up to speed, but it was too slow to actually do the replaying (tracking the points is actually kind of expensive)
	- Dedupe grayscale() computation...
	- WebAssembly for tracking points?
	- Time travel for adding AND removing points
- Eye tracker
	- Hybrid eye tracking + head tracking control, where eye tracking is used for quick movements to any place on the screen, and head tracking is used for fine adjustment. Like [Precision Gaze Mouse](https://precisiongazemouse.org/)
- Try moving away from electron, to a lighter-weight platform like <https://github.com/webview/webview>
