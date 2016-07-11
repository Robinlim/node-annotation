/**
 * User: xin.lin
 * Date: 15-4-21
 * auto load the module
 */
'use strict';
/*@AutoLoad("0")*/
var Path = require('path');

var ApplicationContext = require('../../ApplicationContext');

var FILE_REG = /^\.+\//;
module.exports = require("../Annotation").extend({
    /**
     *  the annotation affect
     * @return {[type]} [description]
     */
    execute: function() {
        var model = this.model,
            proxy = model.exports(),
            classpath = model.classpath(),
            po = model.po();
        if (FILE_REG.test(po)) {
            po = Path.join(Path.dirname(classpath), po);
        }
        ApplicationContext.getBean(po || model.vo()).then(function(bean) {
            proxy.instance()[model.vo()] = bean.instance();
        });
    }
}, {
    //annotation name
    name: "Autowired"
});
