// We need a way to wrap the config module
// since with the first .get() call it turns
// immutable. The wrapper allows us to still
// modify the values while the bot is running.
// Makes restart-less property changes possible

// config is the global config object you get through require("config")
function configwrapper (config) {
	var config_overrides = {};
	this.get = function(conf) {
		return config_overrides[conf] || config.get(conf);
	}
	this.set = function(conf, value) {
		config_overrides[conf] = value;
	}
	this.remove = function(conf) {
		delete config_overrides[conf];
	}
	this.removeAll = function() {
		config_overrides = {};
	}
}

module.exports = configwrapper;