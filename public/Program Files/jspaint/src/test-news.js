/*
Automated checks to catch errors before publishing a news update:
- The <time> element's datetime attribute is set to the date of the update.
- The <time> element's text content is set to the date of the update.
- The id of the <article> is unique and follows the format 'news-YYYY-some-topic'.
- All <a> elements have a target="_blank" attribute.
- All <a> elements have an href attribute.

HTML validity checking is not performed.
*/

const newsEl = document.querySelector('#news');
const articles = newsEl.querySelectorAll('article');
const articleIDs = [];
for (const article of articles) {
	// Check id
	if (articleIDs.includes(article.id)) {
		console.error(`Duplicate article id: #${article.id}`, article);
	}
	articleIDs.push(article.id);
	if (!article.id.startsWith('news-')) {
		console.error(`Article id does not start with 'news-': #${article.id}`, article);
	}

	// Check date
	const time = article.querySelector('time');
	if (!time) {
		console.error(`Missing <time> element in article #${article.id}`, article);
	} else {
		const datetime = time.getAttribute('datetime');
		const dateText = time.textContent;
		if (!datetime) {
			console.error(`Missing datetime attribute in <time> element in article #${article.id}`, time);
		}
		if (!dateText) {
			console.error(`Missing text content in <time> element in article #${article.id}`, time);
		}
		// This doesn't handle time zones:
		// if (new Date(datetime).toUTCString() !== new Date(dateText).toUTCString()) {
		// 	console.error(
		// 		`Mismatch between datetime attribute and text content in <time> element in article #${article.id}`,
		// 		time,
		// 		`\ndatetime: ${datetime}`,
		// 		`\ntext: ${dateText}`,
		// 		`\n${new Date(datetime).toUTCString()} !== ${new Date(dateText).toUTCString()}`
		// 	);
		// }
		// I'm just using ISO 8601 date format for now.
		if (datetime && dateText && datetime !== dateText) {
			console.error(
				`Mismatch between datetime attribute and text content in <time> element in article #${article.id}`,
				time,
				`\n${JSON.stringify(datetime)} !== ${JSON.stringify(dateText)}`
			);
		}
		if (datetime) {
			// Check id matches date
			const expectedYYYY = new Date(datetime).getFullYear().toString();
			if (!article.id.includes(`-${expectedYYYY}-`)) {
				console.error(`Article id does not contain expected year: #${article.id}`,
					`\nexpected: "-${expectedYYYY}-"`,
					`\nactual: ${JSON.stringify(article.id.substring(4, 10))}`
				);
			}
		}
	}

	// Check links
	const links = article.querySelectorAll('a');
	for (const link of links) {
		const target = link.getAttribute('target');
		const href = link.getAttribute('href');
		if (target !== '_blank') {
			console.error(`target is not "_blank"`, link);
		}
		if (!href) {
			console.error(`href is not set`, link);
		}
	}
}
