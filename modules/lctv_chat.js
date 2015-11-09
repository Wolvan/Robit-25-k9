// This is where we require the node-xmpp modules
// which allow us to connect to LCTV's Jabba/XMPP
// chats
var xmpp = require("node-xmpp-client");
var ltx = require("node-xmpp-core").ltx;

// config_or_username is either an object containing all information or just the username as string
// password expects the LCTV password if the first arg is the username
// channel expects the LCTV channel the bot should connect to if the first arg is the username
// command_prefix is optional and defaults to "!" if it is not given through an arg or the config object
// include_self is an optional boolean defaulting to false and specifies if the bot should emit events if are sent by it
function chat_connector (config_or_username, password, channel, command_prefix, include_self) {
	
	var self = this;
	
	// These arrays and the object store the users of the chat.
	// The object stores the usernames as keys and mod state as
	// the respective values, while the arrays just split them
	// depending on ranks
	this.userlist = {}; this.mods = []; this.users = [];
	
	// The first argument of chat_connector can either be an object
	// containing the config values or a string containing the username
	// If it's an object, the script presumes all the information to
	// come from there
	var username = config_or_username;
	// Set a few default values for the "unimportant" options, just to
	// make sure
	command_prefix = command_prefix || "!";
	include_self = include_self || false;
	if (typeof config_or_username === "object") {
		username = config_or_username.username;
		password = config_or_username.password;
		channel = config_or_username.channel;
		command_prefix = config_or_username.command_prefix || "!";
		include_self = config_or_username.include_self || false;
	}
	// The channel always needs to have the host name as well, so
	// we add that if it doesn't
	if (channel.indexOf("@") === -1) {
		channel += "@chat.livecoding.tv";
	}
	// Instantiate a new LCTV Chat connection
	this.client = new xmpp({
		jid: username + "@livecoding.tv",
		password: password
	});

	// We emit an online event once the chat connects to the server
	// and at the same time join the channel that has been specified
	this.client.on("online", function() {
		var join_data = new ltx.Element("presence", {
			to: channel + "/" + username
		}).c("x", { xmlns: 'http://jabber.org/protocol/muc' });
		self.client.send(join_data);
		self.emit("online");
	});
	
	// We just got some information from the server! Time to read it
	// and decide what to do with it. Again, we emit the same event
	// the xmpp client does, in case we need to hook it later on.
	this.client.on("stanza", function(stanza) {
		self.emit("stanza", stanza);
		var stanza_type = stanza.type;
		var stanza_event
		switch (stanza_type) {
			case "error":
				stanza_event = "error";
				self.emit("error", stanza);
				break;
			default:
				stanza_event = stanza.name;
				break;
		}
		
		switch (stanza_event) {
			// We got a new message here, which could either be a command
			// or just a normal message. We have to check further down
			case "message":
				// The stanza might be empty, this happens when a mod uses the
				// /clear command. There's nothing here in this case, so just skip
				if (typeof stanza.getChild("body") === "undefined") { return; }
				
				// Time to parse the message we got
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
						if (!include_self && (from.toLowerCase() === username.toLowerCase())) {
							return;
						}
						// We emit 2 types of commands, just for convenience
						// With 1 you can listen to all commands and have to
						// check which one it is yourself, the other just fires
						// on the proper command you want.
						self.emit("command", command, from, msg_split);
						self.emit("command#" + command, from, msg_split);
					} else {
						// It's a normal message, let's grab the sender and
						// emit a simple event
						var from = stanza.attrs.from;
						if (stanza_type !== "chat") {
							from = from.substring(from.indexOf("/") + 1);
						}
						if (!include_self && (from.toLowerCase() === username.toLowerCase())) {
							return;
						}
						self.emit("message", from, msg);
					}
				}
				break;
			// Presence stanzas are being sent when someone comes on or goes off.
			// This is where the server also tells us if the user is a mod or not
			case "presence":
				// We grab the name...
				var from = stanza.attrs.from;
				from = from.substring(from.indexOf("/") + 1);
				if (!include_self && (from.toLowerCase() === username.toLowerCase())) {
					return;
				}
				// ...and the mod powers
				var isAdmin = stanza.getChild("x").getChild("item").attrs.affiliation === "admin";
				
				// This means the client has left, remove him from the right
				// user array and object
				if (typeof stanza.attrs.type !== "undefined" && stanza.attrs.type === "unavailable") {
					self.emit("part", from, isAdmin);
					delete self.userlist[from];
					if (isAdmin) {
						var index = self.mods.indexOf(from);
						if (index > -1) { self.mods.splice(index, 1); }
						self.emit("admin_part", from);
					} else {
						var index = self.users.indexOf(from);
						if (index > -1) { self.users.splice(index, 1); }
						self.emit("user_part", from);
					}
				// And this is if a user joins. Here we add him to the array and object
				} else {
					self.emit("join", from, isAdmin);
					self.userlist[from] = isAdmin;
					if (isAdmin) {
						self.mods.push(from);
						self.emit("admin_join", from);
					} else {
						self.users.push(from);
						self.emit("user_join", from);
					}
				}
				break;
		}
	});
	
	// The XMPP client shut down, we'll just emit an event
	this.client.on("end", function() {
		self.emit("end");
	});
	
	// The function that allows to send a message to the chat.
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
// We turn the chat_connector into a proper EventEmitter
require("util").inherits(chat_connector, require('events').EventEmitter);

module.exports = chat_connector;
