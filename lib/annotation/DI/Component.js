/**
 * User: xin.lin
 * Date: 15-4-21
 * auto load the module
 */
'use strict';
/*@AutoLoad("0")*/
var ApplicationContext = require('../../ApplicationContext'),
    Path = require("path");

module.exports = require("../Annotation").extend({
    /**
     *  the annotation affect
     * @return {[type]} [description]
     */
    execute: function() {
        var po = this.model.po();
        ApplicationContext.createBean(po, this.model.classpath());
    }
}, {
    //annotation name
    name: "Component"
});
