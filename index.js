/*jshint unused:false*/
'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var rjs = require('requirejs');
var path = require('path');
var fs = require('fs');
var isDebug = false;

var log = function(){
	if(isDebug){
		console.log.apply(console,arguments);
	}
};

// save dependencies tree for next time
var saveDependencies = function(dest, cachePath){
	var madge = require('madge');

	var dependencyObject = madge(dest,{
		// requireConfig:'./web/config.js',
		format:'amd',
		findNestedDependencies:true
	});

	if(!fs.existsSync(cachePath)){
		fs.mkdirSync(cachePath);
	}

	fs.writeFileSync(
		path.join(cachePath, 'dependencies.json'),
		JSON.stringify(dependencyObject.tree)
	);

	log('saveDependencies success');

};

// save file modify time for next time
var saveModifyMap = function(cachePath, modifyMap){
	if(!fs.existsSync(cachePath)){
		fs.mkdirSync(cachePath);
	}

	fs.writeFileSync(
		path.join(cachePath, 'modifymap.json'),
		JSON.stringify(modifyMap)
	);

	log('saveModifyMap success');
};

module.exports = function (options) {
	// 向下兼容
	var requireConfig = options.requireConfig || options || {};
	if(!options.cache) options.cache = {};

	// 所有依赖列表
	var dependencies = {};
	// 所有文件上次修改时间列表
	var fileModifyMap = {};
	// 当前扫描时用的文件修改时间缓存
	var fileModifyCache = {};

	isDebug = options.cache.debug;

	// 如果使用缓存，则更新依赖列表和文件上次修改时间列表
	if(options.cache.enable){
		var dependenciesJson = path.join(options.cache.cachePath,'dependencies.json');
		if(fs.existsSync(dependenciesJson)){
			dependencies = JSON.parse(fs.readFileSync(dependenciesJson,'utf8'));
		}
		var modifyMapJson = path.join(options.cache.cachePath,'modifymap.json');
		if(fs.existsSync(modifyMapJson)){
			fileModifyMap = JSON.parse(fs.readFileSync(modifyMapJson,'utf8'));
		}
	}
	return through.obj(function (file, enc, cb) {
		console.log(file.base);
		gutil.log('optimizing:',file.path);
		// this.push(file);
		// return cb(null,file);
		var modelPath = path.join(path.dirname(path.relative(requireConfig.baseUrl,file.path)),path.basename(file.path,'.js'));
		if(options.cache.enable){
			var isModified = false;
			log('modelPath',modelPath);
			var modelDependencies = dependencies[modelPath];
			// console.log('modelDependencies',modelDependencies);
			if(!modelDependencies){
				isModified = true;
			}else{
				modelDependencies.unshift(modelPath);

				modelDependencies.forEach(function(dependency){
					var filePath = path.join(requireConfig.baseUrl,dependency + '.js');
					// 路径不存在
					if(!fs.existsSync(filePath)){
						log(filePath,'not exist');
						return;
					}
					// 获取当前文件修改时间
					var modifyTime = fileModifyCache[filePath];
					if(!modifyTime){
						log(filePath,'no time cache');
						var stat = fs.statSync(filePath);
						modifyTime = fileModifyCache[filePath] = +stat.mtime;
					}
					// 之前没有保存过这个时间
					if(!fileModifyMap[filePath]){
						log(filePath,'no time');
						isModified = true;
						return;
					}
					if(modifyTime > fileModifyMap[filePath]){
						log(filePath,'is newer');
						isModified = true;
					}
				});
			}
			log('isModified',isModified);
			if(!isModified){
				return cb(null);
			}
		}
		if (file.isNull()) {
			this.push(file);
			return cb(null,file);
		}
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('toor', 'Streaming not supported'));
			return cb(null,file);
		}
		var self = this;
		requireConfig.name = path.join(path.dirname(path.relative(requireConfig.baseUrl,file.path)),path.basename(file.path,'.js'));
		// 兼容windows
		requireConfig.name = requireConfig.name.replace(/\\/g,'/');
		requireConfig.out = function(text,sourceMapText){
			file.contents = new Buffer(text);
			// todo:sourcemap
		};
		rjs.optimize(requireConfig, function () {
			gutil.log('finished');
			self.push(file);
			cb(null,file);
		}, function(err) {
			self.emit('error', new gutil.PluginError('toor', err, {showStack: true}));
			cb(null,file);
		});
	},function(){
		if(options.cache.enable){
			log('saving dependencies...');
			var cachePath = options.cache.cachePath || './.gulp-toor-cache';
			saveDependencies(options.cache.dest, cachePath);
			saveModifyMap(cachePath, fileModifyCache);
		}
	});
};

