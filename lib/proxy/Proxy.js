/**
* @Author: robin
* @Date:   2016-06-21 10:05:04
* @Email:  xin.lin@qunar.com
* @Last modified by:   robin
* @Last modified time: 2016-06-23 14:41:02
*/

'use strict';

var Path = require('path'),
    trycatch = require('trycatch'),
    _ = require('lodash'),
    concat = ([]).concat,
    slice = ([]).slice;

var INTERCEPTOR = require('../INTERCEPTOR'),
    PROXYCYCLE = require('../PROXYCYCLE');
/**
 * Proxy
 * @param  {[String]} path   [absolute path]
 * @param  {[Function]} loader [module require]
 * @return {[Proxy]}
 */
module.exports = function(path, loader) {
    // load original module
    var _instance = loader.call(this, path);
    var _methods = {};

    function Proxy() {}

    Proxy.prototype = {
        constructor: Proxy,
        /**
         * [function description]
         * @param  {[type]}   advice      [description]
         * @param  {[type]}   method      [description]
         * @param  {Function} callback    [description]
         * @return {[type]}               [description]
         */
        addInterceptor: function(advice, method, interceptor, callback) {
            if (typeof advice == 'function') {
                callback = advice;
                advice = PROXYCYCLE.BEFORE;
                interceptor = INTERCEPTOR.MODULE;
            } else if (typeof method == 'function') {
                callback = method;
                if (typeof advice != 'number') {
                    method = advice;
                    advice = PROXYCYCLE.BEFORE;
                } else {
                    interceptor = INTERCEPTOR.MODULE;
                }
            } else if (typeof interceptor == 'function'){
                callback = interceptor;
                interceptor = INTERCEPTOR.METHOD;
            }
            if (typeof(method) == 'undefined'){
                interceptor = INTERCEPTOR.MODULE;
            }
            switch (interceptor) {
                //all methods of module
                case INTERCEPTOR.MODULE:
                    _.mapKeys(_instance, function(value, key) {
                        this.addMethodInterceptor(key, advice, INTERCEPTOR.METHOD, callback);
                    }, this);
                    break;
                    //specific method of module
                case INTERCEPTOR.METHOD:
                case INTERCEPTOR.PROTOTYPE:
                    this.addMethodInterceptor(method, advice, interceptor, callback);
                    break;
                default:
                    break;
            }
        },
        /**
         * add method interceptor
         * @param  {[String]}   method   [method name of module]
         * @param  {[String]}   advice   [intercep occasion]
         * @param  {Function} callback [intercep action]
         * @return {[void]}
         */
        addMethodInterceptor: function(method, advice, interceptor, callback) {
            if (typeof interceptor == "function") {
                callback = interceptor;
                interceptor = INTERCEPTOR.METHOD;
            }
            interceptor = interceptor || INTERCEPTOR.METHOD;

            var instance = resolveInstance(interceptor, _instance);
            if (typeof instance[method] == "function" && !_methods[method]) {
                delegate(instance, _methods, method);
            }
            _methods[method] = _methods[method] || {};
            _methods[method][advice] = _methods[method][advice] || [];
            _methods[method][advice].push(callback);
        },
        /**
         * return original instance
         * @return {[Object]} [module instance]
         */
        instance: function() {
            return _instance;
        }
    };

    return new Proxy;
};

function resolveInstance(interceptor, instance) {
    switch(interceptor){
        case INTERCEPTOR.METHOD:
            return instance;
        case INTERCEPTOR.PROTOTYPE:
            return instance.prototype;
        default:
            return instance;
    }
}

function delegate(instance, _methods, method) {
    // wrap the function
    var oriFunct = instance[method], wrapFunct;
    instance[method] = function() {
        var callback, result, args = arguments,
            self = this;

        //before instance run
        if (_methods[method] && (callback = _methods[method][PROXYCYCLE.BEFORE])) {
            _.forEach(callback, function(cb) {
                cb.apply(cb, args);
            });
        }
        //afterreturning the instance run
        if (_methods[method] && _methods[method][PROXYCYCLE.AFTERRETURNING]) {
            var len = 0,
                fnCache = {},
                count = 0;
            _.forEach(args, function(param, i) {
                if (typeof param == 'function') {
                    len++;
                    args[i] = function() {
                        if (!fnCache[i]) {
                            fnCache[i] = 1;
                            count++;
                        }
                        //before the callback call
                        if (count == len) {
                            callback = _methods[method][PROXYCYCLE.AFTERRETURNING];
                            _.forEach(callback, function(cb) {
                                cb.apply(cb, args);
                            });
                        }
                        param.apply(param, arguments);
                    };
                }
            });
        }
        // instance throws
        if (_methods[method] && (callback = _methods[method][PROXYCYCLE.THROWS])) {
            wrapFunct = (function(cbk){
                return function(arg){
                    var res;
                    trycatch(function(){
                        res = oriFunct.apply(self, arg || args);
                    }, function(err){
                        _.forEach(cbk, function(cb){
                            var param = slice.call(args);
                            param.unshift(err);
                            cb.apply(cb, param);
                        });
                    });
                    return res;
                }
            })(callback);
        } else {
            wrapFunct = function(arg){
                return oriFunct.apply(self, arg || args);
            }
        }
        //around instance run
        if (_methods[method] && (callback = _methods[method][PROXYCYCLE.AROUND])) {
            var chain = decorateCallbacks(callback, function() {
                return wrapFunct.call(wrapFunct, arguments);
            });
            chain.apply(chain, args);
        } else {
            //instance run
            result = wrapFunct();
        }
        //after instance run
        if (_methods[method] && (callback = _methods[method][PROXYCYCLE.AFTER])) {
            _.forEach(callback, function(cb) {
                var param = slice.call(args);
                param.unshift(result);
                result = cb.apply(cb, param) || result;
            });
        }

        return result;
    };
}

function decorateCallbacks(cbs, callback) {
    var next = callback;
    _.forEach(cbs, function(cb, i) {
        next = decorateCallback(cb, next);
    });
    return next;
}

function decorateCallback(cb, next) {
    return function() {
        var newArgs = slice.call(arguments, 0);
        newArgs.push(function(argv) {
            return next.apply(next, argv);
        });
        return cb.apply(cb, newArgs);
    };
}
