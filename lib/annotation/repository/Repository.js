/**
 * User: xin.lin
 * Date: 15-4-22
 */
/*@AutoLoad*/
var ApplicationContext = require('../../ApplicationContext');

module.exports = require("../Annotation").extend({
    /**
     *  the annotation affect
     * @return {[type]} [description]
     */
    execute: function() {
        var po = this.model.po();
        po && ApplicationContext.createBean(po, this.model.classpath());
    }
}, {
    //annotation name
    name: "Repository"
});
