function fileparser(file_contents) {
	this.parse = function() {
		return JSON.parse(file_contents);
	}
}

module.exports = fileparser;
