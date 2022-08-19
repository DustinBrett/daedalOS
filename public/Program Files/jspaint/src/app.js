
const default_magnification = 1;
const default_tool = get_tool_by_id(TOOL_PENCIL);

const default_canvas_width = 683;
const default_canvas_height = 384;
let my_canvas_width = default_canvas_width;
let my_canvas_height = default_canvas_height;

let aliasing = true;
let transparency = false;
let monochrome = false;

let magnification = default_magnification;
let return_to_magnification = 4;

const main_canvas = make_canvas();
main_canvas.classList.add("main-canvas");
const main_ctx = main_canvas.ctx;

const default_palette = [
	"rgb(0,0,0)", // Black
	"rgb(128,128,128)", // Dark Gray
	"rgb(128,0,0)", // Dark Red
	"rgb(128,128,0)", // Pea Green
	"rgb(0,128,0)", // Dark Green
	"rgb(0,128,128)", // Slate
	"rgb(0,0,128)", // Dark Blue
	"rgb(128,0,128)", // Lavender
	"rgb(128,128,64)", //
	"rgb(0,64,64)", //
	"rgb(0,128,255)", //
	"rgb(0,64,128)", //
	"rgb(64,0,255)", //
	"rgb(128,64,0)", //

	"rgb(255,255,255)", // White
	"rgb(192,192,192)", // Light Gray
	"rgb(255,0,0)", // Bright Red
	"rgb(255,255,0)", // Yellow
	"rgb(0,255,0)", // Bright Green
	"rgb(0,255,255)", // Cyan
	"rgb(0,0,255)", // Bright Blue
	"rgb(255,0,255)", // Magenta
	"rgb(255,255,128)", //
	"rgb(0,255,128)", //
	"rgb(128,255,255)", //
	"rgb(128,128,255)", //
	"rgb(255,0,128)", //
	"rgb(255,128,64)", //
];
const monochrome_palette_as_colors = [
	"rgb(0,0,0)",
	"rgb(9,9,9)",
	"rgb(18,18,18)",
	"rgb(27,27,27)",
	"rgb(37,37,37)",
	"rgb(46,46,46)",
	"rgb(55,55,55)",
	"rgb(63,63,63)",
	"rgb(73,73,73)",
	"rgb(82,82,82)",
	"rgb(92,92,92)",
	"rgb(101,101,101)",
	"rgb(110,110,110)",
	"rgb(119,119,119)",

	"rgb(255,255,255)",
	"rgb(250,250,250)",
	"rgb(242,242,242)",
	"rgb(212,212,212)",
	"rgb(201,201,201)",
	"rgb(191,191,191)",
	"rgb(182,182,182)",
	"rgb(159,159,159)",
	"rgb(128,128,128)",
	"rgb(173,173,173)",
	"rgb(164,164,164)",
	"rgb(155,155,155)",
	"rgb(146,146,146)",
	"rgb(137,137,137)",
];
let palette = default_palette;
let polychrome_palette = palette;
let monochrome_palette = make_monochrome_palette();

// https://github.com/kouzhudong/win2k/blob/ce6323f76d5cd7d136b74427dad8f94ee4c389d2/trunk/private/shell/win16/comdlg/color.c#L38-L43
// These are a fallback in case colors are not received from some driver.
// const default_basic_colors = [
// 	"#8080FF", "#80FFFF", "#80FF80", "#80FF00", "#FFFF80", "#FF8000", "#C080FF", "#FF80FF",
// 	"#0000FF", "#00FFFF", "#00FF80", "#40FF00", "#FFFF00", "#C08000", "#C08080", "#FF00FF",
// 	"#404080", "#4080FF", "#00FF00", "#808000", "#804000", "#FF8080", "#400080", "#8000FF",
// 	"#000080", "#0080FF", "#008000", "#408000", "#FF0000", "#A00000", "#800080", "#FF0080",
// 	"#000040", "#004080", "#004000", "#404000", "#800000", "#400000", "#400040", "#800040",
// 	"#000000", "#008080", "#408080", "#808080", "#808040", "#C0C0C0", "#400040", "#FFFFFF",
// ];
// Grabbed with Color Cop from the screen with Windows 98 SE running in VMWare
const basic_colors = [
	"#FF8080", "#FFFF80", "#80FF80", "#00FF80", "#80FFFF", "#0080FF", "#FF80C0", "#FF80FF",
	"#FF0000", "#FFFF00", "#80FF00", "#00FF40", "#00FFFF", "#0080C0", "#8080C0", "#FF00FF",
	"#804040", "#FF8040", "#00FF00", "#008080", "#004080", "#8080FF", "#800040", "#FF0080",
	"#800000", "#FF8000", "#008000", "#008040", "#0000FF", "#0000A0", "#800080", "#8000FF",
	"#400000", "#804000", "#004000", "#004040", "#000080", "#000040", "#400040", "#400080",
	"#000000", "#808000", "#808040", "#808080", "#408080", "#C0C0C0", "#400040", "#FFFFFF",
];
let custom_colors = [
	"#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF",
	"#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF",
];

// This feature is not ready yet.
// It needs to let the user decide when to switch the palette or not, when saving/opening an image.
// (maybe there could be a palette undo button? feels weird. MS Paint would probably use a dialog.)
// And it needs to handle canvas farbling, where pixel values are slightly different from each other,
// and equivalize them, when saving to a file. And maybe at other times.
// There are a lot of places in this app where I have to handle canvas farbling. It's obnoxious.
let enable_palette_loading_from_indexed_images = false;

// The File System Access API doesn't provide a way to get the file type selected by the user,
// or to automatically append a file extension to the file name.
// I'm not sure it's worth it to be able to save over an existing file.
// I also like the downloads bar UI to be honest.
// So this might need to be optional, but right now I'm disabling it as it's not ready.
// There are cases where 0-byte files are created, which is either a serious problem,
// it's just from canceling saving when the file name has a problem, and it needs to be cleaned up.
// Also, while I've implemented most of the UI, it'd be nice to release this with recent files support.
let enable_fs_access_api = false;

// The methods in systemHooks can be overridden by a containing page like 98.js.org which hosts jspaint in a same-origin iframe.
// This allows integrations like setting the wallpaper as the background of the host page, or saving files to a server.
// This API may be removed at any time (and perhaps replaced by something based around postMessage)
// The API is documented in the README.md file.
window.systemHooks = window.systemHooks || {};
window.systemHookDefaults = {
	// named to be distinct from various platform APIs (showSaveFilePicker, saveAs, electron's showSaveDialog; and saveFile is too ambiguous)
	// could call it saveFileAs maybe but then it'd be weird that you don't pass in the file directly
	showSaveFileDialog: async ({ formats, defaultFileName, defaultPath, defaultFileFormatID, getBlob, savedCallbackUnreliable, dialogTitle }) => {
		// Note: showSaveFilePicker currently doesn't support suggesting a filename,
		// or retrieving which file type was selected in the dialog (you have to get it (guess it) from the file name)
		// In particular, some formats are ambiguous with the file name, e.g. different bit depths of BMP files.
		// So, it's a tradeoff with the benefit of overwriting on Save.
		// https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
		// Also, if you're using accessibility options Speech Recognition or Eye Gaze Mode,
		// `showSaveFilePicker` fails based on a notion of it not being a "user gesture".
		// `saveAs` will likely also fail on the same basis,
		// but at least in chrome, there's a "Downloads Blocked" icon with a popup where you can say Always Allow.
		// I can't detect when it's allowed or blocked, but `saveAs` has a better chance of working,
		// so in Speech Recognition and Eye Gaze Mode, I set a global flag temporarily to disable File System Access API (window.untrusted_gesture).
		if (window.showSaveFilePicker && !window.untrusted_gesture && enable_fs_access_api) {
			// We can't get the selected file type, not even from newHandle.getFile()
			// so limit formats shown to a set that can all be used by their unique file extensions
			// formats = formats_unique_per_file_extension(formats);
			// OR, show two dialogs, one for the format and then one for the save location.
			const { newFileFormatID } = await save_as_prompt({ dialogTitle, defaultFileName, defaultFileFormatID, formats, promptForName: false });
			const new_format = formats.find((format) => format.formatID === newFileFormatID);
			const blob = await getBlob(new_format && new_format.formatID);
			formats = [new_format];
			let newHandle;
			let newFileName;
			try {
				newHandle = await showSaveFilePicker({
					types: formats.map((format) => {
						return {
							description: format.name,
							accept: {
								[format.mimeType]: format.extensions.map((extension) => "." + extension)
							}
						}
					})
				});
				newFileName = newHandle.name;
				const newFileExtension = get_file_extension(newFileName);
				const doItAgain = async (message) => {
					const button_value = await showMessageBox({
						message: `${message}\n\nTry adding .${new_format.extensions[0]} to the name. Sorry about this.`,
						iconID: "error",
						buttons: [
							{
								label: localize("Save As"), // or "Retry"
								value: "show-save-as-dialog-again",
								default: true,
							},
							{
								label: localize("Save"), // or "Ignore"
								value: "save-without-extension",
							},
							{
								label: localize("Cancel"), // or "Abort"
								value: "cancel",
							},
						],
					})
					if (button_value === "show-save-as-dialog-again") {
						return window.systemHookDefaults.showSaveFileDialog({
							formats,
							defaultFileName,
							defaultPath,
							defaultFileFormatID,
							getBlob,
							savedCallbackUnreliable,
							dialogTitle,
						});
					} else if (button_value === "save-without-extension") {
						// @TODO: DRY
						const writableStream = await newHandle.createWritable();
						await writableStream.write(blob);
						await writableStream.close();
						savedCallbackUnreliable && savedCallbackUnreliable({
							newFileName: newFileName,
							newFileFormatID: new_format && new_format.formatID,
							newFileHandle: newHandle,
							newBlob: blob,
						});
					} else {
						// user canceled save
					}
				};
				if (!newFileExtension) {
					// return await doItAgain(`Missing file extension.`);
					return await doItAgain(`'${newFileName}' doesn't have an extension.`);
				}
				if (!new_format.extensions.includes(newFileExtension)) {
					// Closest translation: "Paint cannot save to the same filename with a different file type."
					// return await doItAgain(`Wrong file extension for selected file type.`);
					return await doItAgain(`File extension '.${newFileExtension}' does not match the selected file type ${new_format.name}.`);
				}
				// const new_format =
				// 	get_format_from_extension(formats, newHandle.name) ||
				// 	formats.find((format)=> format.formatID === defaultFileFormatID);
				// const blob = await getBlob(new_format && new_format.formatID);
				const writableStream = await newHandle.createWritable();
				await writableStream.write(blob);
				await writableStream.close();
			} catch (error) {
				if (error.name === "AbortError") {
					// user canceled save
					return;
				}
				// console.warn("Error during showSaveFileDialog (for showSaveFilePicker; now falling back to saveAs)", error);
				// newFileName = (newFileName || file_name || localize("untitled"))
				// 	.replace(/\.(bmp|dib|a?png|gif|jpe?g|jpe|jfif|tiff?|webp|raw)$/i, "") +
				// 	"." + new_format.extensions[0];
				// saveAs(blob, newFileName);
				if (error.message.match(/gesture|activation/)) {
					// show_error_message("Your browser blocked the file from being saved, because you didn't use the mouse or keyboard directly to save. Try looking for a Downloads Blocked icon and say Always Allow, or save again with the keyboard or mouse.", error);
					show_error_message("Sorry, due to browser security measures, you must use the keyboard or mouse directly to save.");
					return;
				}
				show_error_message(localize("Failed to save document."), error);
				return;
			}
			savedCallbackUnreliable && savedCallbackUnreliable({
				newFileName: newFileName,
				newFileFormatID: new_format && new_format.formatID,
				newFileHandle: newHandle,
				newBlob: blob,
			});
		} else {
			const { newFileName, newFileFormatID } = await save_as_prompt({ dialogTitle, defaultFileName, defaultFileFormatID, formats });
			const blob = await getBlob(newFileFormatID);
			saveAs(blob, newFileName);
			savedCallbackUnreliable && savedCallbackUnreliable({
				newFileName,
				newFileFormatID,
				newFileHandle: null,
				newBlob: blob,
			});
		}
	},
	showOpenFileDialog: async ({ formats }) => {
		if (window.untrusted_gesture) {
			// We can't show a file picker RELIABLY.
			show_error_message("Sorry, a file picker cannot be shown when using Speech Recognition or Eye Gaze Mode. You must click File > Open directly with the mouse, or press Ctrl+O on the keyboard.");
			throw new Error("can't show file picker reliably");
		}
		if (window.showOpenFilePicker && enable_fs_access_api) {
			const [fileHandle] = await window.showOpenFilePicker({
				types: formats.map((format) => {
					return {
						description: format.name,
						accept: {
							[format.mimeType]: format.extensions.map((extension) => "." + extension)
						}
					}
				})
			});
			const file = await fileHandle.getFile();
			return { file, fileHandle };
		} else {
			// @TODO: specify mime types?
			return new Promise((resolve) => {
				const $input = $("<input type='file'>")
					.on("change", () => {
						resolve({ file: $input[0].files[0] });
						$input.remove();
					})
					.appendTo($app)
					.hide()
					.trigger("click");
			});
		}
	},
	writeBlobToHandle: async (save_file_handle, blob) => {
		if (save_file_handle && save_file_handle.createWritable && enable_fs_access_api) {
			const acknowledged = await confirm_overwrite_capability();
			if (!acknowledged) {
				return;
			}
			try {
				const writableStream = await save_file_handle.createWritable();
				await writableStream.write(blob);
				await writableStream.close();
			} catch (error) {
				if (error.name === "AbortError") {
					// user canceled save (this might not be a real error code that can occur here)
					return;
				}
				if (error.name === "NotAllowedError") {
					// use didn't give permission to save
					// is this too much of a warning?
					show_error_message(localize("Save was interrupted, so your file has not been saved."), error);
					return;
				}
				if (error.name === "SecurityError") {
					// not in a user gesture ("User activation is required to request permissions.")
					saveAs(blob, file_name);
					return;
				}
			}
		} else {
			saveAs(blob, file_name);
			// hopefully if the page reloads/closes the save dialog/download will persist and succeed?
		}
	},
	readBlobFromHandle: async (file_handle) => {
		if (file_handle && file_handle.getFile) {
			const file = await file_handle.getFile();
			return file;
		} else {
			throw new Error(`Unknown file handle (${file_handle})`);
			// show_error_message(`${localize("Failed to open document.")}\n${localize("An unsupported operation was attempted.")}`, error);
		}
	},
	setWallpaperTiled: (canvas) => {
		const wallpaperCanvas = make_canvas(screen.width, screen.height);
		const pattern = wallpaperCanvas.ctx.createPattern(canvas, "repeat");
		wallpaperCanvas.ctx.fillStyle = pattern;
		wallpaperCanvas.ctx.fillRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);

		systemHooks.setWallpaperCentered(wallpaperCanvas);
	},
	setWallpaperCentered: (canvas) => {
		systemHooks.showSaveFileDialog({
			dialogTitle: localize("Save As"),
			defaultName: `${file_name.replace(/\.(bmp|dib|a?png|gif|jpe?g|jpe|jfif|tiff?|webp|raw)$/i, "")} wallpaper.png`,
			defaultFileFormatID: "image/png",
			formats: image_formats,
			getBlob: (new_file_type) => {
				return new Promise((resolve) => {
					write_image_file(canvas, new_file_type, (blob) => {
						resolve(blob);
					});
				});
			},
		});
	},
};

