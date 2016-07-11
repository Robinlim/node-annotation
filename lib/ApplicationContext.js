'use strict';
var Promise = require('promise'),
    Path = require('path'),
    _ = require('lodash'),
    Logger = require('./Logger');

var _beanFactory = require('./proxy/ProxyFactory'),
    _push = ([]).push,
    _app, _resolve, 
    _configurePath = Path.join(process.cwd(), 'resource'),
    _golbalErrorHandler = function(err){
        if(err instanceof Error){
            throw err;
        } else {
            throw new Error(JSON.stringify(err));
        }
    }

module.exports = {
    /**
     * get the app for web application
     * @param  {[Server]} app
     * @return {[Promise]}
     */
    app: function(app) {
        if (!_app) {
            _app = new Promise(function(resolve) {
                _resolve = resolve;
            });
        }
        if (app) {
            _resolve(app);
        }
        return _app;
    },
    /**
     * get bean by name user customize or file path relative to project
     * @param  {[String]} name [name user customize or file path]
     * @return {[Promise]}
     */
    getBean: function(name) {
        return _beanFactory.getBean(name);
    },
    /**
     * create bean
     * @param  {[String]} name [alias name of module user customize]
     * @param  {[String]} path [path of module relatvie to project root]
     * @return {[Proxy|Object]}
     */
    createBean: function(name, path) {
        return _beanFactory.createBean(name, path);
    },
    /**
     * add express to filter all modules whether or not would be a proxy module
     * @param  {[String]} regular [regular to match path and methods of module]
     * @param  {[Array<{advice, method, callback}>]} watchers
     * @return {[void]}
     */
    addExpress: function(regular, watch) {
        _beanFactory.addExpress(regular, watch);
    },
    /**
     * which directionary is configure files in
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    configurePath: function(path) {
        if (path) {
            _configurePath = path;
        }
        return _configurePath;
    },
    /**
     * get the global error handler
     * @return {[type]} [description]
     */
    getGlobalErrorHandler: function(){
        return _golbalErrorHandler;
    },
    /**
     * set the global error handler
     * @param {[function]} fun [user customize golbal error handler function]
     */
    setGlobalErrorHandler: function(fun){
        _golbalErrorHandler = fun;
    },
    /**
     * [setLogger description]
     * @param {[boolean]} use         [set on/off of logger]
     * @param {[string]} level       [log,info,warn,error]
     * @param {[type]} funOrLogger [if its a function, will receive the log string and level, 
     * else if you use a logger like log4js, give a Object with the same behavior of console]
     */
    setLogger: function(use, level, funOrLogger) {
        Logger.set(use, level, funOrLogger);
    }
};
