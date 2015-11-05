// Localization Module

function localize(language, language_file) {
	language = language || "en_US";
	language_file = language_file || require("path").resolve("../locales/" + language + ".txt");
	
	
	var fs = require("fs");
	if (!fs.existsSync(language_file)) {
		language = "en_US";
		language_file = require("path").resolve("../locales/" + language + ".txt");
	}
	
	var language_file_contents = fs.readFileSync(language_file);
	
	var parser = require("./fileparser");
	var language_data = new parser(language_file_contents).parse();
	
	this.translate = function() {
		var locale = arguments[0] || "";
		var sentence = language_data[locale] || locale;
		for (var i = 1; i < arguments.length; i++) {
			sentence = sentence.replace(new RegExp("%" + i, "g"), arguments[i]);
		}
		return sentence;
	}
}

module.exports = localize;
