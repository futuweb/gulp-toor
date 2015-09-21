# Gulp-Toor

[![npm](http://img.shields.io/npm/v/gulp-toor.svg)](https://www.npmjs.com/package/gulp-toor)
[![npm](http://img.shields.io/npm/l/gulp-toor.svg)](https://www.npmjs.com/package/gulp-toor)

## 用途

Gulp插件，使用r.js（require.js）打包目录下所有require.js文件。

## 特点

- 支持多入口文件同时编译优化
- 支持缓存，增量编译优化

## 使用方法

```javascript
gulp.task('test',function(){
	gulp.src(['myapp/**/*.js'],{
		base:'myapp' //设定相对目录，在输出时myapp之后的路径会保留
	}).pipe(toor(
		cache:{
			enable:true, //开启缓存，下次只编译有变更的文件
            debug:true, //开启调试模式，会输出更多信息
			cachePath:'./.gulp-toor-cache', //缓存文件存放目录
			dest:'web/scripts-build' //优化后输出文件所在目录
		},
		requireConfig:{
			baseUrl:'myapp',	//require.js模块根目录

			//一些require.js配置，比如package/paths/shim等
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
			exclude:['jquery']
		}
	})).pipe(gulp.dest('myapp-build'))	//输出目录，后面会接上源文件myapp之后的路径
		.on('error',function(err){
		console.log(err);	//输出错误（gulp插件会触发错误事件，但不会输出，需要手工处理）
	})
});
```
