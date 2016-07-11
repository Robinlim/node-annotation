/**
 * Description
 * @Author:      wyw   <wyw.wang@qunar.com>
 * @Date:    2016-06-21 15:56:21
 */
/*@AutoLoad*/
var Future = require('fibers/future'),
    utils = require("../../Utils");

Future.prototype.await = Future.prototype.wait;
var AsyncWrap = module.exports = require("../Annotation").extend({
    /**
     *  the annotation affect
     * @return {[type]} [description]
     */
    execute: function() {
        var model = this.model,
            data = this.data,
            vo = model.vo(),
            instance = model.instance();   
            instance[vo] = Future.wrap(instance[vo], data.multi, data.suffix || 'Sync', data.stop);
    },
    compile: function(model){
        var po = model.po();
        if(po && utils.typeofObject(po).value == "[object Object]"){
            return {
                multi: po.multi,
                suffix: po.suffix,
                stop: po.stop
            }
        } else {
            return {};
        }        
    }
}, {
    //annotation name
    name: "AsyncWrap"
});