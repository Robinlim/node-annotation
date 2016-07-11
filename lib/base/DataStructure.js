/**
 * User: xin.lin
 * Date: 15-4-10
 * Collection
 */
var Collection = require("./_Collection");
var Map =  require("./_Map");
var Utils = require("../Utils");
var dataStructure = require("../Constant").dataStructure;
var structures = {};
structures[dataStructure.Collection] = Collection;
structures[dataStructure.Map] = Map;

module.exports = function(protoType, staticType){
	function create(type){
		return Utils.copyOwnProperty(structures[type]);
	}
	return require("./Class").extend(create(protoType), create(staticType));
};

