/**
 * User: xin.lin
 * Date: 15-12-09
 * point cut of aop
 */
/*@AutoLoad("0")*/
var PROXYCYCLE = require('../../PROXYCYCLE');
module.exports = require("./PointCut").extend({
    /**
     * get the advice
     * @return {[type]} [description]
     */
    getAdvice: function() {
        return PROXYCYCLE.BEFORE;
    }
}, {
    //annotation name
    name: "Before"
});
