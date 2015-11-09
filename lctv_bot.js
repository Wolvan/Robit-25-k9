// This is the main file of the application which starts
// and manages all the modules. The brain if you will.

// This part grabs the command line arguments and parses them
// You can specify username, password, channel and a config file
// from the command line or print the possible arguments
var args_values = {}
process.argv.forEach(function (val, index, array) {
	// Check if the arg is one of the identifiers and parse it
	switch (val.toLowerCase()) {
		case "--username":
		case "-u":
			args_values.username = process.argv[index + 1];
			break;
		case "--password":
		case "-p":
			args_values.password = process.argv[index + 1];
			break;
		case "--channel":
		case "-c":
			args_values.channel = process.argv[index + 1];
			break;
		case "-config":
			// Copies the config file to the /config/local.extension
			// of the node script, which is always parsed last by
			// config
			var configFile = require("path").resolve(process.argv[index + 1]);
			var fileExt = configFile.substring(configFile.lastIndexOf("."));
			require("fs-extra").copySync(configFile, "./config/local" + fileExt);
			break;
		case "-help":
			// Print usage here
			console.log(
				"Livecoding.tv Chat Bot\n" +
				"Usage:\n" +
				"lctv-bot [-u|--username <LCTV Username>] [-p|--password <LCTV Password>]\n[-c|--channel <LCTV Channel>] [-config <Config File>]"
			);
			process.exit();
			break;
	}
});

// Get the config and the storage modules ready here
// storage will be something the script writes to while
// config is for user-created fileSize
// configwrapper is an intermediate layer between the config
// itself, because the script won't be able to modify
// the config object later on anymore
var configwrapper = require("./modules/configwrapper");
var config = new configwrapper(require("config"));
var storage = require("json-fs-store")("./storage/");

// In case of command line arguments, set channel, password and
// username here
if (typeof args_values.username !== "undefined") { config.set("LCTV.username", args_values.username); }
if (typeof args_values.password !== "undefined") { config.set("LCTV.password", args_values.password); }
if (typeof args_values.channel !== "undefined") { config.set("LCTV.channel", args_values.channel); }

// This function just reads in the stored properties from the
// storage and adds them to the config object whenever it's called
function fill_config() {
	storage.list(function(err, obj) {
		if(err) {
			console.log("An error occured while listing the storage");
			console.log(err);
			return;
		}
		config.removeAll();
		if (typeof args_values.username !== "undefined") {
			config.set("LCTV.username", args_values.username);
		}
		if (typeof args_values.password !== "undefined") {
			config.set("LCTV.password", args_values.password);
		}
		if (typeof args_values.channel !== "undefined") {
			config.set("LCTV.channel", args_values.channel);
		}
		for (var x in obj) {
			if (obj[x].name.indexOf("property-") !== -1) {
				switch(obj[x].name.replace("property-", "")) {
					case "locale":
						config.set("language", obj[x].value);
						locale = new localization(config.get("language"), config);
						break;
					case "task":
						config.set("current_task", obj[x].value);
						break;
					case "music":
						config.set("current_music", obj[x].value);
						break;
					case "tools":
						config.set("tools", obj[x].value);
						break;
					case "fav_lang":
						config.set("favorites.language", obj[x].value);
						break;
					case "fav_framework":
						config.set("favorites.framework", obj[x].value);
						break;
					case "fav_ide":
						config.set("favorites.ide", obj[x].value);
						break;
					case "fav_viewer":
						config.set("favorites.viewer", obj[x].value);
						break;
					case "fav_music":
						config.set("favorites.music", obj[x].value);
						break;
				}
			}
		}
	});
}
fill_config();

// This is where pretty much all custom modules are being loaded
// And properly initialized. lctv_chat is the connection to the
// Livecoding.tv chat servers and probably the most important part.
// localization is the module that handles different languages.
// autotext is responsible for having automatic messages every x
// milliseconds
// For more information, check the /module/ folder
var lctv_chat = require("./modules/lctv_chat");
var localization = require("./modules/localization")
var locale = new localization(config.get("language"), config);
var autotext = new require("./modules/autotext")
var automsgs = new autotext(config.get("auto_messages_interval"), config.get("auto_messages"), true);

