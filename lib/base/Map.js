/**
 * User: xin.lin
 * Date: 15-4-12
 * Map
 */
var Map = require("./_Map");
var Utils = require("../Utils");
module.exports = function(protoProps, staticProps){
	function createMap(){
		return Utils.copyOwnProperty(Map);
	}
	return require("./Class").extend(protoProps && createMap() || {}, staticProps && createMap() || {});
};