// Localization Module

function localize(language, config, language_file) {
	config = config || require("config");
	
	language = language || "en_US";
	language_file = language_file || require("path").resolve("./locales/" + language + ".json");
	
	var fs = require("fs");
	if (!fs.existsSync(language_file)) {
		language = "en_US";
		language_file = require("path").resolve("./locales/" + language + ".json");
	}
	
	var language_file_contents = fs.readFileSync(language_file);
	
	var language_data = JSON.parse(language_file_contents);
	
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
