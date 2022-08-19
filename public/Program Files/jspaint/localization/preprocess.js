const fs = require("fs");
const glob = require("glob");
const parse_rc_file = require("./parse-rc-file");

const base_lang = "en";
const available_langs = fs.readdirSync(__dirname).filter((dir) => dir.match(/^\w+(-\w+)?$/));
const target_langs = available_langs.filter((lang) => lang !== base_lang);

console.log("Target languages:", target_langs);

// @TODO: DRY hotkey helpers
// & defines accelerators (hotkeys) in menus and buttons and things, which get underlined in the UI.
// & can be escaped by doubling it, e.g. "&Taskbar && Start Menu"
function index_of_hotkey(text) {
	// Returns the index of the ampersand that defines a hotkey, or -1 if not present.

	// return english_text.search(/(?<!&)&(?!&|\s)/); // not enough browser support for negative lookbehind assertions

	// The space here handles beginning-of-string matching and counteracts the offset for the [^&] so it acts like a negative lookbehind
	return ` ${text}`.search(/[^&]&[^&\s]/);
}
function has_hotkey(text) {
	return index_of_hotkey(text) !== -1;
}
function remove_hotkey(text) {
	return text.replace(/\s?\(&.\)/, "").replace(/([^&]|^)&([^&\s])/, "$1$2");
}
const remove_ellipsis = str => str.replace("...", "");

const only_unique = (value, index, self) => self.indexOf(value) === index;

const get_strings = (lang) => {
	return glob.sync(`${__dirname}/${lang}/**/*.rc`).map(
		(rc_file) => parse_rc_file(fs.readFileSync(rc_file, "utf16le").replace(/\ufeff/g, ""))
	).flat();
};

const base_strings = get_strings(base_lang);
for (const target_lang of target_langs) {
	const target_strings = get_strings(target_lang);
	const localizations = {};
	const add_localization = (base_string, target_string, fudgedness) => {
		localizations[base_string] = localizations[base_string] || [];
		localizations[base_string].push({ target_string, fudgedness });
	};
	const add_localizations = (base_strings, target_strings) => {
		for (let i = 0; i < target_strings.length; i++) {
			const base_string = base_strings[i];
			const target_string = target_strings[i];
			if (base_string !== target_string && base_string && target_string) {
				// Split strings like "&Attributes...\tCtrl+E"
				// and "Fills an area with the current drawing color.\nFill With Color"
				const splitter = /\t|\r?\n/;
				if (base_string.match(splitter)) {
					add_localizations(
						base_string.split(splitter),
						target_string.split(splitter)
					);
				} else {
					// add_localization(base_string, target_string, 0);
					add_localization(remove_ellipsis(base_string), remove_ellipsis(target_string), 1);
					if (has_hotkey(base_string)) {
						// add_localization(remove_hotkey(base_string), remove_hotkey(target_string), 2);
						add_localization(remove_ellipsis(remove_hotkey(base_string)), remove_ellipsis(remove_hotkey(target_string)), 3);
					}
				}
			}
		}
	};
	add_localizations(base_strings, target_strings);

	for (const base_string in localizations) {
		const options = localizations[base_string];
		options.sort((a, b) => a.fudgedness - b.fudgedness);
		const unique_strings = options.map(({ target_string }) => target_string).filter(only_unique);
		if (unique_strings.length > 1) {
			console.warn(`Collision for "${base_string}": ${JSON.stringify(unique_strings, null, "\t")}`);
		}
		localizations[base_string] = unique_strings[0];
	}
	const js = `//
// NOTE: This is a generated file! Don't edit it directly.
// Eventually community translation will be set up on some translation platform.
// 
// Generated with: npm run update-localization
//
loaded_localizations("${target_lang}", ${JSON.stringify(localizations, null, "\t")});\n`;
	fs.writeFileSync(`${__dirname}/${target_lang}/localizations.js`, js);
}

// Update available_languages list automatically!
const file = require("path").resolve(__dirname + "/../index.html");
let code = fs.readFileSync(file, "utf8");
code = code.replace(/(available_languages\s*=\s*)\[[^\]]*\]/, `$1${JSON.stringify(available_langs).replace(/","/g, `", "`)}`);
fs.writeFileSync(file, code, "utf8");
console.log(`Updated available_languages list in "${file}"`);
