// Automatic Text Selection

function autotext(interval, textfile, do_not_autostart) {
	do_not_autostart = do_not_autostart || false;
	textfile = textfile || require("path").resolve("../default_msgs.txt");
	
	var fs = require("fs");
	if (!fs.existsSync(textfile)) {
		textfile = require("path").resolve("../default_msgs.txt");
	}
	
	var msg_file_contents = fs.readFileSync(textfile);
	
	var self = this;
	
	var parser = require("./fileparser");
	var msgs = new parser(msg_file_contents).parse();
	var last_msg = -1;
	
	var intervalID;
	
	this.stop = function() {
		if (typeof intervalID !== "undefined") {
			clearInterval(intervalID);
			intervalID = undefined;
		}
	}
	
	this.start = function() {
		if (typeof intervalID === "undefined") {
			intervalID = setInterval(function() {
				var index = Math.floor(Math.random() * msgs.length);
				while (index === last_msg) {
					index = Math.floor(Math.random() * msgs.length);
				}
				last_msg = index;
				var msg = msgs[index];
				self.emit("auto_message", msg);
			}, interval);
		}
	}
	
	if (!do_not_autostart) {
		this.start();
	}
	
}

require("util").inherits(autotext, require('events').EventEmitter);

module.exports = autotext;
