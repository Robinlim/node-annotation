/**
 * User: xin.lin
 * Date: 15-4-12
 * Map
 */

module.exports = Map;
function Map(){}

Map.prototype = {
	constructor: Map,
	/**
	 * add key and value
	 * @param {[type]} key   [description]
	 * @param {[type]} value [description]
	 */
	add: function(key, value) {
		return this.map()[key] = value;
	},
	/**
	 * get the value of key
	 * @param  {[Int]} index [item]
	 * @return {[type]}       [description]
	 */
	get: function(key){
		return this.map()[key];
	},
	/**
	 * delete the key
	 * @param  {[Int]} index [item]
	 * @return {[type]}       [description]
	 */
	del: function(key){
		this._map[key] = null;
	},
	/**
	 * get the map
	 * @return {[type]} [description]
	 */
	map: function() {
		if (!this._map)
			this._map = {};
		return this._map;
	},
	/**
	 * traverse through the map
	 * @param  {Function} fn [description]
	 * @param  {[type]}   context [description]
	 * @return   {[type]} [description]
	 */
	traverse: function(fn, context) {
		var map = this.map();
		for (var attr in map) {
			if(fn.call(context || this, attr, map[attr]) === false)break;
		}
	},
	/**
	 *  doesn't have child
	 * @return {Boolean} [description]
	 */
	isEmpty: function(){
		var has = false;
		for(var attr in map){
			has = true;
			break;
		}
		return has;
	}
};
