const recordedDevice = {
	buttons: [0, 0, 0, 0],
	calibration: {
		DPI: { value: 324 },
		center: { value: 0.15018756687641144 },
		configVersion: "3.0",
		flipImageX: { value: 0 },
		flipImageY: { value: 0 },
		flipSubp: { value: 0 },
		fringe: { value: 0 },
		invView: { value: 1 },
		pitch: { value: 52.58013153076172 },
		screenH: { value: 2048 },
		screenW: { value: 1536 },
		slope: { value: -7.145165920257568 },
		verticalAngle: { value: 0 },
		viewCone: { value: 40 },
	},
	defaultQuilt: {
		quiltAspect: 0.75,
		quiltX: 3840,
		quiltY: 3840,
		tileX: 8,
		tileY: 6,
	},
	hardwareVersion: "portrait",
	hwid: "LKG-P11063",
	index: 0,
	joystickIndex: -1,
	state: "ok",
	unityIndex: 1,
	windowCoords: [1440, 900],
};

const interpretDevice = (device) => {
	if (device == null) {
		return { enabled: false, tileX: 1, tileY: 1 };
	}

	const fov = 15;

	const calibration = Object.fromEntries(
		Object.entries(device.calibration)
			.map(([key, value]) => [key, value.value])
			.filter(([key, value]) => value != null)
	);

	const screenInches = calibration.screenW / calibration.DPI;
	const pitch = calibration.pitch * screenInches * Math.cos(Math.atan(1.0 / calibration.slope));
	const tilt = (calibration.screenH / (calibration.screenW * calibration.slope)) * -(calibration.flipImageX * 2 - 1);
	const subp = 1 / (calibration.screenW * 3);

	const defaultQuilt = device.defaultQuilt;

	const quiltViewPortion = [
		(Math.floor(defaultQuilt.quiltX / defaultQuilt.tileX) * defaultQuilt.tileX) / defaultQuilt.quiltX,
		(Math.floor(defaultQuilt.quiltY / defaultQuilt.tileY) * defaultQuilt.tileY) / defaultQuilt.quiltY,
	];

	return {
		...defaultQuilt,
		...calibration,
		pitch,
		tilt,
		subp,

		quiltViewPortion,
		fov,
		enabled: true,
	};
};

export default async (useHoloplay = false, useRecordedDevice = false) => {
	if (!useHoloplay) {
		return interpretDevice(null);
	}
	const HoloPlayCore = await import("../../lib/holoplaycore.module.js");
	const device = await new Promise(
		(resolve, reject) =>
			new HoloPlayCore.Client(
				(data) => resolve(data.devices?.[0]),
				(error) => resolve(null)
			)
	);
	if (device == null && useRecordedDevice) {
		return interpretDevice(recordedDevice);
	}
	return interpretDevice(device);
};
