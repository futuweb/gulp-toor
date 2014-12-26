'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var rjs = require('requirejs');
var path = require('path');
var fs = require('fs');

module.exports = function (options) {
	var oldOut = options.out;
	return through.obj(function (file, enc, cb) {
		gutil.log('optimizing:',file.path);
		if (file.isNull()) {
			this.push(file);
			return cb();
		}
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('toor', 'Streaming not supported'));
			return cb();
		}
		var self = this;
		options.name = path.join(path.dirname(path.relative(options.baseUrl,file.path)),path.basename(file.path,'.js'));
		options.out = path.join(oldOut,path.dirname(options.name),path.basename(file.path));
		rjs.optimize(options, function () {
			gutil.log('finished');
			file.contents = fs.readFileSync(options.out);
			options.out = oldOut;
			self.push(file);
			cb();
		}, function(err) {
			self.emit('error', new gutil.PluginError('toor', err), {showStack: true});
			options.out = oldOut;
			cb();
		});
	});
};

