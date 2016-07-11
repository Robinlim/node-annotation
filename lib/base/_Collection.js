/**
 * User: xin.lin
 * Date: 15-4-10
 * Collection
 */
var Iterator = require("./_Iterator");

module.exports = Collection;

function Collection(){};

Collection.prototype = {
	constructor: Collection,
	/**
	 * add item
	 * @param {[type]} item [description]
	 */
	add: function(item) {
		this.collection().push(item);
		return item;
	},
	/**
	 * get the item
	 * @param  {[Int]} index [item]
	 * @return {[type]}       [description]
	 */
	get: function(index){
		return this.collection()[index];
	},
	/**
	 * return the last instance
	 * @return {[type]} [description]
	 */
	current: function(){
		var collection = this.collection();
		return collection[collection.length - 1];
	},
	/**
	 * fetch all children in collection
	 * @return {[type]} [description]
	 */
	collection: function() {
		if (!this._children)
			this._children = [];
		return this._children;
	},
	/**
	 * traverse all children
	 * @param  {Function} fn [description]
	 * @param  {[type]}   context [description]
	 * @return   {[type]} [description]
	 */
	traverse: function(fn, context) {
		var collection = this.collection(), len = collection.length;
		for (var i = 0; i < len; i++) {
			if(fn.call(context || this, i, collection[i]) === false)break;
		}
	},
	/**
	 * collection iterator 
	 * @return {[type]} [description]
	 */
	iterator: function(){
		return new Iterator(this.collection());
	},
	/**
	 *  doesn't have child
	 * @return {Boolean} [description]
	 */
	isEmpty: function(){
		return this.collection().length == 0;
	}
};
