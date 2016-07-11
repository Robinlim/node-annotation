'use strict';
var Path = require('path'),
    _ = require('lodash');

var Proxy = require('./Proxy'),
    Express = require('./Express'),
    INTERCEPTOR = require('../INTERCEPTOR'),
    PROXYCYCLE = require('../PROXYCYCLE');

var _beans = {},
    _expresses = [],
    _instance = null,
    _cwd = process.cwd(),
    _loader = module.require,
    _push = ([]).push,
    ABSOLUTE_PROJECT = /^\//,
    RELATIVE_CUR = /\.\//,
    EXTNAME_REG = /\.[^./]+$/;

function ProxyFactory() {
    if (_instance) {
        return _instance;
    }
    _instance = this;
    //require delegate
    module.constructor.prototype.require = function(path) {
        var _path = Path.join(Path.dirname(this.filename), path);
        if (!_instance.match(_path)) {
            return _loader.apply(this, arguments);
        }
        return _instance.createBean(_path).instance();
    }
}

ProxyFactory.prototype = {
    constructor: ProxyFactory,
    /**
     * get bean by name user customize or absolute file path
     * @param  {[String]} name [name user customize or absolute file path]
     * @return {[Promise]}
     */
    getBean: function(name) {
        return {
            then: function(callbck) {
                var proxy = _beans[name];
                if (proxy && !proxy.isPromise) {
                    callbck(proxy);
                    return;
                }
                //wait for module load
                if (!proxy) {
                    proxy = _beans[name] = {
                        isPromise: true
                    };
                }
                _push.call(proxy, {
                    resolve: callbck
                });
            }
        };
    },
    /**
     * create bean
     * @param  {[String]} name [alias name of module user customize]
     * @param  {[String]} path [absolute path of module, required]
     * @return {[Proxy|Object]}
     */
    createBean: function(name, path) {
        if (!path) {
            path = name;
            name = null;
        }
        var proxy = _beans[path];
        if (!proxy || proxy.isPromise) {
            proxy = new Proxy(path, _loader);
        }
        name && resolveDependency(name);
        resolveDependency(path);
        resolveDependency(path.replace(EXTNAME_REG, ''));
        return proxy;

        //trigger the module dependencies to call
        function resolveDependency(key) {
            var promises = _beans[key];

            if (promises && promises.isPromise) {
                _.forEach(promises, function(promise) {
                    promise.resolve(proxy);
                });
            }
            return _beans[key] = proxy;
        }
    },
    /**
     * deal the path to absolute path relatvie to project
     * @param  {[type]} path [description]
     * @param  {[String]} hostPath [the module annotation exist]
     * @return {[type]}      [description]
     */
    dealBeanName: function(path, hostPath) {
        if (ABSOLUTE_PROJECT.test(path)) {
            return Path.join(_cwd, path);
        }
        if (RELATIVE_CUR.test(path) && hostPath) {
            return Path.join(hostPath, path);
        }
        return path;
    },
    /**
     * whether or not the bean exist
     * @param  {[String]} name [alias name of module user customize]
     * @param  {[String]} path [path of module relatvie to project root]
     * @return {[Boolean]}      [exist: true, not: false]
     */
    existBean: function(name, path) {
        var proxy = _beans[name] || _beans[path];
        if (proxy && typeof proxy.length !== 'undefined') {
            return true;
        }
        return false;
    },
    /**
     * add express to filter all modules whether or not would be a proxy module
     * @param  {[String]} regular [regular expression to match path and methods of module]
     * @param  {[Array<{advice, method, callback}>]} watchers
     * @return {[void]}
     */
    addExpress: function(regular, watchers) {
        _expresses.push(Express(regular, watchers));
    },
    /**
     * whether or not the express match the path
     * @param  {[String]} path [description]
     * @return {[Boolean]}      [description]
     */
    match: function(path) {
        var proxy = false;
        _.forEach(_expresses, function(express) {
            if (express.match(path)) {
                _instance.getBean(path).then(function(proxy) {
                    express.watch(proxy);
                });
                proxy = true;
            }
        });
        return proxy;
    }
};

module.exports = new ProxyFactory;
