/**
 * User: xin.lin
 * Date: 15-4-10
 * control the request and response
 */
/*@AutoLoad*/
var PROXYCYCLE = require('../../PROXYCYCLE');
module.exports = require("./RequestMapping").extend({
    /**
     * automatic transfer json to string
     * @return {[type]} [description]
     */
    execute: function() {
        var model = this.model,
            voParam = model.voParam(),
            resIndex;
        voParam.some(function(item, i) {
            if (item == 'res' || item == 'response') {
                resIndex = i;
                return true;
            }
        });
        model.exports().addMethodInterceptor(model.vo(), PROXYCYCLE.BEFORE, function() {
            if (typeof resIndex !== 'undefined') {
                var res = arguments[resIndex],
                    old = res.end;
                res.end = function() {
                    if (typeof arguments[0] == 'object') {
                        arguments[0] = JSON.stringify(arguments[0]);
                    }
                    old.apply(res, arguments);
                };
            }
        });
    },
    /**
     * compile the model
     * @param  {[Model]} model [annotation data]
     * @return {[type]} [description]
     */
    compile: function(model) {
        model.exports();
    }
}, {
    //annotation name
    name: "ResponseBody"
});
