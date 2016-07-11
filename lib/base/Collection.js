/**
 * User: xin.lin
 * Date: 15-4-10
 * Collection
 */
var Collection = require("./_Collection");
var Utils = require("../Utils");
module.exports = function(protoProps, staticProps){
	function createCollection(){
		return Utils.copyOwnProperty(Collection);
	}
	return require("./Class").extend(protoProps && createCollection() || {}, staticProps && createCollection() || {});
};