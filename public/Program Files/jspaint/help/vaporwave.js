
const clouds_img = document.createElement("img");
clouds_img.src = "clouds.jpg";
const mask_img = document.createElement("img");
mask_img.src = "cloud-mask.png";
const something_img = document.createElement("img");
something_img.src = "../images/icons/32x32.png";

const canvas = document.createElement("canvas");
document.getElementById("background-animation").append(canvas);
const ctx = canvas.getContext("2d");
const animate = () => {
	rAF_ID = requestAnimationFrame(animate);

	if (
		canvas.width !== mask_img.width ||
		canvas.height !== mask_img.height
	) {
		canvas.width = mask_img.width;
		canvas.height = mask_img.height;
	}

	const clouds_scale = 1;
	const clouds_width = clouds_img.width * clouds_scale;
	const clouds_height = clouds_img.width * clouds_scale;
	const x_extent = (clouds_width - canvas.width) / 2;
	const y_extent = (clouds_height - canvas.height) / 2;
	const x_interval_ms = 19000;
	const y_interval_ms = 7000;
	const now = performance.now();
	if (!(
		mask_img.complete && mask_img.naturalWidth > 1 &&
		clouds_img.complete && clouds_img.naturalWidth > 1
	)) {
		return;
	}
	ctx.drawImage(
		clouds_img,
		Math.sin(now / x_interval_ms) * x_extent - x_extent,
		Math.cos(now / y_interval_ms) * y_extent - y_extent,
		clouds_width,
		clouds_height
	);
	if (something_img.complete && something_img.naturalWidth > 1) {
		let t = now / 5000;
		ctx.globalAlpha = 0.3 + Math.max(0, Math.sin(-t) * 1);
		ctx.drawImage(
			something_img,
			~~(Math.sin(-t) * canvas.width * 0.7),
			~~(Math.cos(-t) * 70)
		);
		ctx.globalAlpha = 1;
	}
	ctx.globalCompositeOperation = "screen";
	ctx.drawImage(mask_img, 0, 0);
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "white";
	ctx.fillRect(0, mask_img.naturalHeight, mask_img.naturalWidth, canvas.height);
	ctx.fillRect(mask_img.naturalWidth, 0, 50, canvas.height); // for scrollbar
};
animate();
