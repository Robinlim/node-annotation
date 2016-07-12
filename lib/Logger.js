/**
 * A Logger Util
 * @Author:      wyw   <wyw.wang@qunar.com>
 * @Date:    2016-06-23 16:10:03
 */
var _ = require('lodash');
var Logger = {};

var LEVELS = ['error', 'warn', 'info', 'log'];

// default
var _use = true,
    _levelIndex = LEVELS.indexOf('warn'),
    _logger = console, _logfun; 

if(process.argv.indexOf('--debug') > 0 || process.argv.indexOf('--debug-brk') > 0){
    _levelIndex = LEVELS.indexOf('log');
}

LEVELS.forEach(function(level){
    Logger[level] = function(){
        if(_use) {
            var index = LEVELS.indexOf(level);
            if (  index > -1 && index <= _levelIndex ){

                if(_logfun){
                    _logfun( ([]).join.call(arguments, '\t'), level);
                } else {
                    _logger[level].apply(_logger, arguments);
                }
            }
        }
    }
})

Logger.set = function(use, level, funOrLogger) {
    _use = use;
    if(level && LEVELS.indexOf(level) > -1){
        _levelIndex = LEVELS.indexOf(level); 
    }
    if( _.isFunction(funOrLogger)){
        _logfun = funOrLogger;
    } else if( _.isObject(funOrLogger)){
        _logger = funOrLogger;
    }
}

module.exports = Logger;