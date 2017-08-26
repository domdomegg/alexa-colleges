var fs = require('fs');
fs.readFile(__dirname + '/editor.json', function(err, data) {
	if (err) {
		throw err;
	}
	let editor = JSON.parse(data.toString());

	fs.readFile(__dirname + '/colleges.txt', function(err, data) {
		let strings = data.toString().split('\n');
		editor.types[0].values = [];
        for(let i = 0; i < 1500; i++) {
            editor.types[0].values.push({
				"id": null,
				"name": {
					"value": strings[i*5],
					"synonyms": []
				}
			});
        }

		fs.writeFile(__dirname + "/editor.json", JSON.stringify(editor, null, 4), 'utf8', function(err) {
			if (err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		});
	});
});
