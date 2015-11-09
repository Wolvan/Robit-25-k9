// A module that loads languge files and 
// handles translating sentences. Additionally
// it replaces special variables with proper
// information. More about these in the README.md

// language is the language modifier, eg. "en_US"
// config is the global config object we get from the wrapper or require("config")
// language_file is optional and a path to a language file, if it's outside of /locales/
function localize(language, config, language_file) {
	config = config || require("config");
	
	language = language || "en_US";
	language_file = language_file || require("path").resolve("./locales/" + language + ".json");
	
	// Check that the language file actually exists, fall back to
	// en_US if not.
	var fs = require("fs");
	if (!fs.existsSync(language_file)) {
		language = "en_US";
		language_file = require("path").resolve("./locales/" + language + ".json");
	}
	
	var language_file_contents = fs.readFileSync(language_file);
	
	var language_data = JSON.parse(language_file_contents);
	
	// Use the translation file to try and translate any text it gets
	// The first argument is the text you want to translate, either a
	// named string from the locales file or just text to work with
	// Any further argument gets inserted into the string in place of
	// %argument_nr, for example .translate("Hello %1", "World") would
	// result in "Hello World".
	// This function also replaces a bunch of special variables, more
	// about those in the README.md
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
