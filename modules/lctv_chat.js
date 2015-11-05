// Require all node_modules
var xmpp = require("node-xmpp-client");
var ltx = require("node-xmpp-core").ltx;

//GENERATE DOCUMENTATION LATER!!!
function chat_connector (config_or_username, password, channel, command_prefix) {
	
	var self = this;
	
	var userlist = {}; var mods = []; users = [];
	
	var username = config_or_username;
	if (typeof config_or_username === "object") {
		username = config_or_username.username;
		password = config_or_username.password;
		channel = config_or_username.channel;
		command_prefix = config_or_username.command_prefix || "!";
	}
	if (channel.indexOf("@") === -1) {
		channel += "@chat.livecoding.tv";
	}
	// Instantiate a new LCTV Chat connection
	this.client = new xmpp({
		jid: username + "@livecoding.tv",
		password: password
	});

	this.client.on("online", function() {
		console.log("XMPP Client connected!");
		var join_data = new ltx.Element("presence", {
			to: channel + "/" + username
		}).c("x", { xmlns: 'http://jabber.org/protocol/muc' });
		self.client.send(join_data);
	});
	
	this.client.on("stanza", function(stanza) {
		// Manage different Stanzas here
		var stanza_type = stanza.type;
		var stanza_event
		switch (stanza_type) {
			case "error":
				stanza_event = "error";
				self.emit("error", stanza);
				break;
			case "result":
				
				break;
			default:
				stanza_event = stanza.name;
				break;
		}
		
		switch (stanza_event) {
			case "message":
				if (typeof stanza.getChild("body") === "undefined") { return; }
				var msg = stanza.getChild("body").children.toString();
				// Check for replays (Do not process them)
				if (typeof stanza.getChild("delay") === "undefined") {
					if (msg.indexOf(command_prefix) === 0) { // Check if someone entered a command
						var msg_split = msg.split(" ");
						msg_split[0] = msg_split[0].substring(1);
						var command = msg_split.splice(0,1)[0];
						var from = stanza.attrs.from;
						if (stanza_type !== "chat") {
							from = from.substring(from.indexOf("/") + 1);
						}
						self.emit("command", command, from, msg_split);
						self.emit("command#" + command, from, msg_split);
					} else {
						var from = stanza.attrs.from;
						if (stanza_type !== "chat") {
							from = from.substring(from.indexOf("/") + 1);
						}
						self.emit("message", from, msg);
					}
				}
				break;
			case "presence":
				var from = stanza.attrs.from;
				from = from.substring(from.indexOf("/") + 1);
				var isAdmin = stanza.getChild("x").getChild("item").attrs.affiliation === "admin";
				if (typeof stanza.attrs.type !== "undefined" && stanza.attrs.type === "unavailable") {
					self.emit("part", from, isAdmin);
					delete userlist[from];
					if (isAdmin) {
						var index = mods.indexOf(from);
						if (index > -1) { mods.splice(index, 1); }
						self.emit("admin_part", from);
					} else {
						var index = users.indexOf(from);
						if (index > -1) { users.splice(index, 1); }
						self.emit("user_part", from);
					}
				} else {
					self.emit("join", from, isAdmin);
					userlist[from] = isAdmin;
					if (isAdmin) {
						mods.push(from);
						self.emit("admin_join", from);
					} else {
						users.push(from);
						self.emit("user_join", from);
					}
				}
				break;
			default:
				console.log(stanza);
				break;
		}
	});
	
	this.client.on("end", function() {
		console.log("XMPP Client closed, closing down this Bot Connection");
		// Do closing logic, end program here?
	});
	
	this.say = function (message) {
		var stanza = new ltx.Element("message", {
			to: channel,
			type: "groupchat",
			from: username + "@livecoding.tv"
		}).c("body").t(message);
		self.client.send(stanza);
	}
	return this;
}
require("util").inherits(chat_connector, require('events').EventEmitter);

module.exports = chat_connector;
