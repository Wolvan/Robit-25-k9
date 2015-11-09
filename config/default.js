// This is the default configuration file for the bot
// and shouldn't be changed. Instead, either create a
// local.EXT file in this folder, overriding ONLY the
// config changes you need. See the README.md for more
// information about supported file formats.
// Config changes require a restart of the bot.
module.exports = {
	// The config for the LCTV connection
	// defaults to reading in the Environment
	// variables LCTV_USERNAME, LCTV_PASSWORD
	// and LCTV_CHANNEL
	"LCTV": {
		"username": process.env.LCTV_USERNAME,
		"password": process.env.LCTV_PASSWORD,
		"channel": process.env.LCTV_CHANNEL
	},
	
	// Set your favorite information here, or use
	// the chat commands once the bot is started
	"favorites": {
		"language": "",
		"framework": "",
		"ide": "",
		"viewer": "",
		"music": ""
	},
	// More settings that can be set
	"current_music": "Nothing",
	"current_task": "",
	"tools": "",
	
	// Properties_as_commands allows to use the !set <property> command
	// for custom information commands, eg. "!set greet Hello World!" would
	// allow users to do !greet, which in turn makes the bot say "Hello World!"
	"properties_as_commands": true,
	
	// The default language you want the bot to have
	// Choosing an invalid language falls back to en_US
	// All the locales are in the /locales/ subfolder,
	// add your own there or modify one if you like
	"language": "en_US",
	
	// auto_messages_interval defines the time between automatic
	// messages and defaults to 10 minutes. auto_messages is
	// an array of all the messages the bot should send.
	// All the messages go through localization, so you can
	// have them in multiple languages, an example is
	// "localization:tools" ("localization:" being optional, but makes
	// it more obvious that this is part of the translation file)
	"auto_messages_interval": 6000000, // 600000 milliseconds => 600 seconds => 10 minutes between auto messages
	"auto_messages":[
		"I am working on %task! Have you ever done something like this?",
		"Are you a professional engineer or CS student?",
		"Am in Austria. Which country are you in?",
		"Donate to my channel and request any song the whole month",
		"Donate to my channel and the bot will give you a VIP greeting for the month",
		"localization:tools",
		"localization:current_song"
	]
}