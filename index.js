var gutil = require('gulp-util');
var through = require('through2');
var rjs = require('requirejs');
var path = require('path');

module.exports = function (options) {
	var oldOut = options.out;
	return through.obj(function (file, enc, cb) {
		console.log(file.path);
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}
		options.name = path.join(path.dirname(path.relative(options.baseUrl,file.path)),path.basename(file.path,'.js'));
		options.out = path.join(oldOut,path.basename(file.path));
		rjs.optimize(options, function (buildResponse) {
			file.contents = fs.readFileSync(options.out);
			options.out = oldOut;
			this.push(file);
		}, function(err) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'r.js optimize failed.'));
			console.log(err.stack);
			options.out = oldOut;
		});
		cb();
	});
};
