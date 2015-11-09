// Automatic Text Selection

function autotext(interval, msgs, do_not_autostart) {
	do_not_autostart = do_not_autostart || false;
	
	var self = this;
	
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
				var index = last_msg;
				while (index === last_msg) {
					index = Math.floor(Math.random() * msgs.length);
				}
				last_msg = index;
				var msg = msgs[index];
				self.emit("auto_message", msg);
			}, interval);
		}
	}
	
	this.changeInterval = function(newInterval) {
		interval = newInterval;
		self.stop();
		self.start();
	}
	
	if (!do_not_autostart) {
		this.start();
	}
	
}

require("util").inherits(autotext, require('events').EventEmitter);

module.exports = autotext;
