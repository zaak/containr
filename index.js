
(function() {

	'use strict';

	/**
	 * A set of regular expressions to extract function argument names.
	 *
	 * Thanks to https://github.com/angular/angular.js/blob/1d18e60ef7776c53716622c18f6a127284a58d92/src/auto/injector.js#L65
	 */
	var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
	var FN_ARG_SPLIT = /,/;
	var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

	/**
	 * @param {Object} initialValues
	 * @constructor
	 */
	function Containr(initialValues) {
		this.values = {};
		this.raw = {};

		for (var key in initialValues) {
			if(initialValues.hasOwnProperty(key)) {
				this.set(key, initialValues[key]);
			}
		}
	}

	Containr.prototype = {

		/**
		 *
		 * @param {String} key
		 * @param value
		 */
		set: function(key, value) {
			this.raw[key] = value;
		},

		/**
		 *
		 * @param {String} key
		 * @returns {*}
		 */
		get: function(key) {
			var that = this;

			if (this.values.hasOwnProperty(key)) {
				return this.values[key];
			}

			if(this.raw.hasOwnProperty(key)) {
				var val = this.raw[key];
				if (typeof val === 'function') {
					var argumentNames = getArgumentNames(val);

					var args = [];
					argumentNames.forEach(function(argumentName) {
						//console.log(argumentName);
						args.push(that.get(argumentName));
					});

					this.values[key] = val.apply(this, args);

					return this.values[key];
				}

				return this.raw[key];
			}
	}
	};

	/**
	 * Returns an array of arguments names taken by passed function.
	 *
	 * Thanks to https://github.com/angular/angular.js/blob/1d18e60ef7776c53716622c18f6a127284a58d92/src/auto/injector.js#L99
	 *
	 * @param {Function} fn
	 * @returns {Array}
	 */
	function getArgumentNames(fn) {
		var args = [];
		var fnText = fn.toString().replace(STRIP_COMMENTS, '');
		var argDecl = fnText.match(FN_ARGS);
		argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
			arg.replace(FN_ARG, function(all, underscore, name) {
				args.push(name);
			});
		});

		return args;
	}

	module.exports = Containr;
}(this));
