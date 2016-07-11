/**
 * Description
 * @Author:      wyw   <wyw.wang@qunar.com>
 * @Date:    2016-06-12 11:58:00
 */

var Iterator = require("./_Iterator");

module.exports = SortedCol;

function SortedCol(order){
    // defalut order is asc(when equal, donot change orginal order)
    // if order is set to true,then desc
    this.comp = order?
    function(a, b){
        return a >= b;
    }:function(a, b){
        return a < b;
    }
};

SortedCol.prototype = {
    constructor: SortedCol,
    /**
     * add item
     * @param {[type]} item [description]
     * @param {[integer]} weight [order weight of the item]
     */
    add: function(item, weight) {
        var weight = (isNaN(weight))?Infinity:weight;
        var it = {
            item: item,
            weight: weight
        };
        var collection = this.collection(), len = collection.length;
        for (var i = 0; i < len; i++) {
            if( this.comp(collection[i].weight, it.weight) ){
                break;
            }
        }
        this.collection().splice(i, 0, it);
        return it;
    },
    /**
     * get the item
     * @param  {[Int]} index [item]
     * @return {[type]}       [description]
     */
    get: function(index){
        return this.collection()[index].item;
    },
    /**
     * return the last instance
     * @return {[type]} [description]
     */
    current: function(){
        var collection = this.collection();
        return collection[collection.length - 1].item;
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
            if(fn.call(context || this, i, collection[i].item, collection[i].weight) === false)break;
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
