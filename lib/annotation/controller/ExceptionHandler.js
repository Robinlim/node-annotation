/**
 * Description
 * @Author:      wyw   <wyw.wang@qunar.com>
 * @Date:    2016-06-02 15:27:37
 */
/*@AutoLoad*/
var ExceptionHandler = module.exports = require("./Controller").extend({
    /**
     * compile the model
     * @param  {[Model]} model [annotation data]
     * @return {[type]} [description]
     */
    compile: function(model) {
        var instance = model.instance(),
            po = model.po(); 
        // Error type
        // check po intanceof Error?
        return {
            match: matchFactory(po),
            fun: instance[model.vo()]
        };
    }
}, {
    //annotation name
    name: "ExceptionHandler" 
});


function matchFactory(po){
    if(!po){
        return function(){
            return true;
        }
    } else {
        var pos = po.indexOf('=');
        if(pos > 0){
            var key = po.slice(0,pos),
                value = po.slice(pos+1);
            return function(err){
                return err[key] == value;
            }
        } else {
            return function(err){
                return err.message == po;
            }
        }
    }
} 