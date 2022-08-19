
// Based on: https://github.com/evernote/serge/blob/master/lib/Serge/Engine/Plugin/parse_rc.pm

module.exports = function parse_rc_file(rc_file_text, callback, lang) {
	// if (!callback) {
	// 	throw new TypeError('callback not specified');
	// }

	// fetch().text() assumes utf8; hack to make it more readable (not needed in Node.js)
	// rc_file_text = rc_file_text.replace(/\0/g, "");

	let strings = [];
	// let translated_text = "";

	// Finding translatable strings in file

	let menu;
	let dialog;
	let stringtable;
	let block_level = 0;
	let id_str;
	let dialog_id;

	for (let line of rc_file_text.split(/\r?\n/g)) {

		// let hint;
		let orig_str;
		// let translated_str;

		// normalize line

		let norm_line = line.trim()
			.replace(/[\t ]+/g, " ")
			.replace(/\/\/.*$/g, "");

		if (norm_line.match(/ MENU$/)) {
			menu = true;
		}
		const dialog_match = norm_line.match(/^(\w+) (DIALOG|DIALOGEX) /);
		if (dialog_match) {
			dialog_id = dialog_match[1];
			dialog = true;
		}
		if (norm_line === 'STRINGTABLE') {
			stringtable = true;
		}
		if (norm_line === 'BEGIN') {
			block_level++;
		}
		if (norm_line === 'END') {
			block_level--;
			if (block_level == 0) {
				menu = undefined;
				dialog = undefined;
				dialog_id = undefined;
				stringtable = undefined;
			}
		}

		// console.log(`${line}\n`);
		// console.log(`[m=${menu},d=${dialog},s=${stringtable},b=${block_level}]\n`);
		// console.log(`[${norm_line}]\n`);

		// DIALOG header contents
		if (dialog && !block_level) {
			const match = line.match(/^[\t ]*(CAPTION)[\t ]+(L?"(.*?("")*)*?")/);
			if (match) {
				id_str = `${dialog_id}:${match[1]}`;
				hint = `${dialog_id} ${match[1]}`;
				orig_str = match[2];
			}

			// MENU and DIALOGEX BEGIN...END block contents
		} else if ((menu || dialog) && block_level) {
			const match = line.match(/^[\t ]*(\w+)[\t ]+(L?"([^"]*?("")*)*?")(,[\t ]*(\w+)){0,1}/);
			if (match) {
				id_str = match[6];
				hint = match[6] ? `${match[1]} ${match[6]}` : match[1];
				orig_str = match[2];
			}

			// STRINGTABLE BEGIN...END block contents
			// } else if (stringtable && block_level) {
			// actually just do any time, find any strings
		} {
			// let match = line.match(/^[\t ]*(\w+)[\t ]+(L?"([^"]*?("")*)*?")/);
			let match = line.match(/(L?"(.*)")/);
			if (match) { // test for one-line string definitions
				// id_str = match[1];
				// hint = match[1];
				// orig_str = match[2];
				orig_str = match[0];
			} else {
				// test for the first line (id) of the two-line string definitions
				match = line.match(/^[\t ]*(\w+)[\t ]*(\/\/.*)*$/);
				if (match) {
					id_str = match[1];
				} else {
					match = line.match(/^[\t ]*(L?"(.*)")/);
					if (id_str && match) { // test for the second line (string) of the two-line string definitions
						hint = id_str;
						orig_str = match[1];
					} else {
						id_str = undefined;
					}
				}
			}
		}

		if (orig_str) {
			let str = orig_str;

			let wide = str.match(/^L/);
			str = str.replace(/^L?"(.*)"$/g, "$1");
			str = str.replace(/\\r/g, "\r");
			str = str.replace(/\\n/g, "\n");
			str = str.replace(/\\t/g, "\t");
			str = str.replace(/\\"/g, '"');
			if (wide) {
				str = str.replace(/\\x([0-9a-fA-F]{4})/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
			}

			strings.push(str);

			// translated_str = callback(str, hint, lang, id_str);

			// if (lang) {
			// 	translated_str = translated_str.replace(/"/g, '""');
			// 	translated_str = translated_str.replace(/\n/g, "\\n");
			// 	line = line.replace(orig_str, translated_str);
			// }

			id_str = undefined;
			hint = undefined;
			orig_str = undefined;
		}

		// if (lang) {
		// 	translated_text += `${line}\n`;
		// }
	}

	return strings;
	// return translated_text;
}
