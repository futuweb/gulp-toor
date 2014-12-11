'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var rjs = require('requirejs');
var path = require('path');
var fs = require('fs');

module.exports = function (options) {
	var oldOut = options.out;
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('toor', 'Streaming not supported'));
			return cb();
		}
		options.name = path.join(path.dirname(path.relative(options.baseUrl,file.path)),path.basename(file.path,'.js'));
		options.out1 = path.join(oldOut,path.basename(file.path));
		options.out = path.join(oldOut,path.dirname(options.name),path.basename(file.path));
		rjs.optimize(options, function () {
			file.contents = fs.readFileSync(options.out);
			options.out = oldOut;
			this.push(file);
			cb();
		}, function(err) {
			this.emit('error', new gutil.PluginError('toor', 'r.js optimize failed.'));
			options.out = oldOut;
			cb();
		});
	});
};
