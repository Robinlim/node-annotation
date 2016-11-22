/**
 * @Author: xin.lin
 * @Date: 15-4-1
 * scan the annotation
 *  注解间有父子关系，子的识别必须依赖父，所以每个模块父注解必须存在于子注解之前
 *  if you want to use the annotation to control your code, you must obey code format as below:
 *  \/*@Controller*\/
 *  \/@RequestMapping("/")\/
 *  module.exports = {
 *  	\/* @RequestMapping("/users")\/
 *  	list: function(request, response){},
 *  	\/* @RequestMapping("/users/{name}")\/
 *  	user: function(name, request, response){}
 *  }
 */
var Path = require("path"),
    trycatch = require("trycatch"),
    _ = require('lodash');

var _Iterator = require("./base/_Iterator"),
    Model = require("./annotation/Model"),
    Annotation = require("./annotation/Annotation"),
    ApplicationContext = require("./ApplicationContext"),
    Utils = require("./Utils"),
    Logger = require('./Logger');

var START_REG = /\/\*/m, //all annotation is start with /*
    ANNOTATION_REG = /^\s*\/\*@(\w+)\s*(?:\(([^)]*)\))?\s*\*\//m, //annotation format is /*@AnnotationName(parameters)*/
    VARIABLE_REG = /^\s*(\w+)\s*:\s*(?:function\s*\(([^)]*)\)|[^,]{1})/m; //variable format is variable:value or variable: function(parameters)

var extnames = {
        ".js": 1,
        ".coffee": 1
    },
    fileCache = {};

require("./annotation/load/AutoLoad");

/**
 * scan js file in the path
 * @param {[String|Array]} path       [scan path]
 * @param {[JSON]} ignoreDirs [ignore directories]
 */
function Scanner(path, ignoreDirs) {
    this.path = typeof path == 'string' ? [path] : path;
    this.ignoreDirs = ignoreDirs;
}

Scanner.prototype = {
    constructor: Scanner,
    /**
     * execute scan the directory
     * @param  {[Function]} end [all files in directory have been scanned, this function will be called]
     * @return {[void]}
     */
    execute: function(end) {
        var dirs = this.path;
        //add node-annotation library
        dirs.unshift(__dirname);

        var cache = [],
            bulks = [],
            _this = this;

        Logger.info('将编译以下目录：\n',dirs)
        _.forEach(dirs, _.bind(function(path, i) {
            bulks.push(
                Utils.recursiveDirs(path, function(content, filename) {
                    if (fileCache[filename]) return;
                    if (!extnames[Path.extname(filename)]) return;
                    fileCache[filename] = 1;
                    // 识别分析注解内容
                    var ms = new Analyse(new ContentIterator(content), filename).execute();
                    if (!ms.hasNext()) return;
                    // 优先加载AutoLoad注解包裹的对象，一般会是注解类
                    if (ms.index(0).name() == "AutoLoad") {
                        // AutoLoad必须是该模块的第一个注解，如果有其他注解会被缓存起来，在下一个阶段执行
                        var msFirst = [ms.next()];
                        Annotation.parse(new _Iterator(msFirst));
                    }
                    // AutoLoad模块中除AutoLoad注解本身外的注解以及其他所有模块的注解暂时缓存
                    if (!ms.hasNext()) return;
                    cache.push({
                        filename: filename,
                        ms: ms
                    });
                }, _this.ignoreDirs)
            );
        }, _this));

        // 会所有文件分析完后执行
        Promise.all(bulks).then(function(){
            // 将AutoLoad描述的对象优先生效，一般会是注解类
            return Annotation.current().affectAnnotation();
        }).then(function(){
            // 解析被注解类描述的对象
            _.forEach(cache, function(el, i) {
                Annotation.parse(el.ms);
                Logger.info(el.filename);
            });
            // 所有注解对象生效
            return Annotation.current().affectAnnotation();
        }).then(function(){
            // 业务代码启动，会包裹全局错误（指业务代码）
            end && trycatch(end, ApplicationContext.getGlobalErrorHandler());
        }).catch(function(err){
            Logger.error(err, err.stack)
        })
    }
};

module.exports = Scanner;

/**
 * extract the annotation from file content
 * @param {[ContentIterator]} iterator [iterator the file content]
 * @param {[String]} filename [file name]
 */
function Analyse(iterator, filename) {
    this.iterator = iterator;
    this.filename = filename;
}

Analyse.prototype = {
    constructor: Analyse,
    execute: function() {
        var filename = this.filename,
            iterator = this.iterator,
            result, cache = [];
        //traverse the content to extract annotation information
        while (iterator.hasNext()) {
            result = iterator.next().match(START_REG);
            if (result) {
                iterator.go(iterator.index + result.index);
                result = analyseAnnotation();
                if (result === false) break;
                cache = cache.concat(result);
            } else {
                break;
            }
        }
        return new _Iterator(cache);

        //analyse annotation entity
        function analyseAnnotation() {
            var cache = [],
                tmp;
            //for annotation
            result = iterator.next().match(ANNOTATION_REG);
            if (!result) return false;
            while (result) {
                cache.push(Model.create(result[1], result[2], null, null, filename));
                iterator.add(result.index + result[0].length);
                //may one variable has multiple annotations
                result = iterator.next().match(ANNOTATION_REG) || {
                    index: Infinity
                };
                //for variable
                tmp = iterator.next().match(VARIABLE_REG) || {
                    index: Infinity
                };
                if (tmp.index < result.index) {
                    result = tmp;
                    iterator.add(result.index + result[0].length);
                    _.forEach(cache, function(m, i) {
                        //for variable name and parameters
                        m.vo(result[1]);
                        m.voParam(result[2]);
                    });
                    break;
                }
                if (result.index == Infinity) break;
            }
            return cache;
        }
    }
};

/**
 * iterator the content
 * @param {[String]} content [content of js file]
 */
function ContentIterator(content) {
    this.content = content;
    this.index = 0;
}

ContentIterator.prototype = {
    constructor: ContentIterator,
    next: function() {
        return this.content.substr(this.index);
    },
    hasNext: function() {
        return this.index < this.content.length - 1;
    },
    go: function(index) {
        if (index !== undefined)
            this.index = index;
        return this.index;
    },
    add: function(count) {
        return this.index += count;
    },
    subtract: function(count) {
        return this.index -= count;
    }
}
