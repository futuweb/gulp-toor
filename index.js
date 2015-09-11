/*jshint unused:false*/
'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var rjs = require('requirejs');
var path = require('path');

module.exports = function (options) {
	return through.obj(function (file, enc, cb) {
		gutil.log('optimizing:',file.path);
		if (file.isNull()) {
			this.push(file);
			return cb(null,file);
		}
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('toor', 'Streaming not supported'));
			return cb(null,file);
		}
		var self = this;
		options.name = path.join(path.dirname(path.relative(options.baseUrl,file.path)),path.basename(file.path,'.js'));
		options.name = options.name.replace(/\\/g,'/');
		options.out = function(text,sourceMapText){
			file.contents = new Buffer(text);
			// todo:sourcemap
		};
		rjs.optimize(options, function () {
			gutil.log('finished');
			self.push(file);
			cb(null,file);
		}, function(err) {
			self.emit('error', new gutil.PluginError('toor', err, {showStack: true}));
			cb(null,file);
		});
	});
};