for (const [key, defaultValue] of Object.entries(window.systemHookDefaults)) {
	window.systemHooks[key] = window.systemHooks[key] || defaultValue;
}

function get_file_extension(file_path_or_name) {
	// does NOT accept a file extension itself as input - if input does not have a dot, returns empty string
	return file_path_or_name.match(/\.([^./]+)$/)?.[1] || "";
}
function get_format_from_extension(formats, file_path_or_name_or_ext) {
	// accepts a file extension as input, or a file name, or path
	const ext_match = file_path_or_name_or_ext.match(/\.([^.]+)$/);
	const ext = ext_match ? ext_match[1].toLowerCase() : file_path_or_name_or_ext; // excluding dot
	for (const format of formats) {
		if (format.extensions.includes(ext)) {
			return format;
		}
	}
}

window.image_formats = [];
// const ext_to_image_formats = {}; // there can be multiple with the same extension, e.g. different bit depth BMP files
// const mime_type_to_image_formats = {};
const add_image_format = (mime_type, name_and_exts, target_array = image_formats) => {
	// Note: some localizations have commas instead of semicolons to separate file extensions
	// Assumption: file extensions are never localized
	const format = {
		formatID: mime_type,
		mimeType: mime_type,
		name: localize(name_and_exts).replace(/\s+\([^(]+$/, ""),
		nameWithExtensions: localize(name_and_exts),
		extensions: [],
	};
	const ext_regexp = /\*\.([^);,]+)/g;
	if (get_direction() === "rtl") {
		const rlm = "\u200F";
		const lrm = "\u200E";
		format.nameWithExtensions = format.nameWithExtensions.replace(ext_regexp, `${rlm}*.${lrm}$1${rlm}`);
	}
	let match;
	// eslint-disable-next-line no-cond-assign
	while (match = ext_regexp.exec(name_and_exts)) {
		const ext = match[1];
		// ext_to_image_formats[ext] = ext_to_image_formats[ext] || [];
		// ext_to_image_formats[ext].push(format);
		// mime_type_to_image_formats[mime_type] = mime_type_to_image_formats[mime_type] || [];
		// mime_type_to_image_formats[mime_type].push(format);
		format.extensions.push(ext);
	}

	target_array.push(format);
};
// First file extension in a parenthetical defines default for the format.
// Strings are localized in add_image_format, don't need localize() here.
add_image_format("image/png", "PNG (*.png)");
add_image_format("image/webp", "WebP (*.webp)");
add_image_format("image/gif", "GIF (*.gif)");
add_image_format("image/tiff", "TIFF (*.tif;*.tiff)");
add_image_format("image/jpeg", "JPEG (*.jpg;*.jpeg;*.jpe;*.jfif)");
add_image_format("image/x-bmp-1bpp", "Monochrome Bitmap (*.bmp;*.dib)");
add_image_format("image/x-bmp-4bpp", "16 Color Bitmap (*.bmp;*.dib)");
add_image_format("image/x-bmp-8bpp", "256 Color Bitmap (*.bmp;*.dib)");
add_image_format("image/bmp", "24-bit Bitmap (*.bmp;*.dib)");
// add_image_format("image/x-bmp-32bpp", "32-bit Transparent Bitmap (*.bmp;*.dib)");

// Only support 24bpp BMP files for File System Access API and Electron save dialog,
// as these APIs don't allow you to access the selected file type.
// You can only guess it from the file extension the user types.
const formats_unique_per_file_extension = (formats) => {
	// first handle BMP format specifically to make sure the 24-bpp is the selected BMP format
	formats = formats.filter((format) =>
		format.extensions.includes("bmp") ? format.mimeType === "image/bmp" : true
	)
	// then generally uniquify on extensions
	// (this could be overzealous in case of partial overlap in extensions of different formats,
	// but in general it needs special care anyways, to decide which format should win)
	// This can't be simply chained with the above because it needs to use the intermediate, partially filtered formats array.
	return formats.filter((format, format_index) =>
		!format.extensions.some((extension) =>
			formats.some((other_format, other_format_index) =>
				other_format_index < format_index &&
				other_format.extensions.includes(extension)
			)
		)
	);
};

// For the Open dialog, show more general format categories, like "Bitmap Files", maybe "Icon Files", etc.
// @TODO: probably need to do this differently for showOpenFilePicker...
/*
const image_format_categories = (image_formats) => {
	image_formats = image_formats.filter((format) =>
		!format.extensions.includes("bmp")
	);
	add_image_format("image/bmp", localize("Bitmap Files (*.bmp)").replace("(*.bmp)", "(*.bmp;*.dib)"), image_formats);
	// add_image_format("", "Icon Files (*.ico;*.cur;*.ani;*.icns)", image_formats);
	// add_image_format("", "All Picture Files", image_formats);
	// add_image_format("", "All Files", image_formats);
	image_formats.push({
		// TODO: we don't treat formatID and mimeType interchangeably, do we?
		formatID: "IMAGE_FILES",
		mimeType: "image/*", // but also application/pdf, not included here, but hopefully the mime type isn't what we go off of (I don't remember)
		name: localize("All Picture Files"),
		nameWithExtensions: localize("All Picture Files"),
		extensions: image_formats.map((format) => format.extensions).flat(),
	});
	image_formats.push({
		formatID: "ALL_FILES",
		mimeType: "*" + "/*",
		name: localize("All Files"),
		nameWithExtensions: localize("All Files"),
		extensions: ["*"], // Note: no other wildcard is allowed in the extension list
	});
	return image_formats;
};
*/

const palette_formats = [];
for (const [format_id, format] of Object.entries(AnyPalette.formats)) {
	if (format.write) {
		const inside_parens = format.fileExtensions.map((extension) => `*.${extension}`).join(";");
		palette_formats.push({
			formatID: format_id,
			name: format.name,
			nameWithExtensions: `${format.name} (${inside_parens})`,
			extensions: format.fileExtensions,
		});
	}
}
palette_formats.sort((a, b) =>
	// Order important formats first, starting with RIFF PAL format:
	(b.formatID === "RIFF_PALETTE") - (a.formatID === "RIFF_PALETTE") ||
	(b.formatID === "GIMP_PALETTE") - (a.formatID === "GIMP_PALETTE") ||
	0
);


// declared like this for Cypress tests
window.default_brush_shape = "circle";
window.default_brush_size = 4;
window.default_eraser_size = 8;
window.default_airbrush_size = 9;
window.default_pencil_size = 1;
window.default_stroke_size = 1; // applies to lines, curves, shape outlines
// declared like this for Cypress tests
window.brush_shape = default_brush_shape;
window.brush_size = default_brush_size
window.eraser_size = default_eraser_size;
window.airbrush_size = default_airbrush_size;
window.pencil_size = default_pencil_size;
window.stroke_size = default_stroke_size; // applies to lines, curves, shape outlines
let tool_transparent_mode = false;

let stroke_color;
let fill_color;
let stroke_color_k = "foreground"; // enum of "foreground", "background", "ternary"
let fill_color_k = "background"; // enum of "foreground", "background", "ternary"

let selected_tool = default_tool;
let selected_tools = [selected_tool];
let return_to_tools = [selected_tool];
window.selected_colors = { // declared like this for Cypress tests
	foreground: "",
	background: "",
	ternary: "",
};

let selection; //the one and only OnCanvasSelection
let textbox; //the one and only OnCanvasTextBox
let helper_layer; //the OnCanvasHelperLayer for the grid and tool previews
let $thumbnail_window;
let thumbnail_canvas;
let show_grid = false;
let show_thumbnail = false;
let text_tool_font = {
	family: '"Arial"', // should be an exact value detected by Font Detective
	size: 12,
	line_scale: 20 / 12,
	bold: false,
	italic: false,
	underline: false,
	vertical: false,
	color: "",
	background: "",
};

let root_history_node = make_history_node({ name: "App Not Loaded Properly - Please send a bug report." }); // will be replaced
let current_history_node = root_history_node;
let history_node_to_cancel_to = null;
/** array of history nodes */
let undos = [];
/** array of history nodes */
let redos = [];

let file_name;
let system_file_handle; // For saving over opened file on Save. Can be different type for File System Access API vs Electron.
let saved = true;

/** works in canvas coordinates */
let pointer;
/** works in canvas coordinates */
let pointer_start;
/** works in canvas coordinates */
let pointer_previous;

let pointer_active = false;
let pointer_type, pointer_buttons;
let reverse;
let ctrl;
let button;
let pointer_over_canvas = false;
let update_helper_layer_on_pointermove_active = false;

/** works in client coordinates */
let pointers = [];

const update_from_url_params = () => {
	if (location.hash.match(/eye-gaze-mode/i)) {
		if (!$("body").hasClass("eye-gaze-mode")) {
			$("body").addClass("eye-gaze-mode");
			$G.triggerHandler("eye-gaze-mode-toggled");
			$G.triggerHandler("theme-load"); // signal layout change
		}
	} else {
		if ($("body").hasClass("eye-gaze-mode")) {
			$("body").removeClass("eye-gaze-mode");
			$G.triggerHandler("eye-gaze-mode-toggled");
			$G.triggerHandler("theme-load"); // signal layout change
		}
	}

	if (location.hash.match(/vertical-color-box-mode|eye-gaze-mode/i)) {
		if (!$("body").hasClass("vertical-color-box-mode")) {
			$("body").addClass("vertical-color-box-mode");
			$G.triggerHandler("vertical-color-box-mode-toggled");
			$G.triggerHandler("theme-load"); // signal layout change
		}
	} else {
		if ($("body").hasClass("vertical-color-box-mode")) {
			$("body").removeClass("vertical-color-box-mode");
			$G.triggerHandler("vertical-color-box-mode-toggled");
			$G.triggerHandler("theme-load"); // signal layout change
		}
	}

	if (location.hash.match(/speech-recognition-mode/i)) {
		window.enable_speech_recognition && enable_speech_recognition();
	} else {
		window.disable_speech_recognition && disable_speech_recognition();
	}

	$("body").toggleClass("compare-reference", !!location.hash.match(/compare-reference/i));
	$("body").toggleClass("compare-reference-tool-windows", !!location.hash.match(/compare-reference-tool-windows/i));
	setTimeout(() => {
		if (location.hash.match(/compare-reference/i)) { // including compare-reference-tool-windows
			select_tool(get_tool_by_id(TOOL_SELECT));
			const test_canvas_width = 576;
			const test_canvas_height = 432;
			if (main_canvas.width !== test_canvas_width || main_canvas.height !== test_canvas_height) {
				// Unfortunately, right now this can cause a reverse "Save changes?" dialog,
				// where Discard will restore your drawing, Cancel will discard it, and Save will save a blank canvas,
				// because the load from storage happens after this resize.
				// But this is just a helper for development, so it's not a big deal.
				// are_you_sure here doesn't help, either.
				// are_you_sure(() => {
				resize_canvas_without_saving_dimensions(test_canvas_width, test_canvas_height);
				// });
			}
			if (!location.hash.match(/compare-reference-tool-windows/i)) {
				$toolbox.dock($left);
				$colorbox.dock($bottom);
				window.debugKeepMenusOpen = false;
			}
		}
		if (location.hash.match(/compare-reference-tool-windows/i)) {
			$toolbox.undock_to(84, 35);
			$colorbox.undock_to(239, 195);
			window.debugKeepMenusOpen = true;
			// $(".help-menu-button").click(); // have to trigger pointerdown/up, it doesn't respond to click
			// $(".help-menu-button").trigger("pointerdown").trigger("pointerup"); // and it doesn't use jQuery
			$(".help-menu-button")[0].dispatchEvent(new Event("pointerdown"));
			$(".help-menu-button")[0].dispatchEvent(new Event("pointerup"));
			$('[aria-label="About Paint"]')[0].dispatchEvent(new Event("pointerenter"));
		}
	}, 500);
};
update_from_url_params();
$G.on("hashchange popstate change-url-params", update_from_url_params);

// handle backwards compatibility URLs
if (location.search.match(/eye-gaze-mode/)) {
	change_url_param("eye-gaze-mode", true, { replace_history_state: true });
	update_from_url_params();
}
if (location.search.match(/vertical-colors?-box/)) {
	change_url_param("vertical-color-box", true, { replace_history_state: true });
	update_from_url_params();
}

const $app = $(E("div")).addClass("jspaint").appendTo("body");

const $V = $(E("div")).addClass("vertical").appendTo($app);
const $H = $(E("div")).addClass("horizontal").appendTo($V);

const $canvas_area = $(E("div")).addClass("canvas-area inset-deep").appendTo($H);

const $canvas = $(main_canvas).appendTo($canvas_area);
$canvas.css("touch-action", "none");
let canvas_bounding_client_rect = main_canvas.getBoundingClientRect(); // cached for performance, updated later
const canvas_handles = new Handles({
	$handles_container: $canvas_area,
	$object_container: $canvas_area,
	get_rect: () => ({ x: 0, y: 0, width: main_canvas.width, height: main_canvas.height }),
	set_rect: ({ width, height }) => resize_canvas_and_save_dimensions(width, height),
	outset: 4,
	get_handles_offset_left: () => parseFloat($canvas_area.css("padding-left")) + 1,
	get_handles_offset_top: () => parseFloat($canvas_area.css("padding-top")) + 1,
	get_ghost_offset_left: () => parseFloat($canvas_area.css("padding-left")) + 1,
	get_ghost_offset_top: () => parseFloat($canvas_area.css("padding-top")) + 1,
	size_only: true,
});

const $top = $(E("div")).addClass("component-area top").prependTo($V);
const $bottom = $(E("div")).addClass("component-area bottom").appendTo($V);
const $left = $(E("div")).addClass("component-area left").prependTo($H);
const $right = $(E("div")).addClass("component-area right").appendTo($H);
// there's also probably a CSS solution alternative to this
if (get_direction() === "rtl") {
	$left.appendTo($H);
	$right.prependTo($H);
}

const $status_area = $(E("div")).addClass("status-area").appendTo($V);
const $status_text = $(E("div")).addClass("status-text status-field inset-shallow").appendTo($status_area);
const $status_position = $(E("div")).addClass("status-coordinates status-field inset-shallow").appendTo($status_area);
const $status_size = $(E("div")).addClass("status-coordinates status-field inset-shallow").appendTo($status_area);

const news_seen_key = "jspaint latest news seen";
const latest_news_datetime = $this_version_news.find("time").attr("datetime");
const $news_indicator = $(`
	<a class='news-indicator' href='#project-news'>
		<img src='images/winter/present.png' width='24' height='22' alt=''/>
		<!--<span class='marquee' dir='ltr' style='--text-width: 50ch; --animation-duration: 3s;'>
			<span>
				<b>Open Source</b> — MIT Licensed! Free Software! Finally!
			</span>
		</span>-->
		<span>
			<b>Open Source!</b>
		</span>
	</a>
`);
$news_indicator.on("click auxclick", (event) => {
	event.preventDefault();
	show_news();
	$news_indicator.remove();
	try {
		localStorage[news_seen_key] = latest_news_datetime;
		// eslint-disable-next-line no-empty
	} catch (error) { }
});
let news_seen;
let local_storage_unavailable;
try {
	news_seen = localStorage[news_seen_key];
} catch (error) {
	local_storage_unavailable = true;
}
const news_period_if_can_dismiss = 15;
const news_period_if_cannot_dismiss = 5;
const news_period = local_storage_unavailable ? news_period_if_cannot_dismiss : news_period_if_can_dismiss;
if (Date.now() < Date.parse(latest_news_datetime) + news_period * 24 * 60 * 60 * 1000 && news_seen !== latest_news_datetime) {
	$status_area.append($news_indicator);
}

$status_text.default = () => {
	$status_text.text(localize("For Help, click Help Topics on the Help Menu."));
};
$status_text.default();

// menu bar
let menu_bar_outside_frame = false;
if (frameElement) {
	try {
		if (parent.MenuBar) {
			MenuBar = parent.MenuBar;
			menu_bar_outside_frame = true;
		}
		// eslint-disable-next-line no-empty
	} catch (e) { }
}
const menu_bar = MenuBar(menus);
if (menu_bar_outside_frame) {
	$(menu_bar.element).insertBefore(frameElement);
} else {
	$(menu_bar.element).prependTo($V);
}

$(menu_bar.element).on("info", (event) => {
	$status_text.text(event.detail?.description ?? "");
});
$(menu_bar.element).on("default-info", () => {
	$status_text.default();
});
// </menu bar>

let $toolbox = $ToolBox(tools);
// let $toolbox2 = $ToolBox(extra_tools, true);//.hide();
// Note: a second $ToolBox doesn't work because they use the same tool options (which could be remedied)
// If there's to be extra tools, they should probably get a window, with different UI
// so it can display names of the tools, and maybe authors and previews (and not necessarily icons)

let $colorbox = $ColorBox($("body").hasClass("vertical-color-box-mode"));

$G.on("vertical-color-box-mode-toggled", () => {
	$colorbox.destroy();
	$colorbox = $ColorBox($("body").hasClass("vertical-color-box-mode"));
	prevent_selection($colorbox);
});
$G.on("eye-gaze-mode-toggled", () => {
	$colorbox.destroy();
	$colorbox = $ColorBox($("body").hasClass("vertical-color-box-mode"));
	prevent_selection($colorbox);

	$toolbox.destroy();
	$toolbox = $ToolBox(tools);
	prevent_selection($toolbox);

	// $toolbox2.destroy();
	// $toolbox2 = $ToolBox(extra_tools, true);
	// prevent_selection($toolbox2);
});


$G.on("resize", () => { // for browser zoom, and in-app zoom of the canvas
	update_canvas_rect();
	update_disable_aa();
});
$canvas_area.on("scroll", () => {
	update_canvas_rect();
});
$canvas_area.on("resize", () => {
	update_magnified_canvas_size();
});

// Despite overflow:hidden on html and body,
// focusing elements that are partially offscreen can still scroll the page.
// For example, with Edit Colors dialog partially offscreen, navigating the color grid.
// We need to prevent (reset) scroll on focus, and also avoid scrollIntoView().
// Listening for scroll here is mainly in case a case is forgotten, like scrollIntoView,
// in which case it will flash sometimes but at least not end up with part of
// the application scrolled off the screen with no scrollbar to get it back.
$G.on("scroll focusin", () => {
	window.scrollTo(0, 0);
});

$("body").on("dragover dragenter", (event) => {
	const dt = event.originalEvent.dataTransfer;
	const has_files = dt && Array.from(dt.types).includes("Files");
	if (has_files) {
		event.preventDefault();
	}
}).on("drop", async (event) => {
	if (event.isDefaultPrevented()) {
		return;
	}
	const dt = event.originalEvent.dataTransfer;
	const has_files = dt && Array.from(dt.types).includes("Files");
	if (has_files) {
		event.preventDefault();
		// @TODO: sort files/items in priority of image, theme, palette
		// and then try loading them in series, with async await to avoid race conditions?
		// or maybe support opening multiple documents in tabs
		// Note: don't use FS Access API in Electron app because:
		// 1. it's faulty (permissions problems, 0 byte files maybe due to the perms problems)
		// 2. we want to save the file.path, which the dt.files code path takes care of
		if (window.FileSystemHandle && !window.is_electron_app) {
			for (const item of dt.items) {
				// kind will be 'file' for file/directory entries.
				if (item.kind === 'file') {
					let handle;
					try {
						handle = await item.getAsFileSystemHandle();
					} catch (error) {
						// I'm not sure when this happens.
						// should this use "An invalid file handle was associated with %1." message?
						show_error_message(localize("File not found."), error);
						return;
					}
					if (handle.kind === 'file') {
						let file;
						try {
							file = await handle.getFile();
						} catch (error) {
							// NotFoundError can happen when the file was moved or deleted,
							// then dragged and dropped via the browser's downloads bar, or some other outdated file listing.
							show_error_message(localize("File not found."), error);
							return;
						}
						open_from_file(file, handle);
						if (window._open_images_serially) {
							// For testing a suite of files:
							await new Promise(resolve => setTimeout(resolve, 500));
						} else {
							// Normal behavior: only open one file.
							return;
						}
					}
					// else if (handle.kind === 'directory') {}
				}
			}
		} else if (dt.files && dt.files.length) {
			if (window._open_images_serially) {
				// For testing a suite of files, such as http://www.schaik.com/pngsuite/
				let i = 0;
				const iid = setInterval(() => {
					console.log("opening", dt.files[i].name);
					open_from_file(dt.files[i]);
					i++;
					if (i >= dt.files.length) {
						clearInterval(iid);
					}
				}, 1500);
			} else {
				// Normal behavior: only open one file.
				open_from_file(dt.files[0]);
			}
		}
	}
});

$G.on("keydown", e => {
	if (e.isDefaultPrevented()) {
		return;
	}
	if (e.key === "Escape") { // Note: Escape handled below too! (after input/textarea return condition)
		if (textbox && textbox.$editor.is(e.target)) {
			deselect();
		}
	}
	if (
		// Ctrl+Shift+Y for history window,
		// chosen because it's related to the undo/redo shortcuts
		// and it looks like a branching symbol.
		(e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey &&
		e.key.toUpperCase() === "Y"
	) {
		show_document_history();
		e.preventDefault();
		return;
	}
	// @TODO: return if menus/menubar focused or focus in dialog window
	// or maybe there's a better way to do this that works more generally
	// maybe it should only handle the event if document.activeElement is the body or html element?
	// (or $app could have a tabIndex and no focus style and be focused under various conditions,
	// if that turned out to make more sense for some reason)
	if (
		e.target instanceof HTMLInputElement ||
		e.target instanceof HTMLTextAreaElement
	) {
		return;
	}

	// @TODO: preventDefault in all cases where the event is handled
	// also, ideally check that modifiers *aren't* pressed
	// probably best to use a library at this point!

	if (selection) {
		const nudge_selection = (delta_x, delta_y) => {
			selection.x += delta_x;
			selection.y += delta_y;
			selection.position();
		};
		switch (e.key) {
			case "ArrowLeft":
				nudge_selection(-1, 0);
				e.preventDefault();
				break;
			case "ArrowRight":
				nudge_selection(+1, 0);
				e.preventDefault();
				break;
			case "ArrowDown":
				nudge_selection(0, +1);
				e.preventDefault();
				break;
			case "ArrowUp":
				nudge_selection(0, -1);
				e.preventDefault();
				break;
		}
	}

	if (e.key === "Escape") { // Note: Escape handled above too!
		if (selection) {
			deselect();
		} else {
			cancel();
		}
		window.stopSimulatingGestures && window.stopSimulatingGestures();
		window.trace_and_sketch_stop && window.trace_and_sketch_stop();
	} else if (e.key === "Enter") {
		if (selection) {
			deselect();
		}
	} else if (e.key === "F1") {
		show_help();
		e.preventDefault();
	} else if (e.key === "F4") {
		redo();
	} else if (e.key === "Delete" || e.key === "Backspace") {
		// alt+backspace: undo
		// shift+delete: cut
		// delete/backspace: delete selection
		if (e.key === "Delete" && e.shiftKey) {
			cut();
		} else if (e.key === "Backspace" && e.altKey) {
			undo();
		} else {
			delete_selection();
		}
		e.preventDefault();
	} else if (e.key === "Insert") {
		// ctrl+insert: copy
		// shift+insert: paste
		if (e.ctrlKey) {
			copy();
			e.preventDefault();
		} else if (e.shiftKey) {
			paste();
			e.preventDefault();
		}
	} else if (
		e.code === "NumpadAdd" ||
		e.code === "NumpadSubtract" ||
		// normal + and - keys
		e.key === "+" ||
		e.key === "-" ||
		e.key === "="
	) {
		const plus = e.code === "NumpadAdd" || e.key === "+" || e.key === "=";
		const minus = e.code === "NumpadSubtract" || e.key === "-";
		const delta = plus - minus; // const delta = +plus++ -minus--; // Δ = ±±±±

		if (selection) {
			selection.scale(2 ** delta);
		} else {
			if (selected_tool.id === TOOL_BRUSH) {
				brush_size = Math.max(1, Math.min(brush_size + delta, 500));
			} else if (selected_tool.id === TOOL_ERASER) {
				eraser_size = Math.max(1, Math.min(eraser_size + delta, 500));
			} else if (selected_tool.id === TOOL_AIRBRUSH) {
				airbrush_size = Math.max(1, Math.min(airbrush_size + delta, 500));
			} else if (selected_tool.id === TOOL_PENCIL) {
				pencil_size = Math.max(1, Math.min(pencil_size + delta, 50));
			} else if (
				selected_tool.id === TOOL_LINE ||
				selected_tool.id === TOOL_CURVE ||
				selected_tool.id === TOOL_RECTANGLE ||
				selected_tool.id === TOOL_ROUNDED_RECTANGLE ||
				selected_tool.id === TOOL_ELLIPSE ||
				selected_tool.id === TOOL_POLYGON
			) {
				stroke_size = Math.max(1, Math.min(stroke_size + delta, 500));
			}

			$G.trigger("option-changed");
			if (button !== undefined && pointer) { // pointer may only be needed for tests
				selected_tools.forEach((selected_tool) => {
					tool_go(selected_tool);
				});
			}
			update_helper_layer();
		}
		e.preventDefault();
		return;
	} else if (e.ctrlKey || e.metaKey) {
		if (textbox) {
			switch (e.key.toUpperCase()) {
				case "A":
				case "Z":
				case "Y":
				case "I":
				case "B":
				case "U":
					// Don't prevent the default. Allow text editing commands.
					return;
			}
		}
		// Ctrl+PageDown: zoom to 400%
		// Ctrl+PageUp: zoom to 100%
		// In Chrome and Firefox, these switch to the next/previous tab,
		// but it's allowed to be overridden in fullscreen in Chrome.
		if (e.key === "PageDown") {
			set_magnification(4);
			e.preventDefault();
			return;
		} else if (e.key === "PageUp") {
			set_magnification(1);
			e.preventDefault();
			return;
		}
		switch (e.key.toUpperCase()) {
			case ",": // '<' without Shift
			case "<":
			case "[":
			case "{":
				rotate(-TAU / 4);
				$canvas_area.trigger("resize");
				break;
			case ".": // '>' without Shift
			case ">":
			case "]":
			case "}":
				rotate(+TAU / 4);
				$canvas_area.trigger("resize");
				break;
			case "Z":
				e.shiftKey ? redo() : undo();
				break;
			case "Y":
				// Ctrl+Shift+Y handled above
				redo();
				break;
			case "G":
				e.shiftKey ? render_history_as_gif() : toggle_grid();
				break;
			case "F":
				if (!e.repeat && !e.originalEvent?.repeat) {
					view_bitmap();
				}
				break;
			case "O":
				file_open();
				break;
			case "S":
				e.shiftKey ? file_save_as() : file_save();
				break;
			case "A":
				select_all();
				break;
			case "I":
				image_invert_colors();
				break;
			case "E":
				image_attributes();
				break;

			// These shortcuts are mostly reserved by browsers,
			// but they are allowed in Electron.
			// The shortcuts are hidden in the menus (or changed) when not in Electron,
			// to prevent accidental closing/refreshing.
			// I'm supporting Alt+<shortcut> here (implicitly) as a workaround (and showing this in the menus in some cases).
			// Also, note that Chrome allows some shortcuts to be overridden in fullscreen (but showing/hiding the shortcuts would be confusing).
			case "N":
				e.shiftKey ? clear() : file_new();
				break;
			case "T":
				$toolbox.toggle();
				break;
			case "L": // allowed to override in Firefox
				$colorbox.toggle();
				break;
			case "R":
				image_flip_and_rotate();
				break;
			case "W":
				image_stretch_and_skew();
				break;

			default:
				return; // don't preventDefault
		}
		e.preventDefault();
		// put nothing below! note return above
	}
});
let alt_zooming = false;
addEventListener("keyup", (e) => {
	if (e.key === "Alt" && alt_zooming) {
		e.preventDefault(); // prevent menu bar from activating in Firefox from zooming
	}
	if (!e.altKey) {
		alt_zooming = false;
	}
});
// $G.on("wheel", (e) => {
addEventListener("wheel", (e) => {
	if (e.altKey) {
		e.preventDefault();
		let new_magnification = magnification;
		if (e.deltaY < 0) {
			new_magnification *= 1.5;
		} else {
			new_magnification /= 1.5;
		}
		new_magnification = Math.max(0.5, Math.min(new_magnification, 80));
		set_magnification(new_magnification, to_canvas_coords(e));
		alt_zooming = true;
		return;
	}
	if (e.ctrlKey || e.metaKey) {
		return;
	}
	// for reference screenshot mode (development helper):
	if (location.hash.match(/compare-reference/i)) { // including compare-reference-tool-windows
		// const delta_opacity = Math.sign(e.originalEvent.deltaY) * -0.1; // since attr() is not supported other than for content, this increment must match CSS
		const delta_opacity = Math.sign(e.deltaY) * -0.2; // since attr() is not supported other than for content, this increment must match CSS
		let old_opacity = parseFloat($("body").attr("data-reference-opacity"));
		if (!isFinite(old_opacity)) {
			old_opacity = 0.5;
		}
		const new_opacity = Math.max(0, Math.min(1, old_opacity + delta_opacity));
		$("body").attr("data-reference-opacity", new_opacity);
		// prevent scrolling, keeping the screenshot lined up
		// e.preventDefault(); // doesn't work
		// $canvas_area.scrollTop(0); // doesn't work with smooth scrolling
		// $canvas_area.scrollLeft(0);
	}
}, { passive: false });

$G.on("cut copy paste", e => {
	if (e.isDefaultPrevented()) {
		return;
	}
	if (
		document.activeElement instanceof HTMLInputElement ||
		document.activeElement instanceof HTMLTextAreaElement ||
		!window.getSelection().isCollapsed
	) {
		// Don't prevent cutting/copying/pasting within inputs or textareas, or if there's a selection
		return;
	}

	e.preventDefault();
	const cd = e.originalEvent.clipboardData || window.clipboardData;
	if (!cd) { return; }

	if (e.type === "copy" || e.type === "cut") {
		if (selection && selection.canvas) {
			const do_sync_clipboard_copy_or_cut = () => {
				// works only for pasting within a jspaint instance
				const data_url = selection.canvas.toDataURL();
				cd.setData("text/x-data-uri; type=image/png", data_url);
				cd.setData("text/uri-list", data_url);
				cd.setData("URL", data_url);
				if (e.type === "cut") {
					delete_selection({
						name: localize("Cut"),
						icon: get_help_folder_icon("p_cut.png"),
					});
				}
			};
			if (!navigator.clipboard || !navigator.clipboard.write) {
				return do_sync_clipboard_copy_or_cut();
			}
			try {
				if (e.type === "cut") {
					edit_cut();
				} else {
					edit_copy();
				}
			} catch (e) {
				do_sync_clipboard_copy_or_cut();
			}
		}
	} else if (e.type === "paste") {
		for (const item of cd.items) {
			if (item.type.match(/^text\/(?:x-data-uri|uri-list|plain)|URL$/)) {
				item.getAsString(text => {
					const uris = get_uris(text);
					if (uris.length > 0) {
						load_image_from_uri(uris[0]).then((info) => {
							paste(info.image || make_canvas(info.image_data));
						}, (error) => {
							show_resource_load_error_message(error);
						});
					} else {
						show_error_message("The information on the Clipboard can't be inserted into Paint.");
					}
				});
				break;
			} else if (item.type.match(/^image\//)) {
				paste_image_from_file(item.getAsFile());
				break;
			}
		}
	}
});

reset_file();
reset_selected_colors();
reset_canvas_and_history(); // (with newly reset colors)
set_magnification(default_magnification);

// this is synchronous for now, but @TODO: handle possibility of loading a document before callback
// when switching to asynchronous storage, e.g. with localforage
storage.get({
	width: default_canvas_width,
	height: default_canvas_height,
}, (err, stored_values) => {
	if (err) { return; }
	my_canvas_width = stored_values.width;
	my_canvas_height = stored_values.height;

	make_or_update_undoable({
		match: (history_node) => history_node.name === localize("New"),
		name: "Resize Canvas For New Document",
		icon: get_help_folder_icon("p_stretch_both.png"),
	}, () => {
		main_canvas.width = Math.max(1, my_canvas_width);
		main_canvas.height = Math.max(1, my_canvas_height);
		main_ctx.disable_image_smoothing();
		if (!transparency) {
			main_ctx.fillStyle = selected_colors.background;
			main_ctx.fillRect(0, 0, main_canvas.width, main_canvas.height);
		}
		$canvas_area.trigger("resize");
	});
});

if (window.initial_system_file_handle) {
	systemHooks.readBlobFromHandle(window.initial_system_file_handle).then(file => {
		if (file) {
			open_from_file(file, window.initial_system_file_handle);
		}
	}, (error) => {
		// this handler is not always called, sometimes error message is shown from readBlobFromHandle
		show_error_message(`Failed to open file ${window.initial_system_file_handle}`, error);
	});
}

const lerp = (a, b, b_ness) => a + (b - a) * b_ness;

const color_ramp = (num_colors, start_hsla, end_hsla) =>
	Array(num_colors).fill().map((_undefined, ramp_index, array) => {
		// TODO: should this use (array.length - 1)?
		const h = lerp(start_hsla[0], end_hsla[0], ramp_index / array.length);
		const s = lerp(start_hsla[1], end_hsla[1], ramp_index / array.length);
		const l = lerp(start_hsla[2], end_hsla[2], ramp_index / array.length);
		const a = lerp(start_hsla[3], end_hsla[3], ramp_index / array.length);
		return `hsla(${h}deg, ${s}%, ${l}%, ${a})`;
	});

const update_palette_from_theme = () => {
	if (get_theme() === "winter.css") {
		const make_stripe_patterns = (reverse) => [
			make_stripe_pattern(reverse, [
				"hsl(166, 93%, 38%)",
				"white",
			]),
			make_stripe_pattern(reverse, [
				"white",
				"hsl(355, 78%, 46%)",
			]),
			make_stripe_pattern(reverse, [
				"hsl(355, 78%, 46%)",
				"white",
				"white",
				"hsl(355, 78%, 46%)",
				"hsl(355, 78%, 46%)",
				"hsl(355, 78%, 46%)",
				"white",
				"white",
				"hsl(355, 78%, 46%)",
				"white",
			], 2),
			make_stripe_pattern(reverse, [
				"hsl(166, 93%, 38%)",
				"white",
				"white",
				"hsl(166, 93%, 38%)",
				"hsl(166, 93%, 38%)",
				"hsl(166, 93%, 38%)",
				"white",
				"white",
				"hsl(166, 93%, 38%)",
				"white",
			], 2),
			make_stripe_pattern(reverse, [
				"hsl(166, 93%, 38%)",
				"white",
				"hsl(355, 78%, 46%)",
				"white",
			], 2),
		];
		palette = [
			"black",
			// green
			"hsl(91, 55%, 81%)",
			"hsl(142, 57%, 64%)",
			"hsl(166, 93%, 38%)",
			"#04ce1f", // elf green
			"hsl(159, 93%, 16%)",
			// red
			"hsl(2, 77%, 27%)",
			"hsl(350, 100%, 50%)",
			"hsl(356, 97%, 64%)",
			// brown
			"#ad4632",
			"#5b3b1d",
			// stripes
			...make_stripe_patterns(false),
			// white to blue
			...color_ramp(
				6,
				[200, 100, 100, 100],
				[200, 100, 10, 100],
			),
			// pink
			"#fcbaf8",
			// silver
			"hsl(0, 0%, 90%)",
			"hsl(22, 5%, 71%)",
			// gold
			"hsl(48, 82%, 54%)",
			"hsl(49, 82%, 72%)",
			// stripes
			...make_stripe_patterns(true),
		];
		$colorbox.rebuild_palette();
	} else {
		palette = default_palette;
		$colorbox.rebuild_palette();
	}
};

$G.on("theme-load", update_palette_from_theme);
update_palette_from_theme();

function to_canvas_coords({ clientX, clientY }) {
	if (clientX === undefined || clientY === undefined) {
		throw new TypeError("clientX and clientY must be defined (not {x, y} or x, y or [x, y])");
	}
	const rect = canvas_bounding_client_rect;
	return {
		x: ~~((clientX - rect.left) / rect.width * main_canvas.width),
		y: ~~((clientY - rect.top) / rect.height * main_canvas.height),
	};
}
function from_canvas_coords({ x, y }) {
	const rect = canvas_bounding_client_rect;
	return {
		clientX: ~~(x / main_canvas.width * rect.width + rect.left),
		clientY: ~~(y / main_canvas.height * rect.height + rect.top),
	};
}

function update_fill_and_stroke_colors_and_lineWidth(selected_tool) {
	main_ctx.lineWidth = stroke_size;

	const reverse_because_fill_only = selected_tool.$options && selected_tool.$options.fill && !selected_tool.$options.stroke;
	main_ctx.fillStyle = fill_color =
		main_ctx.strokeStyle = stroke_color =
		selected_colors[
		(ctrl && selected_colors.ternary && pointer_active) ? "ternary" :
			((reverse ^ reverse_because_fill_only) ? "background" : "foreground")
		];

	fill_color_k =
		stroke_color_k =
		ctrl ? "ternary" : ((reverse ^ reverse_because_fill_only) ? "background" : "foreground");

	if (selected_tool.shape || selected_tool.shape_colors) {
		if (!selected_tool.stroke_only) {
			if ((reverse ^ reverse_because_fill_only)) {
				fill_color_k = "foreground";
				stroke_color_k = "background";
			} else {
				fill_color_k = "background";
				stroke_color_k = "foreground";
			}
		}
		main_ctx.fillStyle = fill_color = selected_colors[fill_color_k];
		main_ctx.strokeStyle = stroke_color = selected_colors[stroke_color_k];
	}
}

function tool_go(selected_tool, event_name) {
	update_fill_and_stroke_colors_and_lineWidth(selected_tool);

	if (selected_tool[event_name]) {
		selected_tool[event_name](main_ctx, pointer.x, pointer.y);
	}
	if (selected_tool.paint) {
		selected_tool.paint(main_ctx, pointer.x, pointer.y);
	}
}
function canvas_pointer_move(e) {
	ctrl = e.ctrlKey;
	shift = e.shiftKey;
	pointer = to_canvas_coords(e);

	// Quick Undo (for mouse/pen)
	// (Note: pointermove also occurs when the set of buttons pressed changes,
	// except when another event would fire like pointerdown)
	if (pointers.length && e.button != -1) {
		// compare buttons other than middle mouse button by using bitwise OR to make that bit of the number the same
		const MMB = 4;
		if (e.pointerType != pointer_type || (e.buttons | MMB) != (pointer_buttons | MMB)) {
			cancel();
			pointer_active = false; // NOTE: pointer_active used in cancel()
			return;
		}
	}

	if (e.shiftKey) {
		if (
			selected_tool.id === TOOL_LINE ||
			selected_tool.id === TOOL_CURVE
		) {
			// snap to eight directions
			const dist = Math.sqrt(
				(pointer.y - pointer_start.y) * (pointer.y - pointer_start.y) +
				(pointer.x - pointer_start.x) * (pointer.x - pointer_start.x)
			);
			const eighth_turn = TAU / 8;
			const angle_0_to_8 = Math.atan2(pointer.y - pointer_start.y, pointer.x - pointer_start.x) / eighth_turn;
			const angle = Math.round(angle_0_to_8) * eighth_turn;
			pointer.x = Math.round(pointer_start.x + Math.cos(angle) * dist);
			pointer.y = Math.round(pointer_start.y + Math.sin(angle) * dist);
		} else if (selected_tool.shape) {
			// snap to four diagonals
			const w = Math.abs(pointer.x - pointer_start.x);
			const h = Math.abs(pointer.y - pointer_start.y);
			if (w < h) {
				if (pointer.y > pointer_start.y) {
					pointer.y = pointer_start.y + w;
				} else {
					pointer.y = pointer_start.y - w;
				}
			} else {
				if (pointer.x > pointer_start.x) {
					pointer.x = pointer_start.x + h;
				} else {
					pointer.x = pointer_start.x - h;
				}
			}
		}
	}
	selected_tools.forEach((selected_tool) => {
		tool_go(selected_tool);
	});
	pointer_previous = pointer;
}
$canvas.on("pointermove", e => {
	pointer = to_canvas_coords(e);
	$status_position.text(`${pointer.x},${pointer.y}`);
});
$canvas.on("pointerenter", (e) => {
	pointer_over_canvas = true;

	update_helper_layer(e);

	if (!update_helper_layer_on_pointermove_active) {
		$G.on("pointermove", update_helper_layer);
		update_helper_layer_on_pointermove_active = true;
	}
});
$canvas.on("pointerleave", (e) => {
	pointer_over_canvas = false;

	$status_position.text("");

	update_helper_layer(e);

	if (!pointer_active && update_helper_layer_on_pointermove_active) {
		$G.off("pointermove", update_helper_layer);
		update_helper_layer_on_pointermove_active = false;
	}
});

let clean_up_eye_gaze_mode = () => { };
$G.on("eye-gaze-mode-toggled", () => {
	if ($("body").hasClass("eye-gaze-mode")) {
		init_eye_gaze_mode();
	} else {
		clean_up_eye_gaze_mode();
	}
});
if ($("body").hasClass("eye-gaze-mode")) {
	init_eye_gaze_mode();
}

const eye_gaze_mode_config = {
	targets: `
		button:not([disabled]),
		input,
		textarea,
		label,
		a,
		.flip-and-rotate .sub-options .radio-wrapper,
		.current-colors,
		.color-button,
		.edit-colors-window .swatch,
		.edit-colors-window .rainbow-canvas,
		.edit-colors-window .luminosity-canvas,
		.tool:not(.selected),
		.chooser-option,
		.menu-button:not(.active),
		.menu-item,
		.main-canvas,
		.selection canvas,
		.handle,
		.grab-region,
		.window:not(.maximized) .window-titlebar,
		.history-entry
	`,
	noCenter: (target) => (
		target.matches(`
			.main-canvas,
			.selection canvas,
			.window-titlebar,
			.rainbow-canvas,
			.luminosity-canvas,
			input[type="range"]
		`)
	),
	retarget: [
		// Nudge hovers near the edges of the canvas onto the canvas
		{ from: ".canvas-area", to: ".main-canvas", withinMargin: 50 },
		// Top level menus are just immediately switched between for now.
		// Prevent awkward hover clicks on top level menu buttons while menus are open.
		{
			from: (target) => (
				(target.closest(".menu-button") || target.matches(".menu-container")) &&
				document.querySelector(".menu-button.active") != null
			),
			to: null,
		},
		// Can we make it easier to click on help topics with short names?
		// { from: ".help-window li", to: (target) => target.querySelector(".item")},
	],
	isEquivalentTarget: (apparent_hover_target, hover_target) => (
		apparent_hover_target.closest("label") === hover_target ||
		apparent_hover_target.closest(".radio-wrapper") === hover_target
	),
	dwellClickEvenIfPaused: (target) => (
		target.matches(".toggle-dwell-clicking")
	),
	shouldDrag: (target) => (
		target.matches(".window-titlebar, .window-titlebar *:not(button)") ||
		target.matches(".selection, .selection *, .handle, .grab-region") ||
		(
			target === main_canvas &&
			selected_tool.id !== TOOL_PICK_COLOR &&
			selected_tool.id !== TOOL_FILL &&
			selected_tool.id !== TOOL_MAGNIFIER &&
			selected_tool.id !== TOOL_POLYGON &&
			selected_tool.id !== TOOL_CURVE
		)
	),
	click: ({ target, x, y }) => {
		if (target.matches("button:not(.toggle)")) {
			target.style.borderImage = "var(--inset-deep-border-image)";
			setTimeout(() => {
				target.style.borderImage = "";
				// delay the button.click() as well, so the pressed state is
				// visible even if the button closes a dialog
				window.untrusted_gesture = true;
				target.click();
				window.untrusted_gesture = false;
			}, 100);
		} else if (target.matches("input[type='range']")) {
			const rect = target.getBoundingClientRect();
			const vertical =
				target.getAttribute("orient") === "vertical" ||
				(getCurrentRotation(target) !== 0) ||
				rect.height > rect.width;
			const min = Number(target.min);
			const max = Number(target.max);
			const v = (
				vertical ?
					(y - rect.top) / rect.height :
					(x - rect.left) / rect.width
			) * (max - min) + min;
			target.value = v;
			window.untrusted_gesture = true;
			target.dispatchEvent(new Event("input", { bubbles: true }));
			target.dispatchEvent(new Event("change", { bubbles: true }));
			window.untrusted_gesture = false;
		} else {
			window.untrusted_gesture = true;
			target.click();
			if (target.matches("input, textarea")) {
				target.focus();
			}
			window.untrusted_gesture = false;
		}
		// Source: https://stackoverflow.com/a/54492696/2624876
		function getCurrentRotation(el) {
			const st = window.getComputedStyle(el, null);
			const tm = st.getPropertyValue("-webkit-transform") ||
				st.getPropertyValue("-moz-transform") ||
				st.getPropertyValue("-ms-transform") ||
				st.getPropertyValue("-o-transform") ||
				st.getPropertyValue("transform") ||
				"none";
			if (tm !== "none") {
				const [a, b] = tm.split('(')[1].split(')')[0].split(',');
				return Math.round(Math.atan2(a, b) * (180 / Math.PI));
			}
			return 0;
		}
	},
};

var enable_tracky_mouse = false;
var tracky_mouse_deps_promise;

async function init_eye_gaze_mode() {
	if (enable_tracky_mouse) {
		if (!tracky_mouse_deps_promise) {
			TrackyMouse.dependenciesRoot = "lib/tracky-mouse";
			tracky_mouse_deps_promise = TrackyMouse.loadDependencies();
		}
		await tracky_mouse_deps_promise;

		const $tracky_mouse_window = $Window({
			title: "Tracky Mouse",
			icon: "tracky-mouse",
		});
		$tracky_mouse_window.addClass("tracky-mouse-window");
		const tracky_mouse_container = $tracky_mouse_window.$content[0];

		TrackyMouse.init(tracky_mouse_container);
		TrackyMouse.useCamera();

		$tracky_mouse_window.center();

		let last_el_over;
		TrackyMouse.onPointerMove = (x, y) => {
			const target = document.elementFromPoint(x, y) || document.body;
			if (target !== last_el_over) {
				if (last_el_over) {
					window.untrusted_gesture = true;
					const event = new /*PointerEvent*/$.Event("pointerleave", Object.assign(get_event_options({ x, y }), {
						button: 0,
						buttons: 1,
						bubbles: false,
						cancelable: false,
					}));
					// last_el_over.dispatchEvent(event);
					$(last_el_over).trigger(event);
					window.untrusted_gesture = false;
				}
				window.untrusted_gesture = true;
				const event = new /*PointerEvent*/$.Event("pointerenter", Object.assign(get_event_options({ x, y }), {
					button: 0,
					buttons: 1,
					bubbles: false,
					cancelable: false,
				}));
				// target.dispatchEvent(event);
				$(target).trigger(event);
				window.untrusted_gesture = false;
				last_el_over = target;
			}
			window.untrusted_gesture = true;
			const event = new PointerEvent/*$.Event*/("pointermove", Object.assign(get_event_options({ x, y }), {
				button: 0,
				buttons: 1,
			}));
			target.dispatchEvent(event);
			// $(target).trigger(event);
			window.untrusted_gesture = false;
		};

		// tracky_mouse_container.querySelector(".tracky-mouse-canvas").classList.add("inset-deep");

	}

	const circle_radius_max = 50; // dwell indicator size in pixels
	const hover_timespan = 500; // how long between the dwell indicator appearing and triggering a click
	const averaging_window_timespan = 500;
	const inactive_at_startup_timespan = 1500; // (should be at least averaging_window_timespan, but more importantly enough to make it not awkward when enabling eye gaze mode)
	const inactive_after_release_timespan = 1000; // after click or drag release (from dwell or otherwise)
	const inactive_after_hovered_timespan = 1000; // after dwell click indicator appears; does not control the time to finish that dwell click, only to click on something else after this is canceled (but it doesn't control that directly)
	const inactive_after_invalid_timespan = 1000; // after a dwell click is canceled due to an element popping up in front, or existing in front at the center of the other element
	const inactive_after_focused_timespan = 1000; // after page becomes focused after being unfocused
	let recent_points = [];
	let inactive_until_time = Date.now();
	let paused = false;
	let hover_candidate;
	let gaze_dragging = null;

	const deactivate_for_at_least = (timespan) => {
		inactive_until_time = Math.max(inactive_until_time, Date.now() + timespan);
	};
	deactivate_for_at_least(inactive_at_startup_timespan);

	const halo = document.createElement("div");
	halo.className = "hover-halo";
	halo.style.display = "none";
	document.body.appendChild(halo);
	const dwell_indicator = document.createElement("div");
	dwell_indicator.className = "dwell-indicator";
	dwell_indicator.style.width = `${circle_radius_max}px`;
	dwell_indicator.style.height = `${circle_radius_max}px`;
	dwell_indicator.style.display = "none";
	document.body.appendChild(dwell_indicator);

	const on_pointer_move = (e) => {
		recent_points.push({ x: e.clientX, y: e.clientY, time: Date.now() });
	};
	const on_pointer_up_or_cancel = (e) => {
		deactivate_for_at_least(inactive_after_release_timespan);
		gaze_dragging = null;
	};

	let page_focused = document.visibilityState === "visible"; // guess/assumption
	let mouse_inside_page = true; // assumption
	const on_focus = () => {
		page_focused = true;
		deactivate_for_at_least(inactive_after_focused_timespan);
	};
	const on_blur = () => {
		page_focused = false;
	};
	const on_mouse_leave_page = () => {
		mouse_inside_page = false;
	};
	const on_mouse_enter_page = () => {
		mouse_inside_page = true;
	};

	window.addEventListener("pointermove", on_pointer_move);
	window.addEventListener("pointerup", on_pointer_up_or_cancel);
	window.addEventListener("pointercancel", on_pointer_up_or_cancel);
	window.addEventListener("focus", on_focus);
	window.addEventListener("blur", on_blur);
	document.addEventListener("mouseleave", on_mouse_leave_page);
	document.addEventListener("mouseenter", on_mouse_enter_page);

	const get_hover_candidate = (clientX, clientY) => {

		if (!page_focused || !mouse_inside_page) return null;

		let target = document.elementFromPoint(clientX, clientY);
		if (!target) {
			return null;
		}

		let hover_candidate = {
			x: clientX,
			y: clientY,
			time: Date.now(),
		};

		let retargeted = false;
		for (const { from, to, withinMargin = Infinity } of eye_gaze_mode_config.retarget) {
			if (
				from instanceof Element ? from === target :
					typeof from === "function" ? from(target) :
						target.matches(from)
			) {
				const to_element =
					(to instanceof Element || to === null) ? to :
						typeof to === "function" ? to(target) :
							(target.closest(to) || target.querySelector(to));
				if (to_element === null) {
					return null;
				} else if (to_element) {
					const to_rect = to_element.getBoundingClientRect();
					if (
						hover_candidate.x > to_rect.left - withinMargin &&
						hover_candidate.y > to_rect.top - withinMargin &&
						hover_candidate.x < to_rect.right + withinMargin &&
						hover_candidate.y < to_rect.bottom + withinMargin
					) {
						target = to_element;
						hover_candidate.x = Math.min(
							to_rect.right - 1,
							Math.max(
								to_rect.left,
								hover_candidate.x,
							),
						);
						hover_candidate.y = Math.min(
							to_rect.bottom - 1,
							Math.max(
								to_rect.top,
								hover_candidate.y,
							),
						);
						retargeted = true;
					}
				}
			}
		}

		if (!retargeted) {
			target = target.closest(eye_gaze_mode_config.targets);

			if (!target) {
				return null;
			}
		}

		if (!eye_gaze_mode_config.noCenter(target)) {
			// Nudge hover previews to the center of buttons and things
			const rect = target.getBoundingClientRect();
			hover_candidate.x = rect.left + rect.width / 2;
			hover_candidate.y = rect.top + rect.height / 2;
		}
		hover_candidate.target = target;
		return hover_candidate;
	};

	const get_event_options = ({ x, y }) => {
		return {
			view: window, // needed for offsetX/Y calculation
			clientX: x,
			clientY: y,
			pointerId: 1234567890,
			pointerType: "mouse",
			isPrimary: true,
			bubbles: true,
			cancelable: true,
		};
	};

	const update = () => {
		const time = Date.now();
		recent_points = recent_points.filter((point_record) => time < point_record.time + averaging_window_timespan);
		if (recent_points.length) {
			const latest_point = recent_points[recent_points.length - 1];
			recent_points.push({ x: latest_point.x, y: latest_point.y, time });
			const average_point = average_points(recent_points);
			// debug
			// const canvas_point = to_canvas_coords({clientX: average_point.x, clientY: average_point.y});
			// ctx.fillStyle = "red";
			// ctx.fillRect(canvas_point.x, canvas_point.y, 10, 10);
			const recent_movement_amount = Math.hypot(latest_point.x - average_point.x, latest_point.y - average_point.y);

			// Invalidate in case an element pops up in front of the element you're hovering over, e.g. a submenu
			// (that use case doesn't actually work because the menu pops up before the hover_candidate exists)
			// (TODO: disable hovering to open submenus in eye gaze mode)
			// or an element occludes the center of an element you're hovering over, in which case it
			// could be confusing if it showed a dwell click indicator over a different element than it would click
			// (but TODO: just move the indicator off center in that case)
			if (hover_candidate && !gaze_dragging) {
				const apparent_hover_candidate = get_hover_candidate(hover_candidate.x, hover_candidate.y);
				const show_occluder_indicator = (occluder) => {
					const occluder_indicator = document.createElement("div");
					const occluder_rect = occluder.getBoundingClientRect();
					const outline_width = 4;
					occluder_indicator.style.pointerEvents = "none";
					occluder_indicator.style.zIndex = 1000001;
					occluder_indicator.style.display = "block";
					occluder_indicator.style.position = "fixed";
					occluder_indicator.style.left = `${occluder_rect.left + outline_width}px`;
					occluder_indicator.style.top = `${occluder_rect.top + outline_width}px`;
					occluder_indicator.style.width = `${occluder_rect.width - outline_width * 2}px`;
					occluder_indicator.style.height = `${occluder_rect.height - outline_width * 2}px`;
					occluder_indicator.style.outline = `${outline_width}px dashed red`;
					occluder_indicator.style.boxShadow = `0 0 ${outline_width}px ${outline_width}px maroon`;
					document.body.appendChild(occluder_indicator);
					setTimeout(() => {
						occluder_indicator.remove();
					}, inactive_after_invalid_timespan * 0.5);
				};
				if (apparent_hover_candidate) {
					if (
						apparent_hover_candidate.target !== hover_candidate.target &&
						// !retargeted &&
						!eye_gaze_mode_config.isEquivalentTarget(
							apparent_hover_candidate.target, hover_candidate.target
						)
					) {
						hover_candidate = null;
						deactivate_for_at_least(inactive_after_invalid_timespan);
						show_occluder_indicator(apparent_hover_candidate.target);
					}
				} else {
					let occluder = document.elementFromPoint(hover_candidate.x, hover_candidate.y);
					hover_candidate = null;
					deactivate_for_at_least(inactive_after_invalid_timespan);
					show_occluder_indicator(occluder || document.body);
				}
			}

			let circle_position = latest_point;
			let circle_opacity = 0;
			let circle_radius = 0;
			if (hover_candidate) {
				circle_position = hover_candidate;
				circle_opacity = 0.4;
				circle_radius =
					(hover_candidate.time - time + hover_timespan) / hover_timespan
					* circle_radius_max;
				if (time > hover_candidate.time + hover_timespan) {
					if (pointer_active || gaze_dragging) {
						window.untrusted_gesture = true;
						hover_candidate.target.dispatchEvent(new PointerEvent("pointerup",
							Object.assign(get_event_options(hover_candidate), {
								button: 0,
								buttons: 0,
							})
						));
						window.untrusted_gesture = false;
					} else {
						pointers = []; // prevent multi-touch panning
						window.untrusted_gesture = true;
						hover_candidate.target.dispatchEvent(new PointerEvent("pointerdown",
							Object.assign(get_event_options(hover_candidate), {
								button: 0,
								buttons: 1,
							})
						));
						window.untrusted_gesture = false;
						if (eye_gaze_mode_config.shouldDrag(hover_candidate.target)) {
							gaze_dragging = hover_candidate.target;
						} else {
							window.untrusted_gesture = true;
							hover_candidate.target.dispatchEvent(new PointerEvent("pointerup",
								Object.assign(get_event_options(hover_candidate), {
									button: 0,
									buttons: 0,
								})
							));
							eye_gaze_mode_config.click(hover_candidate);
							window.untrusted_gesture = false;
						}
					}
					hover_candidate = null;
					deactivate_for_at_least(inactive_after_hovered_timespan);
				}
			}

			if (gaze_dragging) {
				dwell_indicator.classList.add("for-release");
			} else {
				dwell_indicator.classList.remove("for-release");
			}
			dwell_indicator.style.display = "";
			dwell_indicator.style.opacity = circle_opacity;
			dwell_indicator.style.transform = `scale(${circle_radius / circle_radius_max})`;
			dwell_indicator.style.left = `${circle_position.x - circle_radius_max / 2}px`;
			dwell_indicator.style.top = `${circle_position.y - circle_radius_max / 2}px`;

			let halo_target =
				gaze_dragging ||
				(hover_candidate || get_hover_candidate(latest_point.x, latest_point.y) || {}).target;

			if (halo_target && (!paused || eye_gaze_mode_config.dwellClickEvenIfPaused(halo_target))) {
				let rect = halo_target.getBoundingClientRect();
				const computed_style = getComputedStyle(halo_target);
				let ancestor = halo_target;
				let border_radius_scale = 1; // for border radius mimicry, given parents with transform: scale()
				while (ancestor instanceof HTMLElement) {
					const ancestor_computed_style = getComputedStyle(ancestor);
					if (ancestor_computed_style.transform) {
						// Collect scale transforms
						const match = ancestor_computed_style.transform.match(/(?:scale|matrix)\((\d+(?:\.\d+)?)/);
						if (match) {
							border_radius_scale *= Number(match[1]);
						}
					}
					if (ancestor_computed_style.overflow !== "visible") {
						// Clamp to visible region if in scrollable area
						// This lets you see the hover halo when scrolled to the middle of a large canvas
						const scroll_area_rect = ancestor.getBoundingClientRect();
						rect = {
							left: Math.max(rect.left, scroll_area_rect.left),
							top: Math.max(rect.top, scroll_area_rect.top),
							right: Math.min(rect.right, scroll_area_rect.right),
							bottom: Math.min(rect.bottom, scroll_area_rect.bottom),
						};
						rect.width = rect.right - rect.left;
						rect.height = rect.bottom - rect.top;
					}
					ancestor = ancestor.parentNode;
				}
				halo.style.display = "block";
				halo.style.position = "fixed";
				halo.style.left = `${rect.left}px`;
				halo.style.top = `${rect.top}px`;
				halo.style.width = `${rect.width}px`;
				halo.style.height = `${rect.height}px`;
				// shorthand properties might not work in all browsers (not tested)
				// this is so overkill...
				halo.style.borderTopRightRadius = `${parseFloat(computed_style.borderTopRightRadius) * border_radius_scale}px`;
				halo.style.borderTopLeftRadius = `${parseFloat(computed_style.borderTopLeftRadius) * border_radius_scale}px`;
				halo.style.borderBottomRightRadius = `${parseFloat(computed_style.borderBottomRightRadius) * border_radius_scale}px`;
				halo.style.borderBottomLeftRadius = `${parseFloat(computed_style.borderBottomLeftRadius) * border_radius_scale}px`;
			} else {
				halo.style.display = "none";
			}

			if (time < inactive_until_time) {
				return;
			}
			if (recent_movement_amount < 5) {
				if (!hover_candidate) {
					hover_candidate = {
						x: average_point.x,
						y: average_point.y,
						time: Date.now(),
						target: gaze_dragging || null,
					};
					if (!gaze_dragging) {
						hover_candidate = get_hover_candidate(hover_candidate.x, hover_candidate.y);
					}
					if (hover_candidate && (paused && !eye_gaze_mode_config.dwellClickEvenIfPaused(hover_candidate.target))) {
						hover_candidate = null;
					}
				}
			}
			if (recent_movement_amount > 100) {
				if (gaze_dragging) {
					window.untrusted_gesture = true;
					window.dispatchEvent(new PointerEvent("pointerup",
						Object.assign(get_event_options(average_point), {
							button: 0,
							buttons: 0,
						})
					));
					window.untrusted_gesture = false;
					pointers = []; // prevent multi-touch panning
				}
			}
			if (recent_movement_amount > 60) {
				hover_candidate = null;
			}
		}
	};
	let raf_id;
	const animate = () => {
		raf_id = requestAnimationFrame(animate);
		update();
	};
	raf_id = requestAnimationFrame(animate);

	const $floating_buttons =
		$("<div class='eye-gaze-mode-floating-buttons'/>")
			.appendTo("body");

	$("<button title='Undo' class='eye-gaze-mode-undo-button'/>")
		.on("click", undo)
		.appendTo($floating_buttons)
		.append(
			$("<div class='button-icon'>")
		);

	// These are matched on exactly, for code that provides speech command synonyms
	const pause_button_text = "Pause Dwell Clicking";
	const resume_button_text = "Resume Dwell Clicking";

	const $pause_button = $(`<button class="toggle-dwell-clicking"/>`)
		.attr("title", pause_button_text)
		.on("click", () => {
			paused = !paused;
			$("body").toggleClass("eye-gaze-mode-paused", paused);
			$pause_button.attr("title", paused ? resume_button_text : pause_button_text);
		})
		.appendTo($floating_buttons)
		.append(
			$("<div class='button-icon'>")
		);

	clean_up_eye_gaze_mode = () => {
		console.log("Cleaning up / disabling eye gaze mode");
		cancelAnimationFrame(raf_id);
		halo.remove();
		dwell_indicator.remove();
		$floating_buttons.remove();
		window.removeEventListener("pointermove", on_pointer_move);
		window.removeEventListener("pointerup", on_pointer_up_or_cancel);
		window.removeEventListener("pointercancel", on_pointer_up_or_cancel);
		window.removeEventListener("focus", on_focus);
		window.removeEventListener("blur", on_blur);
		document.removeEventListener("mouseleave", on_mouse_leave_page);
		document.removeEventListener("mouseenter", on_mouse_enter_page);
		clean_up_eye_gaze_mode = () => { };
	};
}

let last_zoom_pointer_distance;
let pan_last_pos;
let pan_start_magnification; // for panning and zooming in the same gesture
let first_pointer_time;
const discard_quick_undo_period = 500; // milliseconds in which to treat gesture as just a pan/zoom if you use two fingers, rather than treating it as a brush stroke you might care about
function average_points(points) {
	const average = { x: 0, y: 0 };
	for (const pointer of points) {
		average.x += pointer.x;
		average.y += pointer.y;
	}
	average.x /= points.length;
	average.y /= points.length;
	return average;
}
$canvas_area.on("pointerdown", (event) => {
	if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
		// Allow unfocusing dialogs etc. in order to use keyboard shortcuts
		document.activeElement.blur();
	}

	if (pointers.every((pointer) =>
		// prevent multitouch panning in case of synthetic events from eye gaze mode
		pointer.pointerId !== 1234567890 &&
		// prevent multitouch panning in case of dragging across iframe boundary with a mouse/pen
		// Note: there can be multiple active primary pointers, one per pointer type
		!(pointer.isPrimary && (pointer.pointerType === "mouse" || pointer.pointerType === "pen"))
		// @TODO: handle case of dragging across iframe boundary with touch
	)) {
		pointers.push({
			pointerId: event.pointerId,
			pointerType: event.pointerType,
			// isPrimary not available on jQuery.Event, and originalEvent not available in synthetic case
			isPrimary: event.originalEvent && event.originalEvent.isPrimary || event.isPrimary,
			x: event.clientX,
			y: event.clientY,
		});
	}
	if (pointers.length === 1) {
		first_pointer_time = performance.now();
	}
	if (pointers.length == 2) {
		last_zoom_pointer_distance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
		pan_last_pos = average_points(pointers);
		pan_start_magnification = magnification;
	}
	// Quick Undo when there are multiple pointers (i.e. for touch)
	// See pointermove for other pointer types
	// SEE OTHER POINTERDOWN HANDLER ALSO
	if (pointers.length >= 2) {
		// If you press two fingers quickly, it shouldn't make a new history entry.
		// But if you draw something and then press a second finger to clear it, it should let you redo.
		const discard_document_state = first_pointer_time && performance.now() - first_pointer_time < discard_quick_undo_period;
		cancel(false, discard_document_state);
		pointer_active = false; // NOTE: pointer_active used in cancel(); must be set after cancel()
		return;
	}
});
$G.on("pointerup pointercancel", (event) => {
	pointers = pointers.filter((pointer) =>
		pointer.pointerId !== event.pointerId
	);
});
$G.on("pointermove", (event) => {
	for (const pointer of pointers) {
		if (pointer.pointerId === event.pointerId) {
			pointer.x = event.clientX;
			pointer.y = event.clientY;
		}
	}
	if (pointers.length >= 2) {
		const current_pos = average_points(pointers);
		const distance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
		const difference_in_distance = distance - last_zoom_pointer_distance;
		let new_magnification = magnification;
		if (Math.abs(difference_in_distance) > 60) {
			last_zoom_pointer_distance = distance;
			if (difference_in_distance > 0) {
				new_magnification *= 1.5;
			} else {
				new_magnification /= 1.5;
			}
		}
		new_magnification = Math.max(0.5, Math.min(new_magnification, 40));
		if (new_magnification != magnification) {
			set_magnification(new_magnification, to_canvas_coords({ clientX: current_pos.x, clientY: current_pos.y }));
		}
		const difference_in_x = current_pos.x - pan_last_pos.x;
		const difference_in_y = current_pos.y - pan_last_pos.y;
		$canvas_area.scrollLeft($canvas_area.scrollLeft() - difference_in_x);
		$canvas_area.scrollTop($canvas_area.scrollTop() - difference_in_y);
		pan_last_pos = current_pos;
	}
});

// window.onerror = show_error_message;

$canvas.on("pointerdown", e => {
	update_canvas_rect();

	// Quick Undo when there are multiple pointers (i.e. for touch)
	// see pointermove for other pointer types
	// SEE OTHER POINTERDOWN HANDLER ALSO
	// NOTE: this relies on event handler order for pointerdown
	// pointer is not added to pointers yet
	if (pointers.length >= 1) {
		// If you press two fingers quickly, it shouldn't make a new history entry.
		// But if you draw something and then press a second finger to clear it, it should let you redo.
		const discard_document_state = first_pointer_time && performance.now() - first_pointer_time < discard_quick_undo_period;
		cancel(false, discard_document_state);
		pointer_active = false; // NOTE: pointer_active used in cancel(); must be set after cancel()

		// in eye gaze mode, allow drawing with mouse after canceling gaze gesture with mouse
		pointers = pointers.filter((pointer) =>
			pointer.pointerId !== 1234567890
		);
		return;
	}

	history_node_to_cancel_to = current_history_node;

	pointer_active = !!(e.buttons & (1 | 2)); // as far as tools are concerned
	pointer_type = e.pointerType;
	pointer_buttons = e.buttons;
	$G.one("pointerup", (e) => {
		pointer_active = false;
		update_helper_layer(e);

		if (!pointer_over_canvas && update_helper_layer_on_pointermove_active) {
			$G.off("pointermove", update_helper_layer);
			update_helper_layer_on_pointermove_active = false;
		}
	});

	if (e.button === 0) {
		reverse = false;
	} else if (e.button === 2) {
		reverse = true;
	} else {
		return;
	}

	button = e.button;
	ctrl = e.ctrlKey;
	shift = e.shiftKey;
	pointer_start = pointer_previous = pointer = to_canvas_coords(e);

	const pointerdown_action = () => {
		let interval_ids = [];
		selected_tools.forEach((selected_tool) => {
			if (selected_tool.paint || selected_tool.pointerdown) {
				tool_go(selected_tool, "pointerdown");
			}
			if (selected_tool.paint_on_time_interval != null) {
				interval_ids.push(setInterval(() => {
					tool_go(selected_tool);
				}, selected_tool.paint_on_time_interval));
			}
		});

		$G.on("pointermove", canvas_pointer_move);

		$G.one("pointerup", (e, canceling, no_undoable) => {
			button = undefined;
			reverse = false;

			if (e.clientX !== undefined) { // may be synthetic event without coordinates
				pointer = to_canvas_coords(e);
			}
			// don't create undoables if you're two-finger-panning
			// @TODO: do any tools use pointerup for cleanup?
			if (!no_undoable) {
				selected_tools.forEach((selected_tool) => {
					selected_tool.pointerup && selected_tool.pointerup(main_ctx, pointer.x, pointer.y);
				});
			}

			if (selected_tools.length === 1) {
				if (selected_tool.deselect) {
					select_tools(return_to_tools);
				}
			}
			$G.off("pointermove", canvas_pointer_move);
			for (const interval_id of interval_ids) {
				clearInterval(interval_id);
			}

			if (!canceling) {
				history_node_to_cancel_to = null;
			}
		});
	};

	pointerdown_action();

	update_helper_layer(e);
});

$canvas_area.on("pointerdown", e => {
	if (e.button === 0) {
		if ($canvas_area.is(e.target)) {
			if (selection) {
				deselect();
			}
		}
	}
});

function prevent_selection($el) {
	$el.on("mousedown selectstart contextmenu", (e) => {
		if (e.isDefaultPrevented()) {
			return;
		}
		if (
			e.target instanceof HTMLSelectElement ||
			e.target instanceof HTMLTextAreaElement ||
			(e.target instanceof HTMLLabelElement && e.type !== "contextmenu") ||
			(e.target instanceof HTMLInputElement && e.target.type !== "color")
		) {
			return;
		}
		if (e.button === 1) {
			return; // allow middle-click scrolling
		}
		e.preventDefault();
		// we're just trying to prevent selection
		// but part of the default for mousedown is *deselection*
		// so we have to do that ourselves explicitly
		window.getSelection().removeAllRanges();
	});
}

prevent_selection($app);
prevent_selection($toolbox);
// prevent_selection($toolbox2);
prevent_selection($colorbox);

// Stop drawing (or dragging or whatever) if you Alt+Tab or whatever
$G.on("blur", () => {
	$G.triggerHandler("pointerup");
});

// For Safari on iPad, Fullscreen mode overlays the system bar, completely obscuring our menu bar.
// See CSS .fullscreen handling (and exit_fullscreen_if_ios) for more info.
function iOS() {
	return [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	].includes(navigator.platform) ||
		// iPad on iOS 13 detection
		(navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
$("html").toggleClass("ios", iOS());
$G.on("fullscreenchange webkitfullscreenchange", () => {
	// const fullscreen = $G.is(":fullscreen") || $G.is(":-webkit-full-screen"); // gives "Script error."
	const fullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
	// $status_text.text(`fullscreen: ${fullscreen}`);
	$("html").toggleClass("fullscreen", fullscreen);
});

