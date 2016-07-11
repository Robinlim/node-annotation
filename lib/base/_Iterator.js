/**
 * User: xin.lin
 * Date: 15-4-16
 * Iterator
 */
module.exports = Iterator;

function Iterator(collection) {
    this._collection = collection;
    this._index = -1;
    this._len = collection.length;
}
Iterator.prototype = {
    constructor: Iterator,
    hasNext: function() {
        return this._len != 0 && this._index < this._len - 1;
    },
    hasPre: function() {
        return this._index > 0
    },
    next: function() {
        return this._collection[++this._index];
    },
    pre: function() {
        return this._collection[--this._index];
    },
    index: function(index) {
        if (typeof index == "undefined") {
            return this._index;
        }
        return this._collection[index];
    },
    go: function(index) {
        return this._index = index;
    },
    isEnd: function() {
        return this._index == this._len - 1;
    },
    isFirst: function() {
        return this._index == 0;
    }
};