// Create a new chat connection with the information
// stored in the config object
var lctv_bot = new lctv_chat(config.get("LCTV.username"), config.get("LCTV.password"), config.get("LCTV.channel"), "!")
// An error occured with a stanza? We handle it by just
// printing the stanza. Since this is most likely just a
// malformed stanza there's no need to crash, now is there?
.on("error", function(stanza) {
	console.log("An error occurred with the following stanza: " + stanza.toString());
})
// Someone used a comment here, we gotta evaluate that
.on("command", function(cmd, from, args) {
	switch(cmd.toLowerCase()) {
		// The next few cases are just different information commands
		// for users who are interested. It reads the exact text from
		// the localization
		case "favorite_language":
			this.say(locale.translate("favorite_language"));
			break;
		case "favorite_framework":
			this.say(locale.translate("favorite_framework"));
			break;
		case "favorite_ide":
			this.say(locale.translate("favorite_ide"));
			break;
		case "favorite_viewer":
			this.say(locale.translate("favorite_viewer"));
			break;
		case "favorite_music":
			this.say(locale.translate("favorite_music"));
			break;
		case "streamingguide":
			this.say(locale.translate("lctv_streamguide"));
			break;
		case "support":
			this.say(locale.translate("lctv_support_msg"));
			break;
		case "newfeatures":
			this.say(locale.translate("lctv_new_features"));
			break;
		case "song":
			this.say(locale.translate("current_song"))
			break;
		case "tools":
			this.say(locale.translate("tools"));
			break;
		case "task":
			this.say(locale.translate("I currently work on %task"));
			break;
		// This is where the commands get more interesting. "vip" allows
		// a stream mod to add people to a list of VIPs that get a special
		// greeting and maybe future perks
		case "vip":
			// This check makes sure that only chat mods can use the VIP command
			if (!this.userlist[from]) {
				this.say(from + ", you are not allowed to use this command.");
				break;
			}
			var mode = args[0] || "";
			switch(mode.toLowerCase()) {
				case "add":
					var user = args[1] || "";
					user = user.toLowerCase();
					storage.load("user_join_amount-" + user, function(err, obj) {
						var join_times = -1;
						var isVIP = true;
						if (err) {
							join_times = 0;
						} else {
							join_times = obj.join_times;
						}
						storage.add({
							id: "user_join_amount-" + user,
							name: "user_join_amount-" + user,
							join_times: join_times,
							is_VIP: isVIP
							}, function(err) {
								if (err) { console.log("Failed to store value"); console.log(err); return; }
								lctv_bot.say(locale.translate("give_vip", user));
						});
					});
					break;
				case "remove":
					var user = args[1] || "";
					user = user.toLowerCase();
					storage.load("user_join_amount-" + user, function(err, obj) {
						var join_times = -1;
						var isVIP = false;
						if (err) {
							join_times = 0;
						} else {
							join_times = obj.join_times;
						}
						storage.add({
							id: "user_join_amount-" + user,
							name: "user_join_amount-" + user,
							join_times: join_times,
							is_VIP: isVIP
							}, function(err) {
							if (err) { console.log("Failed to store value"); console.log(err); return; }
							lctv_bot.say(locale.translate("remove_vip", user));
						});
					});
					break;
				case "help":
					this.say(locale.translate("help_vip"));
					break;
				case "list":
					storage.list(function(err, obj) {
						var vips = [];
						if(err) {
							console.log("An error occured while listing the storage");
							console.log(err);
							return;
						}
						for (var x in obj) {
							if (obj[x].name.indexOf("user_join_amount") !== -1) {
								if(obj[x].is_VIP) {
									vips.push(obj[x].name.replace("user_join_amount-", ""));
								}
							}
						}
						lctv_bot.say(locale.translate("list_vip", vips.join(", ")));
					});
					break;
				default:
					this.say(locale.translate("help_vip"));
					break;
			}
			break;
		// This is another command that allows to set different bot
		// aspects right from the chat. No config editing and restart
		// required to do so.
		case "set":
			// Again, make sure that only mods can use the command
			if (!this.userlist[from]) {
				this.say(from + ", you are not allowed to use this command.");
				break;
			}
			var mode = args.splice(0,1)[0] || "";
			switch(mode.toLowerCase()) {
				case "language":
					var newLang = args[0] || "en_US";
					locale = new localization(newLang);
					this.say(locale.translate("change_locale", newLang));
					storage.add({
						id: "property-locale",
						name: "property-locale",
						value: newLang,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); }
					});
					break;
				case "task":
					var newTask = args.join(" ") || "no current task";
					this.say(locale.translate("change_property", "task", newTask));
					storage.add({
						id: "property-task",
						name: "property-task",
						value: newTask,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						fill_config();
					});
					break;
				case "current_music":
					var current_music = args.join(" ") || "nothing";
					this.say(locale.translate("change_property", "current_music", current_music));
					storage.add({
						id: "property-music",
						name: "property-music",
						value: current_music,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						fill_config();
					});
					break;
				case "tools":
					var newTools = args.join(" ") || "";
					this.say(locale.translate("change_property", "tools", newTools));
					storage.add({
						id: "property-tools",
						name: "property-tools",
						value: newTools,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						fill_config();
					});
					break;
				case "fav_lang":
					var fav_lang = args.join(" ") || "";
					this.say(locale.translate("change_property", "fav_lang", fav_lang));
					storage.add({
						id: "property-fav_lang",
						name: "property-fav_lang",
						value: newTask,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						fill_config();
					});
					break;
				case "fav_framework":
					var fav_framework = args.join(" ") || "";
					this.say(locale.translate("change_property", "fav_framework", fav_framework));
					storage.add({
						id: "property-fav_framework",
						name: "property-fav_framework",
						value: newTask,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						fill_config();
					});
					break;
				case "fav_ide":
					var newTask = args.join(" ") || "";
					this.say(locale.translate("change_property", "fav_ide", fav_ide));
					storage.add({
						id: "property-fav_ide",
						name: "property-fav_ide",
						value: newTask,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						fill_config();
					});
					break;
				case "fav_viewer":
					var newTask = args.join(" ") || "";
					this.say(locale.translate("change_property", "fav_viewer", fav_viewer));
					storage.add({
						id: "property-fav_viewer",
						name: "property-fav_viewer",
						value: newTask,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						fill_config();
					});
					break;
				case "fav_music":
					var fav_music = args.join(" ") || "";
					this.say(locale.translate("change_property", "fav_music", fav_music));
					storage.add({
						id: "property-fav_music",
						name: "property-fav_music",
						value: newTask,
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						fill_config();
					});
					break;
				default:
					var val = args.join(" ") || "";
					mode = mode.toLowerCase();
					this.say(locale.translate("change_property", mode, val));
					storage.add({
						id: mode,
						name: mode,
						value: val
						}, function(err) {
						if (err) { console.log("Failed to store value"); console.log(err); return; }
						lctv_bot.on("command#" + mode, function(from, args) {
							this.say(val);
						});
					});
					break;
			}
			break;
		// This command removes properties a mod has set with
		// the "set" command earlier.
		case "remove":
			if (!this.userlist[from]) {
				this.say(from + ", you are not allowed to use this command.");
				break;
			}
			var mode = args.splice(0,1)[0] || "";
			switch(mode.toLowerCase()) {
				case "language":
					storage.remove({id: "property-locale"}, function(err) {});
					break;
				case "task":
					storage.remove({id: "property-task"}, function(err) {});
					break;
				case "current_music":
					storage.remove({id: "property-music"}, function(err) {});
					break;
				case "tools":
					storage.remove({id: "property-tools"}, function(err) {});
					break;
				case "fav_lang":
					storage.remove({id: "property-fav_lang"}, function(err) {});
					break;
				case "fav_framework":
					storage.remove({id: "property-fav_framework"}, function(err) {});
					break;
				case "fav_ide":
					storage.remove({id: "property-fav_ide"}, function(err) {});
					break;
				case "fav_music":
					storage.remove({id: "property-fav_music"}, function(err) {});
					break;
				case "fav_viewer":
					storage.remove({id: "property-fav_viewer"}, function(err) {});
					break;
				default:
					storage.remove({id: mode.toLowerCase()}, function(err) {});
					lctv_bot.removeAllListeners("command#" + mode.toLowerCase());
					break;
			}
			fill_config();
	}
})
// Once a user joines, the bot should greet them
// There are 3 different greetings, depending on
// times of joining and vip status
.on("join", function(user, isAdmin) {
	var self = this;
	storage.load("user_join_amount-" + user, function(err, obj) {
		var join_times = -1;
		var isVIP = false;
		if (err) {
			join_times = 0;
		} else {
			join_times = obj.join_times;
			isVIP = obj.is_VIP;
		}
		if (isVIP) {
			self.say(locale.translate("greet_vip", user));
		} else if (++join_times >= 3) {
			self.say(locale.translate("greet_regular", user));
		} else {
			self.say(locale.translate("greet_normal", user));
		}
		storage.add({
			id: "user_join_amount-" + user,
			name: "user_join_amount-" + user,
			join_times: join_times,
			is_VIP: isVIP
		}, function(err) {
			if (err) { console.log("Failed to store value"); console.log(err); }
		});
	});
});

// This adds commands on runtime that have been set
// with the "set" command
if (config.get("properties_as_commands")) {
	storage.list(function(err, obj) {
		if(err) {
			console.log("An error occured while listing the storage");
			console.log(err);
			return;
		}
		for (var x in obj) {
			if (obj[x].name.indexOf("user_join_amount-") === -1 && obj[x].name.indexOf("property-") === -1) {
				lctv_bot.on("command#" + obj[x].name, function(msg, from, args) {
					lctv_bot.say(msg);
				}.bind(this, obj[x].value));
			}
		}
	});
}

// We just hook the auto_message event here to periodically
// send messages to the chat.
automsgs.on("auto_message", function(msg) {
	lctv_bot.say(locale.translate(msg));
}).start();