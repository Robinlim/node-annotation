/**
 * @Author: xin.lin
 * @Date: 15-4-10
 * control the request and response
 */
/*@AutoLoad*/
var _ = require('lodash'),
    Logger = require('../../Logger'),
    trycatch = require('trycatch'),
    ApplicationContext = require("../../ApplicationContext");

var UNCERTAIN_METHOD = 'all';

var Controller = module.exports = require("../Annotation").extend({
    /**
     * find the controller of corresponding url
     * @return {[type]} [description]
     */
    execute: function() {
        //load bean proxy by annotation parameter
        var po = this.model.po();
        ApplicationContext.createBean(po, this.model.classpath());

        this.exceptionHandlers = [];
        this.traverse(function(i, item){
            var name = item.model.name();
            switch(name){
                case 'ExceptionHandler':
                    this.exceptionHandlers.push(item.data);
                    break;
                case 'RequestMapping':
                    this.makeRequestMapping(item);
                    break;
                default:
                    // do nothing
                    break;
            }
        }, this);
    },
    makeRequestMapping: function(item){
        var _this = this;
            matcher = _.bind(item.match, item),
            handler = function(req, res, matches){
                trycatch(function(){
                    item.run.call(item, req, res, matches);
                }, function(err){
                    _this.handlerException(err, req, res);
                });
            };
        _.forEach(item.data, function(el){
            if(!el.isExp){
                var method = el.method?el.method.toLowerCase():UNCERTAIN_METHOD;
                if(!Controller.staticMap[el.url]){
                    Controller.staticMap[el.url] = {};
                }
                Controller.staticMap[el.url][method] = handler;
            } else if(el.prefix){
                if(!Controller.prefixMap[el.prefix]){
                    Controller.prefixMap[el.prefix] = [];
                }
                Controller.prefixMap[el.prefix].push({
                    handler: handler,
                    matcher: matcher
                });
            } else {
                Controller.regArray.push({
                    handler: handler,
                    matcher: matcher
                });
            }
        });
    },
    handlerException: function(err, req, res){
        var breakNext = false;
        _.forEach(this.exceptionHandlers, function(el){
            if(breakNext = el.match(err)){
                el.fun(err, req, res);
                return false;
            }
        });
        return breakNext;
    }
}, {
    //annotation name
    name: "Controller",
    staticMap: {},
    prefixMap: {},
    regArray: [],
    init: function(app){
        Logger.info('全部路由项：')
        Logger.info('staticMap',Controller.staticMap);
        Logger.info('prefixMap',Controller.prefixMap);
        Logger.info('regArray',Controller.regArray);
        app.use(function(req, res, next){
            Controller.route(req, res, next);
        });
    },
    route: function(req, res, next) {
        var path = req.path,
            params,
            index = path.indexOf("?"),
            url = req.path.substring(0, index == -1 ? path.length : index),
            notfound = true,
            prefix,matches;
        if(_.has(Controller.staticMap, path)){
            Logger.log('[Router] staticMap in')
            var it = Controller.staticMap[path],
                method = req.method.toLowerCase();
            if(_.has(it, method)){
                it[method](req, res);
                notfound = false;
            } else if(_.has(it, UNCERTAIN_METHOD)){
                it[UNCERTAIN_METHOD](req, res);
                notfound = false;
            }
        }
        if(notfound && (prefix = path.split('/')[1])
            && _.has(Controller.prefixMap, prefix)){
            Logger.log('[Router] prefixMap in')
            // '/'.length + prefix.length + '/'.length
            var postfix = path.slice(prefix.length+2); 
            _.forEach(Controller.prefixMap[prefix], function(el){
                if(matches = el.matcher(postfix, req, res)){
                    el.handler(req, res, matches);
                    notfound = false;
                    return false;
                }
            });
        }
        if(notfound){
            Logger.log('[Router] regArray in')
            _.forEach(Controller.regArray, function(el){
                if(matches = el.matcher(path, req, res)){
                    el.handler(req, res, matches);
                    notfound = false;
                    return false;
                }
            });
        }
        if (notfound) {
            if(_.has(Controller.staticMap, '/404')){
                var it = Controller.staticMap['/404'],
                    method = req.method.toLowerCase();
                if(_.has(it, method)){
                    it[method](req, res);
                } else if(_.has(it, UNCERTAIN_METHOD)){
                    it[UNCERTAIN_METHOD](req, res);
                } else {
                    res.status(404).end(path + " not found!!");
                }
            } else {
                res.status(404).end(path + " not found!!");
            }
        }
    }
});

ApplicationContext.app().then(function(app) {
    Controller.init(app);
});
