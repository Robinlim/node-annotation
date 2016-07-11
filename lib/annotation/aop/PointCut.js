/**
 * User: xin.lin
 * Date: 15-12-09
 * point cut of aop
 */
/*@AutoLoad("0")*/
var Path = require('path');

var ApplicationContext = require('../../ApplicationContext'),
    INTERCEPTOR = require('../../INTERCEPTOR');
module.exports = require("./Aspect").extend({
    /**
     *
     * @return {[type]} [description]
     */
    execute: function() {
        var data = this.data,
            watchers = [];
        this.traverse(function(i, watcher) {
            watchers.push({
                advice: watcher.getAdvice(),
                method: data.method,
                interceptor: data.interceptor?INTERCEPTOR[data.interceptor.toUpperCase()]:INTERCEPTOR.METHOD,
                callback: function() {
                    var instance = watcher.model.exports(true);
                    return instance[watcher.model.vo()].apply(instance, arguments);
                }
            });
        });
        if (watchers.length == 0) return;
        ApplicationContext.addExpress(data.module, watchers);
    },
    /**
     *  the annotation affect
     * @return {[type]} [description]
     */
    affectAnnotation: function() {
        this.execute();
    },
    /**
     * compile the model
     * @param  {[Model]} model [annotation data]
     * @return {[type]} [description]
     */
    compile: function(model) {
        var po = model.po();
        if (po && po.module) {
            //in window path is \, but others are \
            po.module = RegExp(po.module.replace('/', Path.sep));
        }
        return po;
    }
}, {
    //annotation name
    name: "PointCut"
});
