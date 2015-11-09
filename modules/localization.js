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
		if (locale.toLowerCase().indexOf("localization:") === 0) {
			locale = locale.substring(13);
		}
		var sentence = language_data[locale] || locale;
		for (var i = 1; i < arguments.length; i++) {
			sentence = sentence.replace(new RegExp("%" + i, "g"), arguments[i]);
		}
		sentence = sentence.replace(new RegExp("%favorite_language", "g"), config.get("favorites.language"));
		sentence = sentence.replace(new RegExp("%favorite_framework", "g"), config.get("favorites.framework"));
		sentence = sentence.replace(new RegExp("%favorite_ide", "g"), config.get("favorites.ide"));
		sentence = sentence.replace(new RegExp("%favorite_viewer", "g"), config.get("favorites.viewer"));
		sentence = sentence.replace(new RegExp("%favorite_music", "g"), config.get("favorites.music"));
		sentence = sentence.replace(new RegExp("%channel", "g"), config.get("LCTV.channel"));
		sentence = sentence.replace(new RegExp("%lctv_user", "g"), config.get("LCTV.username"));
		sentence = sentence.replace(new RegExp("%task", "g"), config.get("current_task"));
		sentence = sentence.replace(new RegExp("%tools", "g"), config.get("tools"));
		sentence = sentence.replace(new RegExp("%song", "g"), config.get("current_music"));
		return sentence;
	}
}

module.exports = localize;
