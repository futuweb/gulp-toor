# Gulp-Toor

[![npm](http://img.shields.io/npm/v/gulp-toor.svg)](https://www.npmjs.com/package/gulp-toor)
[![npm](http://img.shields.io/npm/l/gulp-toor.svg)](https://www.npmjs.com/package/gulp-toor)

## 用途

Gulp插件，使用r.js（require.js）打包目录下所有require.js文件。

## 使用方法

```javascript
gulp.task('test',function(){
	gulp.src(['myapp/*.js']).pipe(toor({
		baseUrl:'myapp',
		packages:[{
			name: 'echarts',
			location: 'lib/echarts',      
			main: 'echarts'
		},{
			name: 'zrender',
			location: 'lib/zrender', // zrender与echarts在同一级目录
			main: 'zrender'
		}],
		paths:{
			jquery:'lib/jquery'
		},
		shim: {
			'lib/modernizr': {
				exports: 'Modernizr'
			},
			'lib/jquery':{
				exports: 'jQuery'
			}
		},
		exclude:['jquery'],
		out:"web/scripts-build"
	})).pipe(gulp.dest('web/scripts-build'));
});
```
