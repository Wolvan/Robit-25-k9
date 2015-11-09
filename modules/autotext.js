// This code deals with automatic messages
// It emits an "auto_message" event every
// x milliseconds, with 1 parameter containing
// the selected message

// interval is the amount of milliseconds between each message
// msgs is an array of strings to select a random message from
// do_not_autostart is if you don't want the module to automatically tick
function autotext(interval, msgs, do_not_autostart) {
	do_not_autostart = do_not_autostart || false;
	
	var self = this;
	
	// We store the index of the last message to
	// avoid duplicate messages right after each other
	var last_msg = -1;
	
	var intervalID;
	
	// If we ever want to disable the auto-messages we call .stop()...
	this.stop = function() {
		if (typeof intervalID !== "undefined") {
			clearInterval(intervalID);
			intervalID = undefined;
		}
	}
	
	// ...and to (re)start it we call .start()! Simple, isn't it?
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
	
	// If we want to change the interval of the auto_messages, we call this
	this.changeInterval = function(newInterval) {
		interval = newInterval;
		self.stop();
		self.start();
	}
	
	if (!do_not_autostart) {
		this.start();
	}
	
}

// Again, turn the autotext into an EventEmitter
require("util").inherits(autotext, require('events').EventEmitter);

module.exports = autotext;
