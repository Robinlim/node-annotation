'use strict';

var _ = require('lodash');

var INTERCEPTOR = require('../INTERCEPTOR')

/**
 * Express it is to filer all path relative to the project root
 * @param {[Regular]} regular [description]
 * @param {[Array<{advice, method, callback}>]} watchers   [description]
 */
module.exports = function(regular, watchers) {
    var _watchers = watchers;

    function Express() {}

    Express.prototype = {
        constructor: Express,
        /**
         * whether or not match the path
         * @param  {[String]} path [file path relative to the project root]
         * @return {[Boolean]}
         */
        match: function(path) {
            return regular.test(path);
        },
        /**
         * monitor the module instance
         * @param  {[Proxy]} proxy
         * @return {[void]}
         */
        watch: function(proxy) {
            _.forEach(_watchers, function(watcher) {
                proxy.addInterceptor(watcher.advice, watcher.method, watcher.interceptor, watcher.callback);
            });
        }
    };
    return new Express;
};
