var Path = require("path");
var fs = require("fs");
var Promise = require("promise");
var toString = ({}).toString,
	slice = [].slice;
var Utils = module.exports = {
	/**
	 * recursive the directory, all is async
	 * @param  {[type]}   classpath [description]
	 * @param  {Function} callback  [description]
	 * @param {Function} errCallback [description]
	 * @param {JSON} excludeDir [description]
	 * @return {[type]}             [description]
	 */
	recursiveDirs: function(classpath, callback, errCallback, excludeDir) {
		if(toString.call(errCallback) == "[object Object]"){
			excludeDir = errCallback;
			errCallback = null;
		}
		return recursive(classpath, callback);

		function recursive(classpath, callback) {
			return Promise.denodeify(fs.readdir)(classpath).then(function(files) {
				return Promise.all(files.map(function(file) {
					var tmp = Path.join(classpath, file);
					return Promise.denodeify(fs.stat)(tmp).then(function(stat) {
						if (stat.isDirectory()) {
							if(excludeDir && excludeDir[tmp]){
								return;
							}
							return recursive(tmp, callback);
						}
						return Utils.readFile(tmp, callback, errCallback);
					});
				}));
			});
		}
	},
	/**
	 * recursive the directory, all is sync
	 * @param  {[type]}   classpath [description]
	 * @param  {Function} eachHandler  [description]
	 * @param {JSON} excludeDir [description]
	 * @return {[type]}             [description]
	 */
	recursiveDirsSync: function(classpath, eachHandler, excludeDir){
		recursive(classpath, eachHandler);

		function recursive(classpath, fn) {
			var files = fs.readdirSync(classpath);
			files.map(function(file){
				var curpath = Path.join(classpath, file),
					stat = fs.statSync(curpath);
				if(stat.isDirectory()){
					if(excludeDir && excludeDir[curpath]){
						return;
					}
					recursive(curpath, fn);
				}
				var context = fs.readFileSync(curpath);
				fn(context, file);
			})
		}
	},
	/**
	 * read file content
	 * @param  {[String]}   filename [description]
	 * @param  {[Object]}   options  [description]
	 * @param  {Function} callback [description]
	 * @param  {Function} errCallback [description]
	 * @return {[type]}            [description]
	 */
	readFile: function(filename, options, callback, errCallback) {
		if(!Utils.typeofObject(options).isObject()){
			errCallback = callback;
			callback = options;
			options = {
				encoding: "utf8"
			};
		}
		return Promise.denodeify(fs.readFile)(filename, options).then(function(data) {
			callback(data, filename);
		}, function(err) {
			if(errCallback){
				errCallback(err);
			}else{
				throw err;
			}
		});
	},
	/**
	 * copy Class prototype
	 * @param  {[type]} iclass [description]
	 * @return {[type]}        [description]
	 */
	copyOwnProperty: function(iclass) {
		var protoype = iclass.prototype,
			map = {};
		for (var attr in protoype) {
			if (!iclass.hasOwnProperty(attr) && attr != "constructor") {
				map[attr] = protoype[attr];
			}
		}
		return map;
	},
	/**
	 * extend object
	 * @param  {[type]} func [description]
	 * @param  {[type]} obj  [description]
	 * @return {[type]}      [description]
	 */
	extend: function(func, obj) {
		for (var i in obj)
			if(obj.hasOwnProperty(i))
				func[i] = obj[i];
		return func;
	},
	/**
	 * get the type of object
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
	typeofObject: function(obj) {
		obj = toString.call(obj);
		return {
			//if it is a string, or not
			isString: function() {
				return obj == "[object String]";
			},
			//if it is a object, or not
			isObject: function() {
				return obj == "[object Object]";
			},
			//if it is a array, or not
			isArray: function() {
				return obj == "[object Array]";
			},
			//if it is a function, or not
			isFunction: function() {
				return obj == "[object Function]";
			},
			value: obj
		};
	},
	slice: function(arry, start, end){
		slice.call(arry, start, end);
	}
}
