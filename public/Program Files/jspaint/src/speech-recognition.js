(function (exports) {

	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
	// const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

	exports.speech_recognition_available = !!(SpeechRecognition && SpeechGrammarList);

	if (!exports.speech_recognition_available) {
		return;
	}

	const recognitionFixes = [
		// spell-checker:disable

		// colors
		[/^rat$/i, "red"],
		[/^Fred$/i, "red"],
		[/^Rhett$/i, "red"],
		[/^Brett$/i, "red"],
		[/^friend$/i, "red"],
		["hello", "yellow"],
		["grave", "green"],
		["the ruse", "maroon"],
		["the wren", "maroon"],
		["Ren", "maroon"],
		["Arun", "maroon"],
		["cream", "green"],
		["LiteBlue", "light blue"],
		["crown", "brown"],
		["ombre", "umbre"],
		["tan-tan", "tan tan"],
		[/^pan$/i, "tan"],
		[/^cleo$/i, "blue"],
		["plaque", "black"],

		// commands/misc
		["slick to the", "select the"],
		["it's like the", "select the"],
		["like the", "select the"],
		["suck the", "select the"],
		["septa", "select the"],
		["spectre", "select the"],
		["crab the", "grab the"],
		["cram the", "grab the"],
		[/^can the\b/i, "grab the"],
		[/^scrams\b/i, "grab the"],
		[/^craft\b/i, "grab the"],
		[/^cabinet\b/i, "grab the"],
		[/^tammy\b/i, "grab the"],
		[/^grandpa\b/i, "grab the"],
		[/^is the\b/i, "use the"],
		[/^who's the\b/i, "use the"],
		["flex", "select"],
		["to all", "tool"],
		["stool", "tool"],
		["tour", "tool"],
		["draught", "draw a"],
		["try", "draw"], // seems too general - (unless you previously told it to draw something...) - but it keeps coming up!
		// ["drag", "draw a"], // too general
		["giraffe", "draw"],
		["tri-cat", "draw a cat"],
		["tricap", "draw a cat"],
		["tristar", "draw a star"],
		["try picture", "draw a picture"],
		["stop trying", "stop drawing"],
		["dog drawing", "stop drawing"],
		["camp drag", "stop drawing"],
		["tuggle", "toggle"],
		[/^travel/i, "toggle"],
		[/^title/i, "toggle"],
		[/^halo/i, "toggle"],
		[/^michael/i, "toggle"],
		[/^taco/i, "toggle"],
		["about pink", "about paint"],
		["projects news", "project news"],
		["you project is", "view project news"],
		["the project news", "view project news"],
		["super news", "show news"],
		["husbando", "close window"],
		["put vertical", "flip vertical"],
		["6 / 48", "flip/rotate"],
		["flip / rotate", "flip/rotate"],
		["flipper rotate", "flip or rotate"],
		["superiority", "flip or rotate"],
		["flip rotate", "flip/rotate"],
		["website ready", "flip/rotate"],
		["clips ashworth date", "flip/rotate"],
		["set flash rotate", "flip/rotate"],
		["Eclipse X Reddit", "flip/rotate"],
		["secretariat", "flip/rotate"],
		["iprotec", "flip/rotate"],
		["flippin rotate", "flip/rotate"],
		["pretty by angle", "rotate by angle"],
		["birthday by angle", "rotate by angle"],
		["30 triangle", "rotate by angle"],
		["35 angle", "rotate by angle"],
		["rotate triangle", "rotate by angle"],
		["agreeance", "degrees"],
		["flip / protein", "flip/rotate"],
		["stretch / q", "stretch/skew"],
		["stretch/q", "stretch/skew"],
		["stretch / skew", "stretch/skew"],
		["stretch scale", "stretch/skew"],
		["stretch skew", "stretch/skew"],
		["stretcher skew", "stretch or skew"],
		["stretcher q", "stretch or skew"],
		["stretcher scale", "stretch or skew"],
		["structure skill", "stretch or skew"],
		["cat rescue", "stretch or skew"],
		["stretch your skill", "stretch or skew"],
		["stretching scale", "stretch and skew"], // (said like "stretch 'n' skew")
		["black doll", "select all"],
		["slept all", "select all"],
		["torres election", "delete selection"],
		["deweese election", "delete selection"],
		["tilly", "delete"],
		["clearxchange", "clear image"],
		[/^a pink\b/i, "opaque"],
		["opic", "opaque"],
		["the pick", "opaque"],
		["a pick", "opaque"],
		["cupcake", "opaque"],
		[/^a pic\b/i, "opaque"],
		["hoecake", "opaque"],
		["hope inc", "opaque"],
		[/^went$/i, "width"],
		[/^with$/i, "width"],
		["sasha", "session"],
		["mabel", "enable"],
		["multiuser", "multi-user"],
		["multi user", "multi-user"],
		["horizontal books", "horizontal color box"],
		["talk vertical color box", "toggle vertical color box"],
		["talk horizontal color box", "toggle horizontal color box"],
		["toggle rico color box", "toggle vertical color box"],
		["taco rico color box", "toggle vertical color box"],
		["title horizontal colorbox", "toggle horizontal color box"],
		["entail", "undo"],
		["ngo", "undo"],
		["when do", "undo"],
		["hindu", "undo"],
		["hyundai", "undo"],
		["can do", "undo"],
		["andale", "undo"],
		["n2", "undo"],
		["unto", "undo"],
		[/^until$/i, "undo"],
		["radio", "redo"],
		["poppy", "repeat"],
		["fit within review", "fit within view"],
		["the canvas within view", "fit canvas within view"],
		["take him to sweden with you", "fit canvas within view"],
		["canvas within review", "canvas within view"],
		["heather colors", "edit colors"],
		["headache colors", "edit colors"],
		["hair colors", "edit colors"],
		["nude palette", "load palette"],
		["sol palette", "load palette"],
		["load pallet", "load palette"],
		["blood palette", "load palette"],
		["appellate", "load palette"],
		["play palette", "load palette"],
		["colorbox", "color box"],
		["colorboxx", "color box"],
		["playbox", "color box"],
		["coin box", "color box"],
		["carmax", "color box"],
		["climax", "color box"],
		["colored rocks", "color box"],
		["tell me about", "color box"],
		["toy box", "color box"], // weirdly not for tool box; this is for color box
		["coolbox", "tool box"],
		["toolbox", "tool box"],
		["chocolate toolbox", "toggle tool box"],
		["talking toolbox", "toggle tool box"],
		["tonka tool box", "toggle tool box"],
		["scarred", "discard"],
		["the wine with", "set line width"],
		["wine with", "line width"], // after "the wine with"
		["line with", "line width"],
		["mine with", "line width"],
		["man with", "line width"],
		["thing with", "line width"],
		["man width", "line width"],
		["thing width", "line width"],
		["line lips", "line width"],
		["pics alignment", "pixel line width"],
		["single-pixel", "single pixel"],
		["pixel with", "pixel width"],
		["hypixel's", "5 pixels"],
		["tawana", "to 1"],
		["set my next", "set line width to"],
		["set language to", "set line width to"],
		["sunline with", "set line width to"],
		["pinewood's", "set line width to"],
		["set line with two", "set line width to"],
		["set line width two", "set line width to"],
		["with the tattoo", "width to 2"],
		["with tattoo", "width to 2"],
		["width the tattoo", "width to 2"],
		["width tattoo", "width to 2"],
		["with tutu", "width to 2"],
		["width tutu", "width to 2"],
		[/width to$/i, "width 2"],
		[/size to$/i, "size 2"],
		[/thickness to$/i, "thickness 2"],
		[/width to pixels$/i, "width 2 pixels"],
		[/size to pixels$/i, "size 2 pixels"],
		[/thickness to pixels$/i, "thickness 2 pixels"],
		["he's fine with", "use line width"],
		["you slime with", "use line width"],
		["use lime with", "use line width"],
		["line width v", "line width 5"],
		["quick save", "click save"],
		[/^safe$/i, "save"],
		[/^quince$/i, "close"],
		[/^text mint\b/i, "exit"],

		// addressing actions by menu they're in
		["dial neal", "file new"],
		["dial now", "file new"],
		["kyle neal", "file new"],
		["bio on them", "file new"],
		["eye on them", "file new"],
		["found them", "file new"],
		["kyle new", "file new"],
		["kyle knew", "file new"],
		["kyle now", "file new"],
		["file nail", "file new"],
		["kyle net", "file new"],
		["file net", "file new"],
		["final nail", "file new"],
		["fileopen", "file open"],
		["well safe", "file save"],
		["fail-safe", "file save"],
		["i'll save", "file save"],
		["a done deal", "edit undo"],
		["how to undo", "edit undo"],
		["edit undertale", "edit undo"],

		// navigating menus
		["wyoming", "file menu"],
		["piyo menu", "file menu"],
		["bayou menu", "file menu"],
		["io menu", "file menu"],
		["rio menu", "file menu"],
		["q menu", "view menu"],
		["at at", "edit"],
		["peppa", "edit"],
		["how to", "edit"],
		["add a", "edit"],
		["had a", "edit"],
		["resume sub menu", "show zoom submenu"],
		["kelly's menu", "colors menu"],
		["auggies menu", "colors menu"],
		["cowboys menu", "colors menu"],
		["cowboy's menu", "colors menu"],
		["kelly menu", "colors menu"],
		["color menu", "colors menu"],
		["king's menu", "themes menu"],
		["tim's menu", "themes menu"],
		["dean's menu", "themes menu"],
		["things menu", "themes menu"],
		["pennsylvania", "themes menu"],
		["teamz menu", "themes menu"],
		["teams menu", "themes menu"],
		["goldstein's menu", "close themes menu"],
		["christine's menu", "close themes menu"],
		["express menu", "extras menu"],
		["next wrestlemania", "extras menu"],
		["to help i know", "show help menu"],
		["chow menu", "show help menu"],
		["show help bunion", "show help menu"],
		["show how many mm", "show help menu"],
		["how many mm", "help menu"],
		["help many mm", "help menu"],
		["help many", "help menu"],
		["helping you", "help menu"],
		["kuzmania", "close menu"],
		["close minded", "close menu"],
		["connecticare", "get out of here"],
		["pho extras menu", "show extras menu"],
		["show me access menu", "show the extras menu"],
		[/^express$/i, "extras"],
		["kyle", "file"],
		["heil", "file"],
		[/^final$/i, "file"],
		["q", "view"],
		["you do you", "view"],
		["deal", "view"],

		// dictation
		["hey live", "new line"],
		["halite", "new line"],

		// panning/scrolling the view
		[/scrolling/i, "scroll"],
		["pin the view", "pan the view"],
		["pen the view", "pan the view"],
		["penn the view", "pan the view"],
		["interview", "pan the view"],
		["family view", "pan the view"],
		["pen masala", "pan the view to the south"],
		["penn masala", "pan the view to the south"],
		["it's called a few", "scroll the view"],
		["call the view", "scroll the view"],
		["south rim", "southward"],
		["scrollview", "scroll view"],
		["call north", "scroll north"],
		["crawl north", "scroll north"],
		["crawl northward", "scroll northward"],
		["call down", "scroll down"],
		["skull rain", "scroll right"],
		["scroll rack", "scroll right"],
		["skull right", "scroll right"],
		["you're right", "scroll right"],
		["charlotte", "scroll left"],
		["scroll app", "scroll up"],
		["scrap", "scroll up"],
		["go out", "scroll up"],
		["scroll up in", "scroll up and"],
		["what happened to the", "scroll up and to the"],
		["and not words", "and upwards"],
		["in operates", "and upwards"],
		["down work", "downward"],
		["down works", "downwards"],
		["up rinse and spit", "upwards and to the right"],
		["down at the right", "down and to the right"],
		["down at the left", "down and to the left"],
		["carpenter ant", "go up and to the right"],
		["walking to the right", "go up and to the right"],
		[/^show up/i, "go up"],
		[/^cool up/i, "go up"],
		["scroll acting up", "scroll left and up"],
		["scroll left enough", "scroll left and up"],
		["scroll right enough", "scroll right and up"],
		["scroll writing up", "scroll right and up"],
		["scroll written up", "scroll right and up"],
		["scroll left pan downwards", "scroll left and downwards"],
		["scroll right pan downwards", "scroll right and downwards"],
		["scroll left pan downward", "scroll left and downward"],
		["scroll right pan downward", "scroll right and downward"],
		["scroll left pan upwards", "scroll left and upwards"],
		["scroll right pan upwards", "scroll right and upwards"],
		["scroll left pan upward", "scroll left and upward"],
		["scroll right pan upward", "scroll right and upward"],
		["scroll left pan down", "scroll left and down"],
		["scroll right pan down", "scroll right and down"],
		["scroll left pan up", "scroll left and up"],
		["scroll right pan up", "scroll right and up"],
		["and to go", "and to the"],
		["into the", "and to the"],
		["pen view", "pan view"],
		["penn view", "pan view"],
		["pam view", "pan view"],
		[/^turn right$/i, "pan right"],
		["penn wright", "pan right"],
		["pen wright", "pan right"],
		["pam wright", "pan right"],
		["penn right", "pan right"],
		["pen right", "pan right"],
		["pam right", "pan right"],
		["penn left", "pan left"],
		["pen left", "pan left"],
		["pam left", "pan left"],
		["penn up", "pan up"],
		["pen up", "pan up"],
		["pam up", "pan up"],
		["penn down", "pan down"],
		["pen down", "pan down"],
		["pam down", "pan down"],
		["penn upwards", "pan upwards"],
		["pen upwards", "pan upwards"],
		["pam upwards", "pan upwards"],
		["penn downwards", "pan downwards"],
		["pen downwards", "pan downwards"],
		["pam downwards", "pan downwards"],
		["penn upward", "pan upward"],
		["pen upward", "pan upward"],
		["pam upward", "pan upward"],
		["penn downward", "pan downward"],
		["pen downward", "pan downward"],
		["pam downward", "pan downward"],
		["penn north", "pan north"],
		["pen north", "pan north"],
		["pam north", "pan north"],
		["penn south", "pan south"],
		["pen south", "pan south"],
		["pam south", "pan south"],
		["penn east", "pan east"],
		["pen east", "pan east"],
		["pam east", "pan east"],
		["penn west", "pan west"],
		["pen west", "pan west"],
		["pam west", "pan west"],
		["penn northward", "pan northward"],
		["pen northward", "pan northward"],
		["pam northward", "pan northward"],
		["penn southward", "pan southward"],
		["pen southward", "pan southward"],
		["pam southward", "pan southward"],
		["penn eastward", "pan eastward"],
		["pen eastward", "pan eastward"],
		["pam eastward", "pan eastward"],
		["penn westward", "pan westward"],
		["pen westward", "pan westward"],
		["pam westward", "pan westward"],
		["penn northwest", "pan northwest"],
		["pen northwest", "pan northwest"],
		["pam northwest", "pan northwest"],
		["penn northeast", "pan northeast"],
		["pen northeast", "pan northeast"],
		["pam northeast", "pan northeast"],
		["penn southwest", "pan southwest"],
		["pen southwest", "pan southwest"],
		["pam southwest", "pan southwest"],
		["penn southeast", "pan southeast"],
		["pen southeast", "pan southeast"],
		["pam southeast", "pan southeast"],
		["tannerite", "pan right"],
		["penray", "pan right"],
		["pain left", "pan left"],
		["pinup", "pan up"],
		["pin-up", "pan up"],
		["panna", "pan up"],
		["pinned down", "pan down"],
		["pin down", "pan down"],
		["and down words", "pan downwards"],
		["and downwards", "pan downwards"],
		["pin-up words", "pan upwards"],
		["pin-up word", "pan upward"],
		["pinup words", "pan upwards"],
		["pinup word", "pan upward"],
		["pager", "page up"],
		["page app", "page up"],
		["paint job", "page up"],
		["peach town", "page down"],
		["h-town", "page down"],
		["go up fat page", "go up by a page"],
		["backpage", "by a page"],
		["by a pitch", "by a page"],
		["turn down", "go down"],
		["newtown", "go down"],
		[/^co-op\b/i, "go up"],
		["come up", "go up"],
		// ["correct", "go right"], // can be from "go left" or "go right"; which one is correct is up in the air so I'm not down with that
		[/^direct\b/i, "go right"],
		[/^collect\b/i, "go left"],
		[/^the left\b/i, "go left"],
		["cooperates", "go upwards"],
		["cooperated", "go upwards"],
		["cooperate", "go upward"], // can also be from "go up right"
		["cooperating", "go upward"],
		["cooperative", "go upward"],
		["corporate", "go upward"],
		["go leopard", "go upward"],
		["leopard", "go upward"],
		["clifford", "go upward"],
		["go upgrade", "go upwards"],
		// ["prince", "go upwards"],
		// ["electrics", "go upwards"],
		// ["dog breeds", "go upwards"],
		// ["heloc rates", "go upwards"],
		["free download", "go downward"],
		["to download", "go downward"],
		["go download", "go downward"],
		["go down orange", "go downward"],
		["godown road", "go downward"],
		["go down road", "go downward"],
		["fordham road", "go downward"],
		["donuts", "go downwards"],
		[/^got left\b/i, "go up left"],
		[/^talk left\b/i, "go up left"],
		["the great", "look right"],
		["the craig", "look right"],
		["mccreight", "look right"],
		["lock right", "look right"],
		["lecrae", "look right"],
		["the cleft", "look left"],
		["the craft", "look left"],
		["shut down", "look down"],
		["what town", "look down"],
		["what's down", "look down"],
		["bucktown", "look down"],
		["lockdown", "look down"],
		["circumference", "look upwards"],
		["look up weights", "look upwards"],
		["look up words", "look upwards"],
		["if you up", "view up"],
		["you up", "view up"],
		["review town", "view down"],
		["few down", "view down"],
		["view downloads", "view downwards"],
		["view download", "view downward"],
		["music download", "view downward"],
		["music downloads", "view downwards"],
		["are you down lyrics", "view downwards"],
		["you down lyrics", "view downwards"],
		["few downwards", "view downwards"],
		["you are prince", "view upwards"],
		["do upgrades", "view upwards"],
		["and you are friends", "view upwards"],
		["do you right", "view right"],
		["you right", "view right"],
		["pure right", "view right"],
		["do you left", "view left"],
		["you left", "view left"],
		["he left", "view left"],

		// zooming
		["normal-size", "normal size"],
		["large-size", "large size"],
		["barb size", "large size"],
		["versailles", "large size"],
		["launch sites", "large size"],
		["large sides", "large size"],
		["tire size", "large size"],
		["live science", "large size"],
		["name two large size", "zoom to large size"],
		["dim to large size", "zoom to large size"],
		["name two normal size", "zoom to normal size"],
		["dim to normal size", "zoom to normal size"],
		["custom zoo", "custom zoom"],
		[/^soon/i, "zoom"],
		["zoomin", "zoom in"],
		[/^newman$/i, "zoom in"],
		["resume to", "zoom to"],
		["zoom too", "zoom to"],
		["zoom two", "zoom to"],
		["zoom 2", "zoom to"],
		["seem to", "zoom to"],
		["seem 2", "zoom to"],
		["same to", "zoom to"],
		["sin 2", "zoom to"],
		["zoomed to", "zoom to"],
		["zoomed", "zoom to"],
		["volume to", "zoom to"],
		["tune to", "zoom to"],
		["02", "zoom to"],
		["forex", "4x"],
		["borax", "4x"],
		["sex acts", "6x"],
		["seem to 1x", "zoom to 1x"],
		["zoom g1x", "zoom to 1x"],
		["jim to 1x", "zoom to 1x"],
		["nims 1x", "zoom to 1x"],
		["zoom 2 2x", "zoom to 2x"],
		["sims 2 x", "zoom to 2x"],
		["cmt 2x", "zoom to 2x"],
		["is m22 x", "zoom to 2x"],
		["m22 x", "zoom to 2x"],
		["mtx", "zoom to 2x"],
		["zoom tattoo x", "zoom to 2x"],
		["name 2x", "zoom to 2x"],
		["m24 x", "zoom to 4x"],
		["frx", "zoom to 4x"],
		["seemed forex", "zoom to 4x"],
		["jim to forex", "zoom to 4x"],
		["jim to 4x", "zoom to 4x"],
		["sims 4 x", "zoom to 4x"],
		["m25 x", "zoom to 5x"],
		["zoom to headaches", "zoom to 8x"],
		["museum t-rex", "zoom to 8x"],
		["zoom t-rex", "zoom to 8x"],
		["zoom tx", "zoom to 8x"],
		["znzx", "zoom to 8x"],
		["zoom to a tax", "zoom to 8x"],
		["zoom derek's", "zoom to 8x"],
		["zoom lyrics", "zoom to 8x"],
		["same to you lyrics", "zoom to 8x"],
		["zoom to you lyrics", "zoom to 8x"],
		["same day tax", "zoom to 8x"],
		["zoom kdx", "zoom to 8x"],
		["resume 210ex", "zoom to 10x"],
		["zoom 210ex", "zoom to 10x"],
		["zoom 210x", "zoom to 10x"],
		["sim21 axe", "zoom to 1x"],
		["sim21 ax", "zoom to 1x"],
		["sim21 x", "zoom to 1x"],
		["sim22 axe", "zoom to 2x"],
		["sim22 ax", "zoom to 2x"],
		["sim22 x", "zoom to 2x"],
		["sim23 axe", "zoom to 3x"],
		["sim23 ax", "zoom to 3x"],
		["sim23 x", "zoom to 3x"],
		["sim24 axe", "zoom to 4x"],
		["sim24 ax", "zoom to 4x"],
		["sim24 x", "zoom to 4x"],
		["sim25 axe", "zoom to 5x"],
		["sim25 ax", "zoom to 5x"],
		["sim25 x", "zoom to 5x"],
		["sim26 axe", "zoom to 6x"],
		["sim26 ax", "zoom to 6x"],
		["sim26 x", "zoom to 6x"],
		["sim27 axe", "zoom to 7x"],
		["sim27 ax", "zoom to 7x"],
		["sim27 x", "zoom to 7x"],
		["sim28 axe", "zoom to 8x"],
		["sim28 ax", "zoom to 8x"],
		["sim28 x", "zoom to 8x"],
		["sim29 axe", "zoom to 9x"],
		["sim29 ax", "zoom to 9x"],
		["sim29 x", "zoom to 9x"],
		["name the three acts", "zoom to 3x"],
		["name the four acts", "zoom to 4x"],
		["name the five acts", "zoom to 5x"],
		["name the six acts", "zoom to 6x"],
		["71x", "zoom to 1x"],
		["72x", "zoom to 2x"],
		["73x", "zoom to 3x"],
		["74x", "zoom to 4x"],
		["75x", "zoom to 5x"],
		["76x", "zoom to 6x"],
		["77x", "zoom to 7x"],
		["78x", "zoom to 8x"],
		["79x", "zoom to 9x"],
		["mp3x", "zoom to 3x"],
		["zoom g3x", "zoom to 3x"],
		["zoo 2000%", "zoom to 1000%"], // "zoom to-a thousand percent"
		["zoom to a thousand percent", "zoom to 1000%"],

		// switching themes
		["set game to", "set theme to"],
		["set themed to", "set theme to"],
		["set themed", "set theme"],
		[/^setting the\b/i, "set theme to"],
		[/^accepting the\b/i, "set theme to"],
		[/^something to\b/i, "set theme to"],
		["cooking dark", "set theme to dark"],
		["something with dark", "set theme to dark"],
		["something to white", "set theme to light"],
		["settings light", "set theme to light"],
		["second winter", "set theme to winter"],
		["set theme to mother", "set theme to modern"],
		["modern team", "modern theme"],
		["classic team", "classic theme"],
		["retro team", "retro theme"],
		["default team", "default theme"],
		["normal team", "normal theme"],
		["classic thor", "classic theme"],
		["my 19", "modern theme"],
		["modern tim", "modern theme"],
		["when kissing", "winter theme"],
		["printer stand", "winter theme"],
		["winter thing", "winter theme"],
		["modern thing", "modern theme"],
		["classic thing", "classic theme"],
		["normal sim", "normal theme"],
		["yarmouth inn", "normal theme"],
		["norma theme", "normal theme"],
		["normal thing", "normal theme"],
		["christmas-themed", "christmas theme"],
		["christmas game", "christmas theme"],
		["switch directory theme", "switch to retro theme"],
		["flight mode", "light mode"],
		["light them", "light theme"],
		["bite them", "light theme"],
		["lifeteen", "light theme"],
		["lightning", "light theme"],
		["white theme", "light theme"], // @TODO: if you're already on the Classic theme, should "white theme" go to the Modern theme?
		["game mode", "day mode"],
		["a colt", "occult"],
		["a cult", "occult"],
		["colt theme", "occult theme"],
		["cult theme", "occult theme"],
		["occult thing", "occult theme"],
		["colt thing", "occult theme"],
		["cult thing", "occult theme"],
		["six six six", "666"],
		["pantagraph", "pentagraph"],
		["which crafting", "witchcraft theme"],
		["witch crafting", "witchcraft theme"],
		["witchcrafting", "witchcraft theme"],
		["witch-crafting", "witchcraft theme"],
		["penis", "themes"],
		["things", "themes"],
		["teams", "themes"],

		// render gif animation from document history
		["render gift", "render gif"],
		["create gift", "create gif"],
		["make gift", "make gif"],
		["render a gift", "render a gif"],
		["create a gift", "create a gif"],
		["make a gift", "make a gif"],

		// opening help
		["hope topics", "help topics"],
		["health topics", "help topics"],
		["subtopics", "help topics"],
		["top topics", "help topics"],
		["topix", "help topics"],
		["quickhelp", "click help"],
		["healthier", "help viewer"],

		// help window
		["webhelp", "web help"],
		["medhelp", "web help"],
		["four words", "forwards"],
		["forbearance", "forwards"],
		["pack", "back"],
		["hindsight bar", "hide sidebar"],
		["high tide bar", "hide sidebar"],
		["glenside bar", "hide sidebar"],
		// help topic names
		["trirectangular square", "draw a rectangle or square"],
		["draw rectangular square", "draw a rectangle or square"],
		["draw a rectangular square", "draw a rectangle or square"],
		["rectangular square", "draw a rectangle or square"],
		["welcome the help", "welcome to help"],
		["tri polygon", "draw a polygon"],
		["chop polygon", "draw a polygon"],
		["java polygon", "draw a polygon"],
		["trop polygon", "draw a polygon"],
		["drawpolygon", "draw a polygon"],
		["print text in pictures", "putting text in pictures"],
		["print texts and pictures", "putting text in pictures"],
		["print texts in pictures", "putting text in pictures"],
		["print text and pictures", "putting text in pictures"],
		["bring text to pictures", "putting text in pictures"],
		["an area with color", "fill an area with color"],
		["culinaria was color", "fill an area with color"],
		["tell an area with color", "fill an area with color"],
		["typing format text", "type and format text"],
		["risa small area", "erase a small area"],
		["risa large area", "erase a large area"],
		["harissa large area", "erase a large area"],
		["harissa small area", "erase a small area"],
		["erasing entire image", "erase an entire image"],
		["erase entire image", "erase an entire image"],
		["erase the entire image", "erase an entire image"],
		["Maurice's small area", "erase a small area"],
		["Theresa small area", "erase a small area"],
		["threesome entire image", "erase an entire image"],
		["select part of the picture", "select part of a picture"],
		["slick part of the picture", "select part of a picture"],
		["slick part of a picture", "select part of a picture"],
		["stopped part of the picture", "select part of a picture"],
		["stopped part of a picture", "select part of a picture"],
		["flex part of the picture", "select part of a picture"],
		["flex part of a picture", "select part of a picture"],
		["search part of the picture", "select part of a picture"],
		["search part of a picture", "select part of a picture"],
		["change how the picture looks on the screen", "changing how your picture looks on the screen"],
		["changing how the picture looks on the screen", "change the size of your picture"],
		["changing the size of your picture", "change the size of your picture"],
		["changing the size of the picture", "change the size of your picture"],
		["change the size of the picture", "change the size of your picture"],
		["display grid lines", "display gridlines"],
		["working with pride as a picture", "working with part of the picture"],
		["change the size of a picture", "change the size of your picture"],
		["clipper rotate a picture", "flip or rotate a picture"],
		["set for rotated picture", "flip or rotate a picture"],
		["set for rotate a picture", "flip or rotate a picture"],
		["flip or rotator picture", "flip or rotate a picture"],
		["clipper rotate picture", "flip or rotate a picture"],
		["clipper rotate the picture", "flip or rotate a picture"],
		["flipper rotate a picture", "flip or rotate a picture"],
		["separatism picture", "flip or rotate a picture"],
		["set for rotated the picture", "flip or rotate a picture"],
		["set for rotate the picture", "flip or rotate a picture"],
		["display the toolbox", "display the tool box"],
		["stretcher skewen item", "stretch or skew an item"],
		["stretch rescue and item", "stretch or skew an item"],
		["stretcher sku and item", "stretch or skew an item"],
		["compete with other programs", "using paint with other programs"],
		["turn lights and shapes", "drawing lines and shapes"],

		// Eye Gaze Mode
		["i gaze", "eye gaze"],
		["auggies", "eye gaze"],
		["eye-gaze", "eye gaze"],
		["igas", "eye gaze"],
		["a gizmodo", "eye gaze mode"],
		["a gizmo", "eye gaze mode"],
		["august moon", "eye gaze mode"],
		["ik's mode", "eye gaze mode"],
		["mycase mode", "eye gaze mode"],
		["craigslist mode", "eye gaze mode"],
		["vegas mode", "eye gaze mode"],
		["i guess mode", "eye gaze mode"],
		["ideas mode", "eye gaze mode"],
		["agee's mode", "eye gaze mode"],
		["aggie's mode", "eye gaze mode"],
		["iggy's mode", "eye gaze mode"],
		["iggie's mode", "eye gaze mode"],
		["angus mode", "eye gaze mode"],
		["ids mode", "eye gaze mode"],
		["ie kiosk mode", "eye gaze mode"],
		["audit mode", "eye gaze mode"],
		["agnes mode", "eye gaze mode"],
		["add case mode", "eye gaze mode"],
		["galactus mode", "toggle eye gaze mode"],
		["tyga ligase mode", "toggle eye gaze mode"],
		["puggle auggies mode", "toggle eye gaze mode"],
		["tug ligase mode", "toggle eye gaze mode"],
		["tonka ligase mode", "toggle eye gaze mode"],
		["taco eye gaze mode", "toggle eye gaze mode"],
		["tugela geese mode", "toggle eye gaze mode"],
		["alkali gaze mode", "toggle eye gaze mode"],
		["interrogative mood", "enter eye gaze mode"],
		["enteritis mode", "enter eye gaze mode"],
		["maplelag it's mode", "enable eye gaze mode"],
		["maplelag is mode", "enable eye gaze mode"],
		["maplelag a spoon", "enable eye gaze mode"],
		["sableye gizmo", "enable eye gaze mode"],
		["play bar-kays", "enable eye gaze mode"],
		["maple eye gaze mode", "enable eye gaze mode"],
		["maple ikea smell", "enable eye gaze mode"],
		["nearby gas pain", "enable eye gaze mode"],
		["sableye gizmodo", "disable eye gaze mode"],
		["sableye case mode", "disable eye gaze mode"],
		["sableye games mode", "disable eye gaze mode"],
		["sableye gaze mode", "disable eye gaze mode"],
		["samurai games", "disable eye gaze mode"],
		["and eye gaze mode", "end eye gaze mode"],
		["disable guest mode", "disable eye gaze mode"],
		["turn off my gizmo", "turn off eye gaze mode"],
		["turn off my guest mode", "turn off eye gaze mode"],

		// Eye Gaze Mode: Pause/Resume Dwell Clicking
		["tangled dwell clicking", "toggle dwell clicking"],
		["michael dwelle clicking", "toggle dwell clicking"],
		["toggled dwell clicking", "toggle dwell clicking"],
		["call goldwell clicking", "toggle dwell clicking"],
		["toggled well clicking", "toggle dwell clicking"],
		["toggled dwele clicking", "toggle dwell clicking"],
		["toggled dwelle clicking", "toggle dwell clicking"],
		["toggled while cooking", "toggle dwell clicking"],
		["toggled wildflecken", "toggle dwell clicking"],
		["puggle dwell clicking", "toggle dwell clicking"],
		["tangled while clicking", "toggle dwell clicking"],
		["taco bell cooking", "toggle dwell clicking"],
		["a goldwell clicking", "toggle dwell clicking"],
		["toggled while clicking", "toggle dwell clicking"],
		["toggle do i click in", "toggle dwell clicking"],
		["tangled while cooking", "toggle dwell clicking"],
		["tacos while cutting", "toggle dwell clicking"],
		["call coldwell clicking", "toggle dwell clicking"],
		["taco bell clicking", "toggle dwell clicking"],
		["tangled dwell clicks", "toggle dwell clicks"],
		["michael dwelle clicks", "toggle dwell clicks"],
		["toggled dwell clicks", "toggle dwell clicks"],
		["call goldwell clicks", "toggle dwell clicks"],
		["toggled well clicks", "toggle dwell clicks"],
		["toggled dwele clicks", "toggle dwell clicks"],
		["toggled dwelle clicks", "toggle dwell clicks"],
		["toggle do i clicks", "toggle dwell clicks"],
		["puggle dwell clicks", "toggle dwell clicks"],
		["tangled while clicks", "toggle dwell clicks"],
		["a goldwell clicks", "toggle dwell clicks"],
		["toggled while clicks", "toggle dwell clicks"],
		["call coldwell clicks", "toggle dwell clicks"],
		["talk about cliques", "toggle dwell clicks"],
		["target wall clocks", "toggle dwell clicks"],
		["talk about sex", "toggle dwell clicks"],
		["toggled welplex", "toggle dwell clicks"],
		["taco bell clicks", "toggle dwell clicks"],
		["12 quickening", "dwell clicking"],
		["12 clicking", "dwell clicking"],
		["12 cooking", "dwell clicking"],
		["to a clicking", "dwell clicking"],
		["12 clicks", "dwell clicks"],
		["12 clicker", "dwell clicker"],
		["to a click", "dwell click"],
		["dwele clicking", "dwell clicking"],
		["dwele click", "dwell click"],
		["dwele clicks", "dwell clicks"],
		["dwele clicker", "dwell clicker"],
		["dwelle clicking", "dwell clicking"],
		["dwelle click", "dwell click"],
		["dwelle clicks", "dwell clicks"],
		["dwelle clicker", "dwell clicker"],
		["pasta while cutting", "pause dwell clicking"],
		["pasta while cooking", "pause dwell clicking"],
		["pasquale cooking", "pause dwell clicking"],
		["pause while clicking", "pause dwell clicking"],
		["pause while cooking", "pause dwell clicking"],
		["paused while clicking", "pause dwell clicking"],
		["paused while cooking", "pause dwell clicking"],
		["unpause while clicking", "unpause dwell clicking"],
		["unpause while cooking", "unpause dwell clicking"],
		["unpaused while clicking", "unpause dwell clicking"],
		["unpaused while cooking", "unpause dwell clicking"],
		["stop while clicking", "stop dwell clicking"],
		["stop while cooking", "stop dwell clicking"],
		["stop wall clocks", "stop dwell clicks"],
		["stopped while clicking", "stop dwell clicking"],
		["stopped while cooking", "stop dwell clicking"],
		["stopped wall clocks", "stop dwell clicks"],
		["disabled while clicking", "disable dwell clicking"],
		["disabled while cooking", "disable dwell clicking"],
		["disabled wall clocks", "disable dwell clicks"],
		["disabled wall clock in", "disable dwell clicking"],
		["disable wall clock in", "disable dwell clicking"],
		["disable while clicking", "disable dwell clicking"],
		["disable while cooking", "disable dwell clicking"],
		["disable wall clocks", "disable dwell clicks"],
		["mabel dwell clicking", "enable dwell clicking"],
		["enable to walk clicking", "enable dwell clicking"],
		["enabled while clicking", "enable dwell clicking"],
		["enabled while cooking", "enable dwell clicking"],
		["enabled wall clocks", "enable dwell clicks"],
		["enable while clicking", "enable dwell clicking"],
		["enable while cooking", "enable dwell clicking"],
		["enable wall clocks", "enable dwell clicks"],
		["start wall clocks", "start dwell clicks"],
		["start while cooking", "start dwell clicking"],
		["start while clicking", "start dwell clicking"],
		["resume while cooking", "resume dwell clicking"],
		["resumed while cooking", "resume dwell clicking"],
		["resume while clicking", "resume dwell clicking"],
		["resumed while clicking", "resume dwell clicking"],
		["resume walk clicks", "resume dwell clicks"],
		["resumed walk clicks", "resume dwell clicks"],
		["startalk looking", "start dwell clicking"],
		["dwell quickening", "dwell clicking"],
		["dual clicking", "dwell clicking"],
		["dual quickening", "dwell clicking"],
		["dual cooking", "dwell clicking"],
		["dwell cooking", "dwell clicking"],
		["well clicking", "dwell clicking"],
		["well quitting", "dwell clicking"],
		["well clicks", "dwell clicks"],

		// Free-Form Select
		["state farm", "free-form"],
		["freeform", "free-form"],
		["free form", "free-form"],
		["preference light", "free-form select"],
		["free from select", "free-form select"],
		["refund select", "free-form select"],
		["pee from select", "free-form select"],
		["pee form select", "free-form select"],
		["reformist left", "free-form select"],
		["reform select", "free-form select"],
		["free p*** site", "free-form select"],
		["sea sponge select", "free-form select"],
		["refund selection", "free-form selection"],
		["reform selection", "free-form selection"],
		["refine selection", "free-form selection"],
		["pee from selection", "free-form selection"],
		["pee form selection", "free-form selection"],
		["preformed selector", "free-form select tool"],
		["difference electrical", "free-form select tool"],
		["preformed selectable", "free-form select tool"],
		["refund selector", "free-form select tool"],
		["refund select tool", "free-form select tool"],
		["select staffing", "select by outline"],
		["sucks buy online", "select by outline"],
		["sliced by outline", "select by outline"],
		["stacked by outline", "select by outline"],
		["the lights ballantyne", "select by outline"],
		["shark ballet", "select by outline"],
		["flexpay outline", "select by outline"],
		["flexispy outline", "select by outline"],
		["plexpy outline", "select by outline"],
		["select palin", "select by outline"],
		["soft vagina shape", "select by drawing a shape"],
		["select by triangle shape", "select by drawing a shape"],
		["flex by drawing a shape", "select by drawing a shape"],
		["flex by drawing a sheep", "select by drawing a shape"],
		["flex by drawing shape", "select by drawing shape"],
		["flex by drawing sheep", "select by drawing shape"],
		["psychic by drawing a shape", "select by drawing a shape"],
		["psychic by drawing shape", "select by drawing shape"],
		["psychic by drawing a sheep", "select by drawing a shape"],
		["psychic by drawing sheep", "select by drawing shape"],
		// Select
		["flekstore", "select tool"],
		["select one", "select tool"],
		["selectel", "select tool"],
		["selector", "select tool"],
		["sectoral", "select tool"],
		["slack tool", "select tool"],
		["slack poll", "select tool"],
		["electoral", "select tool"],
		["collectible", "select tool"],
		["what tool", "select tool"],
		["you select", "use select"],
		["you select all", "use select tool"],
		["use select all", "use select tool"],
		["you slept well", "use select tool"],
		["suck my dragon", "select by dragging"],
		["swift", "select"],
		["crab stop 2", "grab the select tool"],
		["diamond select tool", "grab the select tool"],
		["grandmas like tool", "grab the select tool"],
		["7 / 12", "grab the select tool"],
		["christmas light tour", "grab the select tool"],
		["christmas light tool", "grab the select tool"],
		["crab the spectre", "grab the select tool"],
		["grab the select the", "grab the select tool"],
		["endless love", "grab the select tool"],
		["prince elector", "grab the select tool"],
		["grandma's flector", "grab the select tool"],
		["fortune", "selection"],
		["flexion", "selection"],
		// Eraser/Color Eraser
		["tracer", "eraser"],
		["grace", "erase"],
		["rapper", "rubber"],
		["robber", "rubber"],
		["racing", "eraser"],
		["racer", "eraser"],
		["appraiser", "eraser"],
		// Fill With Color
		["tail with color", "fill with color"],
		["pickpocket", "paint bucket"],
		["pink bucket", "paint bucket"],
		["pillbox hat", "fill bucket"],
		["pill lookup", "fill bucket"],
		["tell bucket", "fill bucket"],
		["phil luckett", "fill bucket"],
		["fel bucket", "fill bucket"],
		["phil bucket", "fill bucket"],
		["tell the cat", "fill bucket"],
		["tell becca", "fill bucket"],
		["tell buck app", "fill bucket"],
		["celtic app", "fill bucket"],
		["don't like it", "fill bucket"],
		["sell back at", "fill bucket"],
		["celtic cat", "fill bucket"],
		["delphi cat", "fill bucket"],
		["sobriquet", "fill bucket"],
		["tell beckett", "fill bucket"],
		["sound like a cat", "fill bucket"],
		["seal bucket", "fill bucket"],
		["cell bucket", "fill bucket"],
		["go back at", "fill bucket"],
		["silver cat", "fill bucket"],
		["selma cat", "fill bucket"],
		["fell back at", "fill bucket"],
		["philadelphia", "fill bucket"],
		["thelma cat", "fill bucket"],
		["go back app", "fill bucket"],
		["tell dunkin", "fill bucket"],
		["bobcat", "bucket"],
		["tell tool", "fill tool"],
		["till tool", "fill tool"],
		["delta", "fill tool"],
		["tilt", "fill tool"],
		["filter", "fill tool"],
		["telltale", "fill tool"],
		["felt tool", "fill tool"],
		["feltl", "fill tool"],
		["beltsville", "fill tool"],
		["biltmore", "fill tool"],
		["tiltable", "fill tool"],
		["felt wool", "fill tool"],
		["peltor", "fill tool"],
		["field tool", "fill tool"],
		["tilt wall", "fill tool"],
		["tool wall", "tool"],
		["elvis coloring", "fill with color"],
		["pill with color", "fill with color"],
		["so what's color", "fill with color"],
		["platteville", "floodfill"], // @TODO: make sure to handle variations of flood-fill/flood fill/floodfill if not already handled
		["landfill", "floodfill"],
		["clydesdale", "floodfill"],
		["plant fill", "floodfill"],
		["area feltwell", "area fill tool"],
		["hurry up fill tool", "area fill tool"],
		["FL to wawa", "area fill tool"],
		["region feltwell", "region fill tool"],
		["regent fill tool", "region fill tool"],
		["regent feltwell", "region fill tool"],
		["tell", "fill"],
		["cell", "fill"],
		["phil", "fill"],
		[/^shell$/i, "fill"],
		["delaware", "filler"],
		["heller", "filler"],
		["tiller", "filler"],
		["philly", "filler"],
		["feller", "filler"],
		["keller", "filler"],
		["teller", "filler"],
		["set wear", "filler"],
		["stellar", "filler"],
		["delair", "filler"],
		["cellar", "filler"],
		["pillar", "filler"],
		["bel air", "filler"],
		["killer", "filler"],
		["cypress hill tool", "select the fill tool"],
		["cypress hill tour", "select the fill tool"],
		["adele tool", "select the fill tool"],
		["adele tour", "select the fill tool"],
		["cycle filter on", "select the fill tool"],
		["cycle fill tool on", "select the fill tool"],
		["spect protocol", "select the fill tool"],
		["temperature", "dump bucket"],
		["temp bucket", "dump bucket"],
		["tom paquette", "dump bucket"],
		["come bucket", "dump bucket"],
		["dumb bucket", "dump bucket"],
		["pink jumper", "paint dumper"],
		["pink diaper", "paint dumper"],
		["paint number", "paint dumper"],
		["pen temper", "paint dumper"],
		["penn temper", "paint dumper"],
		["camper", "dumper"],
		["something bucket", "dumping bucket"],
		["camping bucket", "dumping bucket"],
		["panda filled my cat", "grab the fill bucket"],
		["have the philadelphia", "grab the fill bucket"],
		["grab the filter cap", "grab the fill bucket"],
		["grab the fill tool cap", "grab the fill bucket"],
		["can the felt like it", "grab the fill bucket"],
		["turn the filter cap", "grab the fill bucket"],
		["turn the fill tool cap", "grab the fill bucket"],
		["kenneth l. cat", "grab the fill bucket"],
		["crabs fl. cat", "grab the fill bucket"],
		// Pick Color
		["pink color", "pick color"],
		["what color", "pick color"],
		["pickler", "pick color"],
		["picolor", "pick color"],
		["the color", "pick color"],
		["color from a picture", "color from the picture"],
		["hydrometer", "eye dropper"],
		["hijacker", "eye dropper"],
		["price chopper", "eye dropper"],
		["hydra", "eye drop"],
		["hydro", "eye drop"],
		["high job", "eye drop"],
		["color left in too long", "color lifting tool"],
		["kelly rector", "color lifter"],
		["best color", "lift color"],
		["toy left it", "color lifter"],
		["collector", "color lifter"],
		["color corrector", "color lifter"],
		["kelly wester", "color lifter"],
		["color vector", "color lifter"],
		// Magnifier
		["loop", "loupe"],
		["poop", "loupe"],
		["duke", "loupe"],
		["snoop", "loupe"],
		["mutual", "loupe tool"],
		["big claw", "loupe tool"],
		["skip trowel", "loupe tool"],
		["webtoon", "loupe tool"],
		["high class", "eyeglass"],
		["anything glass", "magnifying glass"],
		["human tool", "zooming tool"],
		["resuming tool", "zooming tool"],
		["looming tool", "zooming tool"],
		["tuning tool", "zooming tool"],
		["swimming pool", "zooming tool"],
		["simmental", "zooming tool"],
		["jimmy neutron", "zooming tool"],
		["zoom in tool", "zooming tool"],
		["covid-19 fire", "grab the magnifier"],
		["turn the magnifier", "grab the magnifier"],
		["hang fire", "magnifier"],
		// Pencil
		["penn", "pen"],
		["penndot", "pen tool"],
		["pixel 2", "pixel tool"],
		["texas lottery tool", "pixel art tool"],
		// Brush
		["barstool", "brush tool"],
		["pashto", "brush tool"],
		["cache store", "brush tool"],
		["festival", "brush tool"],
		["press tool", "brush tool"],
		["restaurant", "brush tool"],
		["vegetable", "brush tool"],
		["brushed wool", "brush tool"],
		["fresh", "brush"],
		["rush", "brush"],
		["crash", "brush"],
		["crush", "brush"],
		// Airbrush
		["hair brush", "airbrush"],
		["hairbrush", "airbrush"],
		["hair brushing", "airbrushing"],
		["hairbrushing", "airbrushing"],
		["parasol", "aerosol"],
		["paragraph", "aerograph"],
		// Text
		["x2", "text tool"],
		["text talk", "text tool"],
		["hacks", "text"],
		["pex tool", "text tool"],
		["text one", "text tool"],
		["text mom", "text tool"],
		["text will", "text tool"],
		["text to him", "text tool"],
		["text tone", "text tool"],
		["extol", "text tool"],
		["tech stool", "text tool"],
		["textile", "text tool"],
		[/^and text\b/i, "end text"],
		// Line
		["blind", "line tool"],
		["mindful", "line tool"],
		["mine tour", "line tool"],
		["mantle", "line tool"],
		["fine tool", "line tool"],
		["912", "line tool"],
		["night owl", "line tool"],
		["klein tool", "line tool"],
		["feintool", "line tool"],
		["wine tool", "line tool"],
		["wine tour", "line tool"],
		["mine", "line"],
		["fine", "line"],
		["find", "line"],
		["lying", "line"],
		["straight life", "straight line"],
		["lions", "lines"],
		["landstuhl", "lines tool"],
		["wine store", "lines tool"],
		["find rantoul", "line drawing tool"],
		// Curve
		["careful", "curve tool"],
		["capital", "curve tool"],
		["curveball", "curve tool"],
		["curved wall", "curve tool"],
		["creve coeur", "curve tool"],
		["terp talk", "curve tool"],
		["character", "curve tool"],
		["turtle", "curve tool"],
		["kirksville", "curve tool"],
		["busy acre", "bezier curve"],
		["sheriff", "curve"],
		["turf", "curve"],
		["curt", "curve"],
		["kerf", "curve"],
		["cuz", "curve"],
		["kirk", "curve"],
		["leaving bye", "wavy line"],
		["weave", "wave"],
		["cosign", "cosine"],
		["co-sign", "cosine"],
		["curse", "curves"],
		["curved stool", "curves tool"],
		// Rectangle
		["spectacle", "rectangle"],
		["wrecked", "rect"],
		// Polygon
		["play on", "polygon"],
		["and gone", "n-gon"],
		["handgun", "n-gon"],
		["police", "polys"],
		["polly's", "polys"],
		["polly stool", "polys tool"],
		["polly tool", "poly tool"],
		["polly", "poly"],
		["shaped wall", "shape tool"],
		["octagon table", "octagon tool"],
		// Ellipse
		["lips", "ellipse"],
		["clips", "ellipse"],
		["eclipse", "ellipse"],
		["let's", "ellipse"],
		["flip store", "ellipse tool"],
		["toefl", "oval"],
		["offal", "oval"],
		["google", "oval"],
		["hopeful", "oval"],
		["duval", "oval"],
		["oporto", "oval tool"],
		// Rounded Rectangle
		["mandy tatinkin", "rounded rectangle"],
		["random rectangles", "rounded rectangle"],
		["random rectangle", "rounded rectangle"],
		["brandon rectangle", "rounded rectangle"],
		["and it rectangle", "rounded rectangle"],
		["and a rectangle", "rounded rectangle"],
		["padded rectangle", "rounded rectangle"],
		["standard rectangle", "rounded rectangle"], // (I hope you don't actually say "standard rectangle" haha)
		["roundrect", "round rect"],
		["contract", "round rect"],
		["found wrecked", "round rect"],
		["found rect", "round rect"],
		["and wrecked", "round rect"],
		["and rect", "round rect"],
		["man draft", "round rect"],
		["found wrapped", "round rect"],
		["round draft", "round rect"],
		["brown direct", "round rect"],
		["brown tract", "round rect"],
		["brown draft", "round rect"],
		["round wrecked", "round rect"],
		["a tract", "round rect"],
		["grand rapids", "round rect"],
		["ron recht", "round rect"],
		["cataract", "round rect"],
		["soundtrack", "round rect"],
		["round wrapped", "round rect"],
		["unwrapped", "round rect"],
		["downdraft", "round rect"],
		["round rock", "round rect"],
		["grand racked", "round rect"],
		["and racked", "round rect"],

		// Tool options
		["hope hicks election", "opaque selection"],
		["oaks collection", "opaque selection"],
		["okay selection", "opaque selection"],
		["hoecakes election", "opaque selection"],
		["selection of pic", "selection opaque"],
		["next selection of pig", "make selection opaque"],
		["next selection of pic", "make selection opaque"],
		["next selection opaque", "make selection opaque"],
		["explosion transparent", "make selection transparent"],
		["increase breast size", "increase brush size"],

		// spell-checker:enable
	];
	const colorNames = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
	const toolNames = tools.map((tool) => tool.speech_recognition).flat();
	// @TODO: select foreground/background/ternary color specifically
	// @TODO: switch colors / swap colors / swap foreground and background colors
	// @TODO: zoom in/out / increase/decrease magnification, zoom to 20x / 5% etc., zoom out all the way (actual size or best fit if it's too big), actual size
	// @TODO: "convert image to black-and-white" / "convert image to monochrome" / "make image monochrome", "increase/decrease threshold" / "more white" / "more black"
	// @TODO: in Image Attributes, "Color"/"Colors"/"Not black and white" for Colors
	// @TODO: select tool options like selection opacity and brush sizes
	//   opaque/transparent/translucent/see-through selection / make selection opaque/transparent/translucent/see-through
	//   "increase size"(too vague) / "increase brush size" / "increase eraser size" / "larger eraser" / "enlarge eraser"

	// @TODO: Is there a way to enable the grammar only as a hint, non-restrictively?
	// Construct a grammar that just contains an English dictionary, and set it as lower weight?
	// That might mess with / not work with things like "MC" in "MC Hammer", numbers, emoji, etc.
	/*const grammar = `#JSGF V1.0;
	grammar jspaintCommands;
	<color> = ${colorNames.join(' | ')};
	<tool_name> = ${toolNames.join(' | ')};
	<tool> = [the] <tool_name> [tool];
	<pick-verb> = select | pick | choose | use | activate | "pick up" | grab;
	<stop> = stop | end | cease | (that's | that is) enough | enough of that | terminate | halt | put an end to [this] | break off;
	// @TODO: is there an escape hatch for "any text here"?
	<something> = [a|an] (something | thing | anything | dog | cat | house | mouse | bird | snake | tree | turtle | mountain | [smiley | smiling | happy | frowny | frowning | sad] face);
	<draw> = draw | sketch | doodle | render | ((draw | sketch | doodle | render | do | paint) [a picture | an image | a drawing | a painting | a rendition | a sketch | a doodle) of]);
	<draw-something> = <draw> <something>;
	public <command> = [<pick-verb>] (<color> | <tool>) | <stop> | <draw-something>;
	`;*/

	const recognition = new SpeechRecognition();
	// const speechRecognitionList = new SpeechGrammarList();
	// speechRecognitionList.addFromString(grammar, 1);
	// recognition.grammars = speechRecognitionList;
	recognition.continuous = false;
	recognition.lang = 'en-US';
	recognition.interimResults = false;
	recognition.maxAlternatives = 1;

	exports.speech_recognition_active = false;

	exports.enable_speech_recognition = function () {
		if (!exports.speech_recognition_active) {
			exports.speech_recognition_active = true;
			recognition.start();
		}
	};
	exports.disable_speech_recognition = function () {
		if (exports.speech_recognition_active) {
			exports.speech_recognition_active = false;
			recognition.stop();
		}
	};

	const textual_input_selector = "input:not([type=file]):not([type=button]):not([type=submit]):not([type=reset]):not([type=radio]):not([type=checkbox]):not([type=color]):not([type=image]), textarea, [contenteditable]";

	// @TODO: maybe make this a pure function? doesn't seem great to use document state here
	function fix_up_speech_recognition(command) {
		command = command.toLowerCase();
		if (!command.match(/^draw /i) && !(document.activeElement && document.activeElement.matches(textual_input_selector))) {
			for (const [bad, good] of recognitionFixes) {
				if (bad instanceof RegExp) {
					if (bad.flags.indexOf("i") === -1) {
						console.warn(`A speech recognition fix was introduced using a regexp (${bad}) that is not case insensitive. Add the /i flag or make this message more nuanced.`);
					}
					command = command.replace(bad, good);
				} else if (bad.match(/^\W|\W$/)) {
					command = command.replace(new RegExp(escapeRegExp(bad), "ig"), good);
				} else {
					command = command.replace(new RegExp(`\\b${escapeRegExp(bad)}\\b`, "ig"), good);
				}
			}
		}
		return command;
	}
	recognition.onresult = function (event) {
		if (document.visibilityState !== "visible") {
			return;
		}
		// The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
		// The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
		// It has a getter so it can be accessed like an array
		// The first [0] returns the SpeechRecognitionResult at the last position.
		// Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
		// These also have getters so they can be accessed like arrays.
		// The second [0] returns the SpeechRecognitionAlternative at position 0.
		// We then return the transcript property of the SpeechRecognitionAlternative object
		console.log(event.results);
		let command = event.results[0][0].transcript;
		console.log(`Result received: "${command}"`);
		console.log('Confidence: ' + event.results[0][0].confidence);
		command = fix_up_speech_recognition(command);
		console.log(`After any fixes: "${command}"`);

		const interpretations = interpret_command(command, true);
		if (interpretations.length) {
			const interpretation = choose_interpretation(interpretations);
			// @TODO: escape HTML around and inside the <b> tag
			const speech_html = command.replace(
				new RegExp(escapeRegExp(interpretation.match_text), "i"),
				(important_text) => `<b>${important_text}</b>`
			);
			$status_text.html(`Speech:&nbsp;<span style="white-space: pre;">${speech_html}</span>`);
			console.log(`Interpreting command "${command}" as`, interpretation);
			interpretation.exec();
		} else {
			$status_text.text(`Speech: ${command}`);
			console.log(`No interpretation for command "${command}"`);
		}
	};

	recognition.onspeechend = function () {
		recognition.addEventListener("end", () => {
			recognition.start();
		}, { once: true });
		recognition.stop();
	};

	recognition.onnomatch = function (event) {
		if (document.visibilityState !== "visible") {
			return;
		}
		$status_text.text("Speech not recognized.");
	};

	recognition.onstart = function (event) {
		exports.speech_recognition_active = true;
	};
	recognition.onend = function (event) {
		exports.speech_recognition_active = false;
	};

	recognition.onerror = function (event) {
		if (event.error.toString().match(/no-speech/)) {
			try {
				recognition.start();
			} catch (error) {
				recognition.addEventListener("end", () => {
					recognition.start();
				}, { once: true });
			}
		} else {
			$status_text.text('Error occurred in speech recognition: ' + event.error);
			console.log('Error occurred in speech recognition:', event.error);
			// exports.speech_recognition_active = false;
		}
	};

	// @TODO: move this logic to a sorting within interpret_command
	function choose_interpretation(interpretations) {
		let best_interpretation = interpretations[0];
		if (!interpretations.length) {
			return;
		}
		for (const interpretation of interpretations) {
			if (
				interpretation.match_text.length > best_interpretation.match_text.length ||
				interpretation.prioritize
			) {
				best_interpretation = interpretation;
			}
		}
		return best_interpretation;
	}

	exports.interpret_command = (input_text, default_to_entering_text) => {
		const interpretations = [];
		const add_interpretation = (interpretation) => {
			interpretations.push(interpretation);
		};

		for (const color of colorNames) {
			if (` ${input_text} `.toLowerCase().indexOf(` ${color.toLowerCase()} `) !== -1) {
				add_interpretation({
					match_text: color,
					exec: ((color) => () => {
						selected_colors.foreground = color;
						$G.trigger("option-changed");
					})(color),
				});
			}
		}
		for (const tool of tools) {
			for (const base_tool_phrase of tool.speech_recognition) {
				// Note: if "select" wasn't matched here, the phrase "select text" would select the Select tool instead of the Text tool (because "select" is longer than "text")
				const select_tool_match = input_text.match(new RegExp(`\\b(?:(?:select|pick|choose|use|activate|pick up|grab) )?(?:the )?${escapeRegExp(base_tool_phrase)}(?: tool)?\\b`, "i"));
				if (select_tool_match) {
					add_interpretation({
						match_text: select_tool_match[0],
						tool_id: tool.id,
						exec: ((tool) => () => {
							select_tool(tool);
						})(tool),
					});
				}
			}
		}

		const all_menu_items = [];
		const collect_menu_items = (menu) => {
			for (const menu_item of menu) {
				if (menu_item !== MENU_DIVIDER) {
					all_menu_items.push(menu_item);
				}
				if (menu_item.submenu) {
					collect_menu_items(menu_item.submenu);
				}
			}
		};
		Object.values(menus).forEach(collect_menu_items);

		for (const menu_item of all_menu_items) {
			if (menu_item.speech_recognition) {
				for (const menu_item_phrase of menu_item.speech_recognition) {
					if (` ${input_text} `.toLowerCase().indexOf(` ${menu_item_phrase.toLowerCase()} `) !== -1) {
						add_interpretation({
							match_text: menu_item_phrase,
							exec: ((menu_item) => () => {
								if (menu_item.checkbox) {
									menu_item.checkbox.toggle();
								} else {
									menu_item.action();
								}
							})(menu_item),
						});
					}
				}
			}
		}

		const close_menus_match = input_text.match(/\b(?:(?:close|exit|leave|hide|dismiss) menus?|never ?mind|get (?:out of|outta) (here|this menu|these menus)?|get out)\b/i);
		if (close_menus_match) {
			add_interpretation({
				match_text: close_menus_match[0],
				exec: () => {
					// from close_menus in $MenuBar
					$(".menu-button").trigger("release");
					// Close any rogue floating submenus
					$(".menu-popup").hide();
				},
			});
		}

		if (interpretations.length === 0) {
			// @TODO: clipboard as a source.. but you might want to just draw the clipboard directly to the canvas,
			// so maybe it should be limited to saying "sketch"/"doodle"/"do a rendition of"
			// /(?:sketch|doodle|do a (?:rendition|sketch|doodle) of) (?:the (?:contents of |(?:image|picture|data) on the )|(?:what's|what is) on the )?clipboard/i
			const draw_match = input_text.match(/(?:draw|sketch|doodle|render|(?:paint|draw|do|render|sketch) (?:a picture|an image|a drawing|a painting|a rendition|a sketch|a doodle) of) (?:an? )?(.+)/i);
			if (draw_match) {
				const subject_matter = draw_match[1].replace(/:-?\)/g, "smiley face").replace(/:-?\(/g, "sad face");
				add_interpretation({
					match_text: draw_match[0],
					sketch_subject: subject_matter,
					exec: () => {
						find_clipart_and_sketch(subject_matter);
					},
				});
			}
		}

		const buttons = $("button, .menu-button, .menu-item-label, label, .help-window .item").filter(":visible").toArray();

		for (const button of buttons) {
			let button_text = button.textContent || button.getAttribute("aria-label") || button.title;
			button_text = button_text
				.replace(/[^\p{L}|\p{N}|\p{M}|\s]/gu, " ") // currently the Extras menu has emoji in its labels, so we need to remove them
				.replace(/\s+/g, " ")
				.trim();
			let button_text_phrases = [button_text];
			if (!button_text) {
				button_text_phrases = [];
			}
			if (button_text.match(/^(Okay|OK)$/i)) {
				button_text_phrases = ["Okay", localize("OK")];
			}
			if (button_text.match(/^(Pause Dwell Clicking)$/i)) {
				button_text_phrases = [
					"Toggle Dwell Clicking", "Toggle Dwell Clicks",
					"Rest Eye Gaze", "Rest Eyes",
					// disable stop pause
					"Disable Dwell Clicking", "Disable Eye Gaze", "Disable Gaze Clicking", "Disable Dwell Clicks", "Disable Gaze Clicks",
					"Stop Dwell Clicking", "Stop Eye Gaze", "Stop Gaze Clicking", "Stop Dwell Clicks", "Stop Gaze Clicks",
					"Pause Dwell Clicking", "Pause Eye Gaze", "Pause Gaze Clicking", "Pause Dwell Clicks", "Pause Gaze Clicks",
				];
			}
			if (button_text.match(/^(Resume Dwell Clicking)$/i)) {
				button_text_phrases = [
					"Toggle Dwell Clicking", "Toggle Dwell Clicks",
					// enable reenable re-enable start resume unpause un-pause
					"Enable Dwell Clicking", "Enable Eye Gaze", "Enable Gaze Clicking", "Enable Dwell Clicks", "Enable Gaze Clicks",
					"Reenable Dwell Clicking", "Reenable Eye Gaze", "Reenable Gaze Clicking", "Reenable Dwell Clicks", "Reenable Gaze Clicks",
					"Re-enable Dwell Clicking", "Re-enable Eye Gaze", "Re-enable Gaze Clicking", "Re-enable Dwell Clicks", "Re-enable Gaze Clicks",
					"Start Dwell Clicking", "Start Eye Gaze", "Start Gaze Clicking", "Start Dwell Clicks", "Start Gaze Clicks",
					"Resume Dwell Clicking", "Resume Eye Gaze", "Resume Gaze Clicking", "Resume Dwell Clicks", "Resume Gaze Clicks",
					"Unpause Dwell Clicking", "Unpause Eye Gaze", "Unpause Gaze Clicking", "Unpause Dwell Clicks", "Unpause Gaze Clicks",
					"Un-pause Dwell Clicking", "Un-pause Eye Gaze", "Un-pause Gaze Clicking", "Un-pause Dwell Clicks", "Un-pause Gaze Clicks",
				];
			}
			if (button.matches(".window-close-button")) {
				button_text_phrases = [
					"close", "close button", "close window", "close window button",
					// @TODO: condition on window type
					"close dialog", "close dialog window", "close dialog button", "close dialog window button",
				];
			}
			if (button.matches(".window-maximize-button")) {
				button_text_phrases = [
					// @TODO: condition of maximized state

					"maximize", "maximize button", "maximize window", "maximize window button",
					"enlarge window", "make window large", "make window larger",

					"unmaximize", "unmaximize button", "unmaximize window", "unmaximize window button",
					"restore", "restore button", "restore window", "restore window button", "restore window size", "restore window size button",
					"enlarge window", "make window small", "make window small again", "make window smaller", "make window smaller again",
				];
			}
			if (button.matches(".window-minimize-button")) {
				button_text_phrases = [
					"minimize", "minimize button", "minimize window", "minimize window button",
					"iconify", "iconify button", "iconify window", "iconify window button",
					"minimize to tray", "minimize to tray button", "minimize to tray window", "minimize to tray window button",
					"hide window", "hide window button",
				];
			}
			// some help topics
			if (button_text.match(/^Draw a/i)) {
				button_text_phrases = [button_text, button_text.replace(/ an? /i, " ")];
			}
			// help window buttons
			if (button.closest(".help-window")) {
				if (button_text.match(/^forward$/i)) {
					button_text_phrases = [
						"forward", "forwards",
						"go forward", "go forwards", "navigate forward", "navigate forwards",
						"navigate history forward", "navigate history forwards",
						"go forward in history", "go forwards in history", "navigate forward in history", "navigate forwards in history",
					];
				}
				if (button_text.match(/^back$/i)) {
					button_text_phrases = [
						"back", "backward", "backwards",
						"go back", "navigate back", "go backward", "go backwards", "navigate backward", "navigate backwards",
						"navigate history back", "navigate history backward", "navigate history backwards",
						"go back in history", "navigate back in history", "go backward in history", "go backwards in history", "navigate backward in history", "navigate backwards in history",
					];
				}
				if (button_text.match(/^hide$/i)) {
					button_text_phrases = ["hide", "hide sidebar", "hide topics"];
				}
				if (button_text.match(/^show$/i)) {
					button_text_phrases = ["show", "show sidebar", "show topics"];
				}
			}
			// some form labels
			if (button_text.match(/:$/i)) {
				button_text_phrases = [button_text.replace(/:$/i, "")];
			}
			// some menu items
			if (button_text.match(/\.\.\.$/i)) {
				button_text_phrases = [button_text.replace(/\.\.\.$/i, "")];
			}
			if (button_text === "Tool Box") {
				button_text_phrases = ["tool box", "tool-box", "toolbox"];
			}
			if (button_text === "Color Box") {
				button_text_phrases = ["color box", "color-box", "colorbox"];
			}

			// top level menu buttons
			if (button.matches(".menu-button")) {
				button_text_phrases = [
					button_text, `${button_text} menu`,
					`show ${button_text} menu`,
					`open ${button_text} menu`,
					`access ${button_text} menu`,
					`view ${button_text} menu`,
					`show the menu for ${button_text}`,
					`open the menu for ${button_text}`,
					`access the menu for ${button_text}`,
					`view the menu for ${button_text}`,
				];
			}
			// menu items with submenus
			// (designed to fail if class name "menu-item-submenu-area" changes)
			if (button.closest(".menu-item") && button.closest(".menu-item").querySelector(".menu-item-submenu-area").innerHTML !== "") {
				button_text_phrases = [
					button_text, `${button_text} menu`,
					`show ${button_text} menu`, `show ${button_text} submenu`, `show ${button_text} sub-menu`, `show ${button_text} sub menu`,
					`open ${button_text} menu`, `open ${button_text} submenu`, `open ${button_text} sub-menu`, `open ${button_text} sub menu`,
					`access ${button_text} menu`, `access ${button_text} submenu`, `access ${button_text} sub-menu`, `access ${button_text} sub menu`,
					`view ${button_text} menu`, `view ${button_text} submenu`, `view ${button_text} sub-menu`, `view ${button_text} sub menu`,
				];
			}

			if (button_text_phrases.length === 0) {
				console.log("Button inaccessible for speech recognition:", button);
			}
			// console.log(button, button_text, button_text_phrases);
			for (const button_text_phrase of button_text_phrases) {
				const match_phrases = [button_text_phrase, `hit ${button_text_phrase}`, `press ${button_text_phrase}`, `click ${button_text_phrase}`, `click on ${button_text_phrase}`];
				for (const match_phrase of match_phrases) {
					// console.log(match_phrase, ` ${command} `.toLowerCase().indexOf(` ${match_phrase.toLowerCase()} `));
					if (` ${input_text} `.toLowerCase().indexOf(` ${match_phrase.toLowerCase()} `) !== -1) {
						add_interpretation({
							match_text: match_phrase,
							exec: ((el) => () => {
								console.log("activate", el);
								if (el.tagName === "LABEL") {
									if (el.hasAttribute("for")) {
										el = document.getElementById(el.getAttribute("for"));
									} else {
										el = el.querySelector("input");
									}
								}
								if (el.matches("input[type=checkbox]")) {
									el.checked = !el.checked;
								} else if (el.matches("input[type=radio]")) {
									el.checked = true;
								} else if (el.matches(".menu-button")) {
									// pointerdown is needed, as of writing, for activating os-gui.js's menu items
									// if click event is supported in future, this can be simplified
									const pointerdown = new PointerEvent("pointerdown", {
										bubbles: true,
										cancelable: true,
										pointerId: 12345,
										pointerType: "mouse",
										isPrimary: true,
										target: el,
										button: 0,
										buttons: 1,
									});
									// not sure if pointerup helps at all
									const pointerup = new PointerEvent("pointerup", {
										bubbles: true,
										cancelable: true,
										pointerId: 12345,
										pointerType: "mouse",
										isPrimary: true,
										target: el,
										button: 0,
										buttons: 0,
									});
									el.dispatchEvent(pointerdown);
									el.dispatchEvent(pointerup);
								} else if (el.tagName === "BUTTON") {
									clickButtonVisibly(el);
								} else {
									el.focus();
									el.click();
								}
							})(button),
							prioritize: !!button.closest(".menu-popup"),
						});
					}
				}
			}
		}

		// after the above to allow for "draw a stop sign", "stop dwell clicking"
		if (interpretations.length === 0) {
			const stop_match = input_text.match(/\b(?:stop|end|cease|(?:that's|that is) enough|enough of that|terminate|halt|put an end to(?: this)?|break off)(?: (?:drawing|sketching|painting|doodling|rendering))?\b/i);
			if (stop_match) {
				add_interpretation({
					match_text: stop_match[0],
					type: "stop-drawing",
					exec: () => {
						window.stopSimulatingGestures && window.stopSimulatingGestures();
						exports.trace_and_sketch_stop && exports.trace_and_sketch_stop();
					},
					prioritize: true,
				});
			}
		}

		// @TODO: don't support saying simply "1 pixel" if an input is focused
		// @TODO: "pencil size" (also select appropriate tool? altho you might say "brush size" for other tools)
		const line_width_match = input_text.match(/\b(?:set|use|pick)? ?(?:(?:line|stroke|outline) (?:width|size|thickness))? ?(?:to)? ?(\d+|single|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|a hundred|one hundred|smallest|largest|littlest|biggest|small|large|little|big|tiny|huge|puny|massive|medium) ?(?:px|pixels?)? ?(?:(?:wide|thick|sized)? ?(?:for)? ?(?:(?:out)?lines?)?|(?:width|size|thickness)) ?(?:(?:out)?lines?)?\b/i);
		if (line_width_match) {
			const size_str = line_width_match[1];
			let n = parseInt(size_str, 10);
			switch (size_str.toLowerCase()) {
				case "zero": n = 0; break;
				case "single": n = 1; break;
				case "one": n = 1; break;
				case "two": n = 2; break;
				case "three": n = 3; break;
				case "four": n = 4; break;
				case "five": n = 5; break;
				case "six": n = 6; break;
				case "seven": n = 7; break;
				case "eight": n = 8; break;
				case "nine": n = 9; break;
				case "ten": n = 10; break;
				case "eleven": n = 11; break;
				case "twelve": n = 12; break;
				case "thirteen": n = 13; break;
				case "fourteen": n = 14; break;
				case "fifteen": n = 15; break;
				case "sixteen": n = 16; break;
				case "seventeen": n = 17; break;
				case "eighteen": n = 18; break;
				case "nineteen": n = 19; break;
				case "twenty": n = 20; break;
				case "a hundred": n = 100; break;
				case "one hundred": n = 100; break;
			}
			add_interpretation({
				match_text: line_width_match[0],
				size: n,
				exec: () => {
					if (isFinite(n)) {
						// @TODO: DRY with app.js
						if (selected_tool.id === TOOL_BRUSH) {
							brush_size = Math.max(1, Math.min(n, 500));
						} else if (selected_tool.id === TOOL_ERASER) {
							eraser_size = Math.max(1, Math.min(n, 500));
						} else if (selected_tool.id === TOOL_AIRBRUSH) {
							airbrush_size = Math.max(1, Math.min(n, 500));
						} else if (selected_tool.id === TOOL_PENCIL) {
							pencil_size = Math.max(1, Math.min(n, 50));
						} else if (
							selected_tool.id === TOOL_LINE ||
							selected_tool.id === TOOL_CURVE ||
							selected_tool.id === TOOL_RECTANGLE ||
							selected_tool.id === TOOL_ROUNDED_RECTANGLE ||
							selected_tool.id === TOOL_ELLIPSE ||
							selected_tool.id === TOOL_POLYGON
						) {
							stroke_size = Math.max(1, Math.min(n, 500));
						}

						$G.trigger("option-changed");
						if (button !== undefined && pointer) { // pointer may only be needed for tests
							selected_tools.forEach((selected_tool) => {
								tool_go(selected_tool);
							});
						}
						update_helper_layer();
					} else {
						show_error_message(`Keywords like '${line_width_match[1]}' are not supported yet. Try a number of pixels instead.`);
					}
				},
			});
		}

		// @TODO: "scroll to bottom", "scroll by three pages" etc.
		const scrolling_regexp = /\b(?:(?:scroll|pan|move|page)(?:(?: the)? view(?:port)?)?|go|view(?:port)?|look)( to( the)?)? (?:up|down|left|right|north|south|west|east|north ?west|south ?west|north ?east|south ?east)(?:wards?)?(( and)?( to( the)?)? (?:up|down|left|right|north|south|west|east)(wards?)?)?\b(( by)?( a| one)? page)?/i;
		const scroll_match = input_text.match(scrolling_regexp);
		if (scroll_match) {
			const directions = scroll_match[0];
			const vector = { x: 0, y: 0 };
			if (directions.match(/up|north/i)) {
				vector.y = -1;
			}
			if (directions.match(/down|south/i)) {
				vector.y = +1;
			}
			if (directions.match(/left|west/i)) {
				vector.x = -1;
			}
			if (directions.match(/right|east/i)) {
				vector.x = +1;
			}
			const scroll_pane_el = $(".window *").toArray().filter((el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)[0] || $canvas_area[0];
			add_interpretation({
				match_text: scroll_match[0],
				exec: () => {
					const factor = directions.match(/page/) ? 1 : 1 / 2;
					// scroll_pane_el.scrollLeft += vector.x * scroll_pane_el.clientWidth * factor;
					// scroll_pane_el.scrollTop += vector.y * scroll_pane_el.clientHeight * factor;
					$(scroll_pane_el).animate({
						scrollLeft: scroll_pane_el.scrollLeft + vector.x * scroll_pane_el.clientWidth * factor,
						scrollTop: scroll_pane_el.scrollTop + vector.y * scroll_pane_el.clientHeight * factor,
					}, 500);
				},
				vector,
				prioritize: true,
			});
		}

		if (document.activeElement && document.activeElement.matches(textual_input_selector)) {
			const new_line_match = input_text.match(/^(?:new line|newline|line break|return|enter|carriage return|)$|\b(?:(?:insert|add|put|put in|input)(?: an?)? (?:new line|newline|line break|return|enter|carriage return))\b/i);
			if (new_line_match) {
				add_interpretation({
					match_text: new_line_match[0],
					exec: () => {
						document.execCommand("insertText", false, "\n");
					},
				});
			}
		}
		if (window.textbox) {
			const stop_match = input_text.match(/\b(?:(?:finish(?:ed)?|done)(?: with)? (text|text input|textbox|text box|writing))\b/i);
			if (stop_match) {
				add_interpretation({
					match_text: stop_match[0],
					exec: deselect,
					prioritize: true,
				});
			}
		}
		if (window.selection) {
			const stop_match = input_text.match(/\b(?:(?:finish(?:ed)?|done)(?: with)? selection|deselect|unselect)\b/i);
			if (stop_match) {
				add_interpretation({
					match_text: stop_match[0],
					exec: deselect,
					prioritize: true,
				});
			}
		}
		if (interpretations.length === 0 && default_to_entering_text && input_text.length) {
			if (document.activeElement && document.activeElement.matches(textual_input_selector)) {
				const text_to_insert = input_text.replace(/new[ -]?line|line[ -]?break|carriage return/g, "\n");
				add_interpretation({
					match_text: input_text,
					exec: () => {
						if (document.activeElement && document.activeElement.matches("input[type='number']")) {
							document.activeElement.value = input_text;
						} else {
							document.execCommand("insertText", false, text_to_insert);
						}
					},
					prioritize: true,
				});
			}
		}

		// @TODO: more nuanced command matching, probably multiplying confidence levels together
		// and giving lower confidence for things that start in the middle of the phrase
		// and like higher confidence in "stop" if it's actively drawing

		return interpretations;
	};

	exports.trace_and_sketch = (subject_imagedata) => {
		exports.trace_and_sketch_stop && exports.trace_and_sketch_stop();

		// @TODO: clickable cancel button? (in addition to Escape key handling and the "stop" voice command)

		// I'm suggesting saying "stop drawing" rather than "stop" because I think it's more likely to be picked up as speech at all
		$status_text.text(`To stop drawing, ${exports.speech_recognition_active ? `say "stop drawing", or ` : ""}press Esc.`);

		// const subject_imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// const pal = palette.map((color)=> get_rgba_from_color(color)).map(([r, g, b, a])=> ({r, g, b, a}));
		const trace_data = ImageTracer.imagedataToTracedata(subject_imagedata, { ltres: 1, qtres: 0.01, scale: 10, /*pal,*/ numberofcolors: 6, });
		const { layers } = trace_data;
		const brush = get_tool_by_id(TOOL_BRUSH);
		select_tool(brush);

		let layer_index = 0;
		let path_index = 0;
		let segment_index = 0;
		let active_path;
		window.sketching_iid = setInterval(() => {
			const layer = layers[layer_index];
			if (!layer) {
				clearInterval(window.sketching_iid);
				return;
			}
			const path = layer[path_index];
			if (!path) {
				path_index = 0;
				segment_index = 0;
				layer_index += 1;
				return;
			}
			const segment = path.segments[segment_index];
			if (!segment) {
				segment_index = 0;
				path_index += 1;
				brush.pointerup(main_ctx, pointer.x, pointer.y);
				return;
			}
			let { x1, y1, x2, y2 } = segment;
			if (path !== active_path) {
				pointer_previous = { x: x1, y: y1 };
				pointer = { x: x1, y: y1 };
				brush.pointerdown(main_ctx, x1, y1);
				active_path = path;
			}
			pointer_previous = { x: x1, y: y1 };
			pointer = { x: x2, y: y2 };
			brush.paint();
			pointer_active = true;
			pointer_over_canvas = true;
			update_helper_layer();
			segment_index += 1;
		}, 20);
	};
	exports.trace_and_sketch_stop = () => {
		clearInterval(window.sketching_iid);
		pointer_active = false;
		pointer_over_canvas = false;
	};

	function find_clipart_and_sketch(subject_matter) {
		find_clipart(subject_matter).then((results) => {

			// @TODO: select less complex images (less file size to width, say?) maybe, and/or better semantic matches by looking for the search terms in the title?
			// detect gradients / spread out histogram at least, and reject based on that
			let image_url = results[~~(Math.random() * results.length)].image_url;
			console.log("Using source image:", image_url);
			if (!image_url.match(/^data:/)) {
				image_url = `https://jspaint-cors-proxy.herokuapp.com/${image_url}`;
			}
			const img = new Image();
			img.crossOrigin = "Anonymous";
			img.onerror = () => {
				$status_text.text("Failed to load clipart.");
			};
			img.onload = () => {
				// @TODO: find an empty spot on the canvas for the sketch, smaller if need be
				const max_sketch_width = 500;
				const max_sketch_height = 500;
				let aspect_ratio = img.width / img.height;
				let width = Math.min(img.width, max_sketch_width);
				let height = Math.min(img.height, max_sketch_height);
				if (width / height < aspect_ratio) {
					height = width / aspect_ratio;
				}
				if (width / height > aspect_ratio) {
					width = height * aspect_ratio;
				}
				const img_canvas = make_canvas(width, height);
				img_canvas.ctx.drawImage(img, 0, 0, width, height);
				const image_data = img_canvas.ctx.getImageData(0, 0, img_canvas.width, img_canvas.height);
				resize_canvas_without_saving_dimensions(Math.max(main_canvas.width, image_data.width), Math.max(main_canvas.height, image_data.height));
				trace_and_sketch(image_data);
			};
			img.src = image_url;
		}, (error) => {
			if (error.code === "no-results") {
				$status_text.text(`No clipart found for '${subject_matter}'`);
			} else {
				show_error_message("Failed to find clipart.", error);
			}
		});
	}

	function find_clipart(query) {
		const bing_url = new URL(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:photo-clipart&FORM=IRFLTR`)
		return fetch(`https://jspaint-cors-proxy.herokuapp.com/${bing_url}`)
			.then(response => response.text())
			.then((html) => {
				// handle relative data-src
				html = html.replace(
					/((?:data-src)=["'])(?!(?:https?:|data:))(\/?)/gi,
					($0, $1, $2) => `${$1}${bing_url.origin}${$2 ? bing_url.pathname : ""}`
				);
				// handle relative src and href in a less error-prone way, with a <base> tag
				const doc = new DOMParser().parseFromString(html, "text/html");
				const $html = $(doc.documentElement);
				const base = doc.createElement("base");
				base.href = bing_url.origin + bing_url.pathname;
				doc.head.appendChild(base);

				window.search_page_html = html;
				window.search_page_$html = $html;
				console.log("window.search_page_html and window.search_page_$html are a available for debugging");

				const validate_item = (item) => item.image_url && (item.image_url.match(/^data:/) ? item.image_url.length > 1000 : true);

				let items = $html.find("[m]").toArray()
					.map((el) => el.getAttribute("m"))
					.map((json) => {
						try {
							return JSON.parse(json);
						} catch (error) {
							return null;
						}
					})
					.filter((maybe_parsed) => maybe_parsed && maybe_parsed.murl)
					.map(({ murl, t }) => ({ image_url: murl, title: t || "" }))
					.filter(validate_item);

				// fallback to thumbnails in case they get rid of the "m" attribute (thumbnails are not as good, more likely to be jpeg)
				if (items.length === 0) {
					console.log("Fallback to thumbnails");
					items = $html.find("img.mimg").toArray()
						.map((el) => ({ image_url: el.src || el.dataset.src, title: "" }))
						.filter(validate_item);
				}
				// fallback in case they also change the class for images (this may match totally irrelevant things)
				if (items.length === 0) {
					console.log("Fallback to most imgs");
					items = $html.find("img:not(.sw_spd):not(.rms_img):not(.flagIcon)").toArray()
						.filter((el) => !el.closest("[role='navigation'], nav")) // ignore "Related searches", "Refine your search" etc.
						.map((el) => ({ image_url: el.src || el.dataset.src, title: "" }))
						.filter(validate_item);
				}
				console.log(`Search results for '${query}':`, items);
				if (items.length === 0) {
					const error = new Error(`failed to get clipart: no results returned for query '${query}'`);
					error.code = "no-results";
					throw error;
				}
				return items;
			})
	}

	function clickButtonVisibly(button) {

		// pointerdown/pointerup may have been just for os-gui.js's menus, which are now handled separately
		// I should probably remove this part
		$(button).trigger($.Event("pointerdown", {
			pointerId: 12345,
			pointerType: "mouse",
			button: 0,
			buttons: 1,
			isPrimary: true,
		}));
		$(button).trigger($.Event("pointerup", {
			pointerId: 12345,
			pointerType: "mouse",
			button: 0,
			buttons: 0,
			isPrimary: true,
		}));

		if (button.matches("button:not(.toggle)")) {
			button.style.borderImage = "var(--inset-deep-border-image)";
			setTimeout(() => {
				button.style.borderImage = "";
				// delay the button.click() as well, so the pressed state is
				// visible even if the button action closes a dialog
				window.untrusted_gesture = true;
				button.click();
				window.untrusted_gesture = false;
			}, 100);
		} else {
			window.untrusted_gesture = true;
			button.click();
			window.untrusted_gesture = false;
		}
	}

	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}

	function test_command(input_text, expected, from_speech_text) {
		const interpretations = interpret_command(input_text);
		const failed_message = `Failed test.${from_speech_text ? ` (From speech '${from_speech_text}')` : ""}`;
		if (expected === null) {
			if (interpretations.length > 0) {
				console.error(`${failed_message}
	Expected '${input_text}' to have no interpretations; saw`, interpretations);
			}
			return;
		}
		if (interpretations.length === 0) {
			console.error(`${failed_message}
	Expected '${input_text}' to be interpreted as`, expected, `but found no interpretations`);
			return;
		}
		const interpretation = choose_interpretation(interpretations);
		const actual = Object.assign({}, interpretation, { prioritize: undefined, exec: undefined });
		// expected.match_text = expected.match_text || input_text; // puts key in wrong order
		expected = Object.assign({ match_text: input_text }, expected);
		const expected_json = JSON.stringify(expected, null, 4);
		const actual_json = JSON.stringify(actual, null, 4);
		if (expected_json !== actual_json) {
			console.error(`${failed_message}
	Expected '${input_text}' to be interpreted as ${expected_json} but it was interpreted as ${actual_json}
	Note: object key order matters in this test! Functions don't count.
	All interpretations:`, interpretations);
			return;
		}
		if (!from_speech_text) {
			// Also verify that if you said exactly this input, speech recognition fixes would not mess it up.
			const fixed_up_input_text = fix_up_speech_recognition(input_text);
			if (fixed_up_input_text !== input_text) {
				console.error(`Failed test. Speech recognition fixup changed the input from:
	'${input_text}' to:
	'${fixed_up_input_text}'`);
				return;
			}
		}
	}

	function test_speech(input_text, expected) {
		const fixed_up_input_text = fix_up_speech_recognition(input_text);
		if (typeof expected === "string") {
			if (fixed_up_input_text !== expected) {
				console.error(`Failed test. Speech recognition fixup changed the input from:
	'${input_text}' to:
	'${fixed_up_input_text}' instead of:
	'${expected}'`);
				return;
			}
		} else {
			test_command(fixed_up_input_text, expected, input_text);
		}
	}

	function test_speech_recognition() {
		// test_command("select blue", {color: "blue"}); // @FIXME
		test_command("select fill", { tool_id: TOOL_FILL });
		test_command("select text", { tool_id: TOOL_TEXT });
		test_command("select", { tool_id: TOOL_SELECT });
		test_speech("free form select", { tool_id: TOOL_FREE_FORM_SELECT });
		test_speech("lips", { match_text: "ellipse", tool_id: TOOL_ELLIPSE });
		test_command("", null);
		// test_command("I got you some new books", null);
		// test_command("pan view sorthweast", null); // currently opens View menu
		test_command("1 pixel lines", { size: 1 });
		test_command("1 pixel wide lines", { size: 1 });
		test_command("set line width to 5", { size: 5 });
		// test_command("use medium-small stroke size", {match_text: "use medium-small stroke size", size: NaN});
		test_speech("set line lips to a hundred", { match_text: "set line width to a hundred", size: 100 });
		test_command("use stroke size 10 pixels", { size: 10 });
		// test_command("use stroke size of 10 pixels", {match_text: "use stroke size of 10 pixels", size: 10});
		test_command("draw a :-)", { sketch_subject: "smiley face" });
		// test_command("draw sample text", {sketch_subject: "sample text"}); // @FIXME
		test_command("end", { type: "stop-drawing" });
		test_command("stop", { type: "stop-drawing" });
		test_command("draw a stop sign", { sketch_subject: "stop sign" });

		test_command("pan view southwest", { vector: { x: -1, y: +1 } });
		test_command("pan southeast", { vector: { x: +1, y: +1 } });
		test_command("move view northwest", { vector: { x: -1, y: -1 } });
		test_command("view northwest", { vector: { x: -1, y: -1 } });
		test_command("move viewport northwest", { vector: { x: -1, y: -1 } });
		test_command("pan down", { vector: { x: 0, y: +1 } });
		test_command("scroll down", { vector: { x: 0, y: +1 } });
		test_command("go downwards", { vector: { x: 0, y: +1 } });
		test_command("go upward", { vector: { x: 0, y: -1 } });
		test_command("go downwards and to the left", { vector: { x: -1, y: +1 } });
		test_command("go up to the left", { vector: { x: -1, y: -1 } });
		test_speech("cool up", { match_text: "go up", vector: { x: 0, y: -1 } });
		test_command("scroll the view southward", { vector: { x: 0, y: +1 } });

	}

	var should_test_speech_recognition = false;
	try {
		should_test_speech_recognition = localStorage.test_speech_recognition === "true";
		// eslint-disable-next-line no-empty
	} catch (error) { }
	if (should_test_speech_recognition) {
		$(test_speech_recognition);
	}

}(window));
